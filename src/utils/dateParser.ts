import {
  getLocalToday,
  getTomorrow,
  getDateAfterDays,
  getNextWeekday,
} from './timeUtils';

export interface ParsedDateTime {
  date?: string; // "YYYY-MM-DD" 格式
  time?: string; // "HH:mm" 格式
  title: string; // 去掉日期时间后的标题
}

/**
 * 解析中文日期时间表达
 */
export function parseDateTime(input: string): ParsedDateTime {
  // 获取当前真实日期（使用本地时区）
  const now = new Date();
  const day = now.getDay(); // 0 = 周日, 1 = 周一, ..., 6 = 周六

  let result: ParsedDateTime = {
    title: input.trim(),
  };

  // 星期解析映射
  const weekdayMap: Record<string, number> = {
    一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 0, 天: 0,
  };

  let foundDate = false;

  // 查找日期关键词
  if (/今天|今日/g.test(input)) {
    result.date = getLocalToday();
    foundDate = true;
    input = input.replace(/今天|今日/g, '').trim();
  } else if (/明天|明日/g.test(input)) {
    result.date = getTomorrow();
    foundDate = true;
    input = input.replace(/明天|明日/g, '').trim();
  } else if (/后天|后日/g.test(input)) {
    result.date = getDateAfterDays(2);
    foundDate = true;
    input = input.replace(/后天|后日/g, '').trim();
  } else if (/大后天/g.test(input)) {
    result.date = getDateAfterDays(3);
    foundDate = true;
    input = input.replace(/大后天/g, '').trim();
  }

  // 查找"下周一"、"下周二"等
  const nextWeekPattern = /下周([一二三四五六日天])/;
  const nextWeekMatch = input.match(nextWeekPattern);
  if (nextWeekMatch && !foundDate) {
    const targetWeekday = weekdayMap[nextWeekMatch[1]];
    result.date = getNextWeekday(targetWeekday);
    foundDate = true;
    input = input.replace(nextWeekPattern, '').trim();
  }

  // 查找"周一"、"周二"等（本周）
  const thisWeekPattern = /([今这])周([一二三四五六日天])/;
  const thisWeekMatch = input.match(thisWeekPattern);
  if (thisWeekMatch && !foundDate) {
    const targetWeekday = weekdayMap[thisWeekMatch[2]];
    const currentDay = now.getDay();
    const daysUntilWeekday = (targetWeekday - currentDay + 7) % 7;
    const daysOffset = daysUntilWeekday === 0 ? 0 : daysUntilWeekday;
    result.date = getDateAfterDays(daysOffset);
    foundDate = true;
    input = input.replace(thisWeekPattern, '').trim();
  }

  // 时间解析
  // 匹配 "9点"、"9:10"、"9:30"、"09:00"、"上午10点"、"下午3点"、"晚上8点"等
  const timePatterns = [
    /(上午|早上|早晨|凌晨)(\d{1,2})[点时点：]/g,
    /(下午|傍晚|晚上|夜里|深夜)(\d{1,2})[点时点：]/g,
    /(\d{1,2}):(\d{2})/g, // "9:10", "09:30"
    /(\d{1,2})点(\d{1,2})分?/g, // "9点10分", "9点10"
    /(\d{1,2})点/g, // "9点", "10点"
  ];

  let foundTime = false;

  // 匹配 "上午10点"、"下午3点" 等
  let match = input.match(/(上午|早上|早晨|凌晨)(\d{1,2})[点时点：]/);
  if (match) {
    let hour = parseInt(match[2]);
    if (hour === 12) hour = 0;
    result.time = `${String(hour).padStart(2, '0')}:00`;
    foundTime = true;
    input = input.replace(match[0], '').trim();
  }

  if (!foundTime) {
    match = input.match(/(下午|傍晚|晚上|夜里|深夜)(\d{1,2})[点时点：]/);
    if (match) {
      let hour = parseInt(match[2]);
      if (hour < 12) hour += 12;
      if (hour === 24) hour = 0;
      result.time = `${String(hour).padStart(2, '0')}:00`;
      foundTime = true;
      input = input.replace(match[0], '').trim();
    }
  }

  // 匹配 "9:10"、"09:30" 等
  if (!foundTime) {
    match = input.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      let hour = parseInt(match[1]);
      const minute = match[2];
      result.time = `${String(hour).padStart(2, '0')}:${minute}`;
      foundTime = true;
      input = input.replace(match[0], '').trim();
    }
  }

  // 匹配 "9点10分"、"9点10" 等
  if (!foundTime) {
    match = input.match(/(\d{1,2})点(\d{1,2})分?/);
    if (match) {
      const hour = parseInt(match[1]);
      const minute = match[2];
      result.time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      foundTime = true;
      input = input.replace(match[0], '').trim();
    }
  }

  // 匹配 "9点"、"10点" 等（只有小时）
  if (!foundTime) {
    match = input.match(/(\d{1,2})点/);
    if (match) {
      const hour = parseInt(match[1]);
      // 如果是下午的时间范围，可能需要加12（但这里默认为上午）
      // 可以通过上下文判断，这里简化处理为24小时制
      result.time = `${String(hour).padStart(2, '0')}:00`;
      foundTime = true;
      input = input.replace(match[0], '').trim();
    }
  }

  // 清理标题，移除多余的空白和标点
  result.title = input
    .replace(/[，,。.！!？?；;：:]/g, '')
    .trim();

  // 如果标题为空，使用原输入
  if (!result.title) {
    result.title = input.trim() || '未命名任务';
  }

  return result;
}

/**
 * 获取日期显示文本（相对日期，如"明天"）
 */
export function getDateDisplayText(dateStr: string): string {
  // 使用本地时区解析日期
  const targetDate = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  targetDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays === 2) return '后天';
  if (diffDays === 3) return '大后天';
  if (diffDays === -1) return '昨天';
  if (diffDays === -2) return '前天';
  
  // 如果是一周内，显示星期
  if (diffDays >= 0 && diffDays < 7) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `下${weekdays[targetDate.getDay()]}（${dateStr}）`;
  }
  
  return dateStr;
}

