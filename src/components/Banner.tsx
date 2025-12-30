import { useState, useEffect } from 'react';
import { useBannerStore } from '../stores/bannerStore';
import { useTaskStore } from '../stores/taskStore';
import { useAlarmStore } from '../stores/alarmStore';
import { getLocalToday, formatDate } from '../utils/timeUtils';

export function Banner() {
  const { bannerImage, setBannerImage } = useBannerStore();
  const { tasks } = useTaskStore();
  const { alarms } = useAlarmStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // 立即设置当前时间
    setNow(new Date());

    // 每分钟更新一次
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // 日期时间格式化
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[now.getDay()];

  // 今日统计
  const todayStr = getLocalToday();
  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const taskDate = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
    return formatDate(taskDate) === todayStr;
  });

  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter((t) => t.status === 'completed').length;
  const totalPomodoros = todayTasks.reduce((sum, t) => sum + (t.totalPomodoros || 0), 0);

  const todayAlarms = alarms.filter((a) => {
    if (!a.enabled) return false;
    const alarmDate = a.time instanceof Date ? a.time : new Date(a.time);
    return formatDate(alarmDate) === todayStr;
  }).length;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="w-full px-6 pt-8 pb-6 rounded-b-2xl"
      style={{
        background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 60%, #BAE6FD 100%)',
      }}
    >
      {/* 主要内容区域 */}
      <div className="flex items-center gap-6">
        {/* 左边：照片区域 */}
        <div className="w-28 h-28 flex-shrink-0">
          <label className="cursor-pointer block w-full h-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="w-full h-full rounded-2xl shadow-lg overflow-hidden bg-white/50 border border-white/60">
              {bannerImage ? (
                <img
                  src={bannerImage}
                  alt="合照"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-sky-600 text-sm">💕</span>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* 右边：标题和时间 */}
        <div className="flex-1">
          {/* App 名称 */}
          <h1
            className="text-3xl mb-4"
            style={{
              fontFamily: "'Pacifico', cursive",
              color: '#0369A1',
            }}
          >
            MindFlower
          </h1>

          {/* 时间 - 最醒目 */}
          <p
            className="text-5xl font-bold mb-2"
            style={{ color: '#0EA5E9' }}
          >
            {hours}:{minutes}
          </p>

          {/* 日期 - 弱化 */}
          <p className="text-sm text-gray-500">
            {month}月{day}日 · {weekday}
          </p>
        </div>
      </div>

      {/* 今日统计卡片 - 一行显示 */}
      <div
        className="mt-5 rounded-xl px-4 py-3"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <div className="flex justify-between items-center text-sm" style={{ color: '#475569' }}>
          <span>📋 {totalTasks} 任务</span>
          <span className="text-gray-300">·</span>
          <span>✅ {completedTasks} 完成</span>
          <span className="text-gray-300">·</span>
          <span>🍅 {totalPomodoros} 番茄</span>
          <span className="text-gray-300">·</span>
          <span>⏰ {todayAlarms} 提醒</span>
        </div>
      </div>
    </div>
  );
}
