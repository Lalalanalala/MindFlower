/**
 * 时间工具函数 - 使用用户本地时区
 */

// 获取用户本地的今天日期（YYYY-MM-DD 格式）
export function getLocalToday(): string {
  const now = new Date();
  return formatDate(now);
}

// 格式化日期为 YYYY-MM-DD
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 格式化时间为 HH:mm
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 获取明天的日期
export function getTomorrow(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
}

// 获取 N 天后的日期
export function getDateAfterDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

// 获取下周某天的日期（0=周日, 1=周一, ... 6=周六）
export function getNextWeekday(targetDay: number): string {
  const now = new Date();
  const currentDay = now.getDay();
  let daysToAdd = targetDay - currentDay;
  if (daysToAdd <= 0) {
    daysToAdd += 7; // 下一周
  }
  const result = new Date();
  result.setDate(now.getDate() + daysToAdd);
  return formatDate(result);
}

// 获取用户时区名称（用于显示）
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// 获取当前时间的友好显示
// 格式：2024年12月29日 星期日 下午3:30
export function getCurrentTimeDisplay(): string {
  const now = new Date();
  const timeStr = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // 使用12小时制，显示上午/下午
  });
  return timeStr;
}

// 获取完整的时间显示（包含时区信息）
// 格式：2024年12月29日 星期日 下午3:30\n时区：America/Toronto
export function getCurrentTimeDisplayWithTimezone(): string {
  const now = new Date();
  const timeStr = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // 使用12小时制，显示上午/下午
  });
  const timezone = getUserTimezone();
  return `${timeStr}\n时区：${timezone}`;
}

