const STORAGE_KEY = 'mindflower_data';

export interface StoredData {
  tasks: string;
  alarms: string;
  bannerImage?: string;
}

export const storage = {
  get<T>(key: keyof StoredData, defaultValue: T): T {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return defaultValue;
      const parsed = JSON.parse(data);
      return (parsed[key] ? JSON.parse(parsed[key]) : defaultValue) as T;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: keyof StoredData, value: T) {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : {};
      parsed[key] = JSON.stringify(value);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  }
};
