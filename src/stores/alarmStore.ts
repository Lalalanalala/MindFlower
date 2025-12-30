import { create } from 'zustand';
import type { Alarm } from '../types';
import { storage } from '../utils/storage';

interface AlarmStore {
  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  loadAlarms: () => void;
  saveAlarms: () => void;
  checkAlarms: () => void;
}

export const useAlarmStore = create<AlarmStore>((set, get) => ({
  alarms: [],

  addAlarm: (alarm) => {
    set((state) => ({ alarms: [...state.alarms, alarm] }));
    get().saveAlarms();
  },

  updateAlarm: (id, updates) => {
    set((state) => ({
      alarms: state.alarms.map((alarm) =>
        alarm.id === id ? { ...alarm, ...updates } : alarm
      ),
    }));
    get().saveAlarms();
  },

  deleteAlarm: (id) => {
    set((state) => ({
      alarms: state.alarms.filter((alarm) => alarm.id !== id),
    }));
    get().saveAlarms();
  },

  toggleAlarm: (id) => {
    set((state) => ({
      alarms: state.alarms.map((alarm) =>
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      ),
    }));
    get().saveAlarms();
  },

  loadAlarms: () => {
    const alarms = storage.get<Alarm[]>('alarms', []);
    set({ alarms: alarms.map((alarm) => ({
      ...alarm,
      time: new Date(alarm.time),
    })) });
    
    // 启动定时检查
    setInterval(() => get().checkAlarms(), 60000); // 每分钟检查一次
  },

  saveAlarms: () => {
    storage.set('alarms', get().alarms);
  },

  checkAlarms: () => {
    const now = new Date();
    const { alarms } = get();
    
    alarms.forEach((alarm) => {
      if (!alarm.enabled) return;
      
      const alarmTime = new Date(alarm.time);
      const nowHours = now.getHours();
      const nowMinutes = now.getMinutes();
      const alarmHours = alarmTime.getHours();
      const alarmMinutes = alarmTime.getMinutes();
      
      // 检查时间是否匹配（精确到分钟）
      if (nowHours !== alarmHours || nowMinutes !== alarmMinutes) return;
      
      // 检查重复规则
      let shouldTrigger = false;
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      
      switch (alarm.repeat) {
        case 'none':
          // 只触发一次，检查日期是否匹配
          shouldTrigger = now.toDateString() === alarmTime.toDateString();
          break;
        case 'daily':
          shouldTrigger = true;
          break;
        case 'weekdays':
          shouldTrigger = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
          break;
        case 'weekly':
          shouldTrigger = dayOfWeek === alarmTime.getDay();
          break;
      }
      
      if (shouldTrigger && now.getSeconds() < 10) { // 只在每分钟的前10秒触发，避免重复触发
        // 触发闹钟
        import('../services/notificationService').then(({ notify }) => {
          notify.alarm(alarm.message);
        });
      }
    });
  },
}));
