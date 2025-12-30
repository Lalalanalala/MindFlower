import { formatDate } from './timeUtils';

export interface ParsedDateTime {
  date?: string; // "YYYY-MM-DD" 格式
  time?: string; // "HH:mm" 格式
  title: string; // 去掉日期时间后的标题
  hasDate: boolean;
  hasTime: boolean;
}

/**
 * 解析中文日期时间表达
 */
export function parseDateTime(input: string): ParsedDateTime {
  let date: string | undefined;
  let time: string | undefined;
  let remainingText = input;

  const now = new Date();
  const currentYear = now.getFullYear();

  // 1. 匹配完整日期：2026年1月3日 或 2026年01月03日
  const fullDateRegex = /(\d{4})年(\d{1,2})月(\d{1,2})[日号]/;
  const fullDateMatch = remainingText.match(fullDateRegex);
  if (fullDateMatch) {
    const year = parseInt(fullDateMatch[1]);
    const month = String(parseInt(fullDateMatch[2])).padStart(2, '0');
    const day = String(parseInt(fullDateMatch[3])).padStart(2, '0');
    date = `${year}-${month}-${day}`;
    remainingText = remainingText.replace(fullDateRegex, '');
  }

  // 2. 匹配短日期：1月3日 或 1月3号（必须在完整日期之后匹配，避免重复）
  if (!date) {
    const shortDateRegex = /(\d{1,2})月(\d{1,2})[日号]/;
    const shortDateMatch = remainingText.match(shortDateRegex);
    if (shortDateMatch) {
      const month = parseInt(shortDateMatch[1]);
      const day = parseInt(shortDateMatch[2]);
      let year = currentYear;
      
      // 如果日期已过，使用明年
      const targetDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      targetDate.setHours(0, 0, 0, 0);
      if (targetDate < today) {
        year = currentYear + 1;
      }
      
      date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      remainingText = remainingText.replace(shortDateRegex, '');
    }
  }

  // 3. 匹配相对日期：今天、明天、后天、大后天
  if (!date) {
    const relativeDays: { [key: string]: number } = {
      '今天': 0,
      '今日': 0,
      '明天': 1,
      '明日': 1,
      '后天': 2,
      '后日': 2,
      '大后天': 3,
    };
    
    for (const [keyword, daysToAdd] of Object.entries(relativeDays)) {
      if (remainingText.includes(keyword)) {
        const targetDate = new Date(now.getTime());
        targetDate.setDate(now.getDate() + daysToAdd);
        date = formatDate(targetDate);
        remainingText = remainingText.replace(keyword, '');
        break;
      }
    }
  }

  // 4. 匹配周几：周六、周日、星期一、下周六
  if (!date) {
    const weekdayMap: { [key: string]: number } = {
      '日': 0, '天': 0,
      '一': 1,
      '二': 2,
      '三': 3,
      '四': 4,
      '五': 5,
      '六': 6,
    };

    // 下周X 或 下个周X
    const nextWeekRegex = /下(?:个)?(?:周|星期)([日天一二三四五六])/;
    const nextWeekMatch = remainingText.match(nextWeekRegex);
    if (nextWeekMatch) {
      const targetDay = weekdayMap[nextWeekMatch[1]];
      const currentDay = now.getDay();
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7; // 如果已过，指下周
      const targetDate = new Date(now.getTime());
      targetDate.setDate(now.getDate() + diff);
      date = formatDate(targetDate);
      remainingText = remainingText.replace(nextWeekRegex, '');
    }

    // 这周X 或 周X 或 星期X
    if (!date) {
      const thisWeekRegex = /(?:这(?:个)?)?(?:周|星期)([日天一二三四五六])/;
      const thisWeekMatch = remainingText.match(thisWeekRegex);
      if (thisWeekMatch) {
        const targetDay = weekdayMap[thisWeekMatch[1]];
        const currentDay = now.getDay();
        let diff = targetDay - currentDay;
        if (diff < 0) diff += 7; // 如果已过，指下一个
        const targetDate = new Date(now.getTime());
        targetDate.setDate(now.getDate() + diff);
        date = formatDate(targetDate);
        remainingText = remainingText.replace(thisWeekRegex, '');
      } else {
        // 单独匹配"周六"、"周日"等（匹配"周X"或"星期X"格式）
        const standaloneWeekdayRegex = /(?:周|星期)([日天一二三四五六])/;
        const standaloneMatch = remainingText.match(standaloneWeekdayRegex);
        if (standaloneMatch && standaloneMatch[1]) {
          const targetDay = weekdayMap[standaloneMatch[1]];
          if (targetDay !== undefined) {
            const currentDay = now.getDay();
            let diff = targetDay - currentDay;
            if (diff < 0) diff += 7; // 如果已过，指下一个
            const targetDate = new Date(now.getTime());
            targetDate.setDate(now.getDate() + diff);
            date = formatDate(targetDate);
            remainingText = remainingText.replace(standaloneWeekdayRegex, '');
          }
        }
      }
    }
  }

  // 5. 匹配时间：9点、9:30、上午10点、下午3点
  const timePatterns = [
    { regex: /上午(\d{1,2})(?::(\d{2}))?(?:点|时)?/, offset: 0 },
    { regex: /早上(\d{1,2})(?::(\d{2}))?(?:点|时)?/, offset: 0 },
    { regex: /早晨(\d{1,2})(?::(\d{2}))?(?:点|时)?/, offset: 0 },
    { regex: /凌晨(\d{1,2})(?::(\d{2}))?(?:点|时)?/, offset: 0 },
    { regex: /下午(\d{1,2})(?::(\d{2}))?(?:点|时)?/, offset: 12 },
    { regex: /傍晚(\d{1,2})(?::(\d{2}))?(?:点|时)?/, offset: 12 },
    { regex: /晚上(\d{1,2})(?::(\d{2}))?(?:点|时)?/, offset: 12 },
    { regex: /夜里(\d{1,2})(?::(\d{2}))?(?:点|时)?/, offset: 12 },
    { regex: /深夜(\d{1,2})(?::(\d{2}))?(?:点|时)?/, offset: 12 },
    { regex: /(\d{1,2}):(\d{2})/, offset: 0 },
    { regex: /(\d{1,2})点(\d{1,2})分?/, offset: 0 },
    { regex: /(\d{1,2})点/, offset: 0 },
  ];

  for (const { regex, offset } of timePatterns) {
    const timeMatch = remainingText.match(regex);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      
      if (offset > 0 && hours < 12) {
        hours += offset;
      }
      if (hours === 24) hours = 0;
      
      time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      remainingText = remainingText.replace(regex, '');
      break;
    }
  }

  // 6. 如果有日期但没时间，默认设置为 9:00
  if (date && !time) {
    time = '09:00';
  }

  // 清理标题
  remainingText = remainingText
    .replace(/提醒我?/g, '')
    .replace(/记得/g, '')
    .replace(/要/g, '')
    .replace(/[，,。.！!？?；;：:]/g, '')
    .trim();

  return {
    date,
    time,
    title: remainingText || input,
    hasDate: !!date,
    hasTime: !!time,
  };
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
