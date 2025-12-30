import { useState } from 'react';
import { useAlarmStore } from '../stores/alarmStore';
import { useTaskStore } from '../stores/taskStore';

export function AlarmList() {
  const alarms = useAlarmStore((state) => state.alarms);
  const addAlarm = useAlarmStore((state) => state.addAlarm);
  const updateAlarm = useAlarmStore((state) => state.updateAlarm);
  const deleteAlarm = useAlarmStore((state) => state.deleteAlarm);
  const toggleAlarm = useAlarmStore((state) => state.toggleAlarm);
  const tasks = useTaskStore((state) => state.tasks);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    time: '',
    message: '',
    repeat: 'none' as 'none' | 'daily' | 'weekdays' | 'weekly',
    taskId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [hours, minutes] = formData.time.split(':').map(Number);
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    
    // 如果时间已过，设置为明天
    if (time.getTime() < Date.now()) {
      time.setDate(time.getDate() + 1);
    }

    addAlarm({
      id: crypto.randomUUID(),
      taskId: formData.taskId || undefined,
      time,
      repeat: formData.repeat,
      message: formData.message || '提醒时间到了',
      enabled: true,
    });

    setFormData({ time: '', message: '', repeat: 'none', taskId: '' });
    setShowForm(false);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const repeatLabels = {
    none: '不重复',
    daily: '每天',
    weekdays: '工作日',
    weekly: '每周',
  };

  return (
    <div className="px-4 pb-20">
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark mb-4"
      >
        ➕ 添加闹钟
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-4 mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">时间</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">提醒内容</label>
            <input
              type="text"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="提醒消息"
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">重复</label>
            <select
              value={formData.repeat}
              onChange={(e) => setFormData({ ...formData, repeat: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
            >
              {Object.entries(repeatLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">关联任务（可选）</label>
            <select
              value={formData.taskId}
              onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
            >
              <option value="">无</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              确认
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {alarms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">⏰</div>
            <div>还没有闹钟</div>
          </div>
        ) : (
          alarms.map((alarm) => (
            <div key={alarm.id} className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-2xl font-mono mb-2">{formatTime(alarm.time)}</div>
                  <div className="text-sm text-gray-600 mb-1">{alarm.message}</div>
                  <div className="text-xs text-gray-500">
                    {repeatLabels[alarm.repeat]}
                    {alarm.taskId && (
                      <span className="ml-2">
                        任务: {tasks.find((t) => t.id === alarm.taskId)?.title}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleAlarm(alarm.id)}
                    className={`px-3 py-1 rounded text-sm ${
                      alarm.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {alarm.enabled ? '✓ 开启' : '✗ 关闭'}
                  </button>
                  <button
                    onClick={() => deleteAlarm(alarm.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
