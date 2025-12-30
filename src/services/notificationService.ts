import type { Task } from '../types';

export const notify = {
  async requestPermission() {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied' as const;
  },

  async send(title: string, body: string, options?: { vibrate?: boolean }) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        vibrate: options?.vibrate ? [200, 100, 200] : undefined,
        requireInteraction: true
      });
    }
  },

  // 番茄钟完成
  pomodoroEnd() {
    this.send('🍅 番茄钟完成！', '休息一下吧～');
    try {
      const audio = new Audio('/sounds/ding.mp3');
      audio.play().catch(() => {
        // 忽略音频播放错误
      });
    } catch (e) {
      // 忽略音频错误
    }
  },

  // 任务提醒
  taskReminder(task: Task) {
    this.send('📋 任务提醒', task.title);
  },

  // 闹钟
  alarm(message: string) {
    this.send('⏰ 闹钟', message, { vibrate: true });
    try {
      const audio = new Audio('/sounds/alarm.mp3');
      audio.loop = true;
      audio.play().catch(() => {
        // 忽略音频播放错误
      });
      setTimeout(() => audio.pause(), 30000);
    } catch (e) {
      // 忽略音频错误
    }
  }
};
