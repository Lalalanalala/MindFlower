import { useState } from 'react';
import { analyzeTask } from '../services/aiService';
import { useTaskStore } from '../stores/taskStore';
import { useAlarmStore } from '../stores/alarmStore';
import { parseDateTime, getDateDisplayText } from '../utils/dateParser';
import type { Task, TaskStep, Alarm } from '../types';

interface TaskInputProps {
  onAnalyzed?: () => void;
}

export function TaskInput({ onAnalyzed }: TaskInputProps) {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<{
    title: string;
    date?: string;
    time?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addTask = useTaskStore((state) => state.addTask);
  const addAlarm = useAlarmStore((state) => state.addAlarm);

  // 处理输入提交（按 Enter 后先解析，显示预览）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // 先解析日期时间
    const parsed = parseDateTime(input.trim());
    setPreview({
      title: parsed.title || input.trim(),
      date: parsed.date,
      time: parsed.time,
    });
    setError(null);
  };

  // 快速创建（不使用 AI）
  const handleQuickCreate = () => {
    if (!preview) return;

    const taskId = crypto.randomUUID();
    const task: Task = {
      id: taskId,
      rawInput: input.trim(),
      title: preview.title,
      description: '',
      steps: [],
      totalPomodoros: 0,
      completedPomodoros: 0,
      priority: 'neither', // 默认优先级
      dueDate: preview.date
        ? new Date(preview.date + 'T00:00:00')
        : undefined,
      startTime: preview.time,
      status: 'pending',
      tags: [],
      createdAt: new Date(),
    };

    addTask(task);

    // 如果有具体时间，自动创建闹钟（提前10分钟提醒）
    if (preview.date && preview.time) {
      const [hours, minutes] = preview.time.split(':').map(Number);
      // 使用 ISO 格式创建日期，避免时区问题
      const alarmDate = new Date(preview.date + 'T' + preview.time + ':00');

      // 提前10分钟
      const alarmTime = new Date(alarmDate);
      alarmTime.setMinutes(alarmTime.getMinutes() - 10);

      // 如果提醒时间已过，设置为任务时间（不再提前）
      if (alarmTime.getTime() < Date.now()) {
        alarmTime.setTime(alarmDate.getTime());
      }

      const alarm: Alarm = {
        id: crypto.randomUUID(),
        taskId: taskId,
        time: alarmTime,
        repeat: 'none',
        message: preview.title,
        enabled: true,
      };

      addAlarm(alarm);
    }

    // 重置
    setInput('');
    setPreview(null);
    onAnalyzed?.();
  };

  // AI 拆解（使用 AI）
  const handleAICreate = async () => {
    if (!preview) return;

    setLoading(true);
    setError(null);

    try {
      const analysis = await analyzeTask(input.trim());

      // 转换AI分析结果为Task对象
      const steps: TaskStep[] = analysis.steps.map((step) => ({
        id: crypto.randomUUID(),
        title: step.title,
        description: step.description,
        estimatedMinutes: step.estimatedMinutes,
        pomodoroCount: Math.ceil(step.estimatedMinutes / 25),
        order: step.order,
        status: 'pending' as const,
      }));

      const taskId = crypto.randomUUID();
      const task: Task = {
        id: taskId,
        rawInput: input.trim(),
        title: analysis.title,
        description: analysis.description,
        steps,
        totalPomodoros: analysis.pomodoroCount,
        completedPomodoros: 0,
        priority: analysis.priority,
        // 优先使用 AI 解析的日期时间，如果没有则使用本地解析的结果
        dueDate: analysis.suggestedDueDate
          ? new Date(analysis.suggestedDueDate + 'T00:00:00')
          : preview.date
          ? new Date(preview.date + 'T00:00:00')
          : undefined,
        startTime: analysis.suggestedStartTime || preview.time,
        status: 'pending',
        tags: analysis.tags,
        createdAt: new Date(),
      };

      addTask(task);

      // 如果有具体时间，自动创建闹钟（提前10分钟提醒）
      const taskDate = analysis.suggestedDueDate || preview.date;
      const taskTime = analysis.suggestedStartTime || preview.time;
      if (taskDate && taskTime) {
        // 使用 ISO 格式创建日期，避免时区问题
        const alarmDate = new Date(taskDate + 'T' + taskTime + ':00');

        // 提前10分钟
        const alarmTime = new Date(alarmDate);
        alarmTime.setMinutes(alarmTime.getMinutes() - 10);

        // 如果提醒时间已过，设置为任务时间（不再提前）
        if (alarmTime.getTime() < Date.now()) {
          alarmTime.setTime(alarmDate.getTime());
        }

        const alarm: Alarm = {
          id: crypto.randomUUID(),
          taskId: taskId,
          time: alarmTime,
          repeat: 'none',
          message: analysis.title,
          enabled: true,
        };

        addAlarm(alarm);
      }

      // 重置
      setInput('');
      setPreview(null);
      onAnalyzed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI分析失败，请重试');
      console.error('Task analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setPreview(null); // 输入变化时清除预览
              setError(null);
            }}
            placeholder="💡 输入任务描述，按 Enter 预览..."
            className="w-full px-4 py-3 rounded-xl glass-card border-0 focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={loading}
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
            </div>
          )}
        </div>
        {error && <div className="text-red-500 text-sm px-2">{error}</div>}

        {/* 预览卡片 */}
        {preview && !loading && (
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📝</span>
              <h3 className="font-semibold text-lg">任务预览</h3>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">标题：</span>
                <span className="font-medium">{preview.title || '未命名任务'}</span>
              </div>
              {preview.date && (
                <div>
                  <span className="text-sm text-gray-600">📅 日期：</span>
                  <span className="font-medium">
                    {preview.date}（{getDateDisplayText(preview.date)}）
                  </span>
                </div>
              )}
              {preview.time && (
                <div>
                  <span className="text-sm text-gray-600">⏰ 时间：</span>
                  <span className="font-medium">{preview.time}</span>
                </div>
              )}
              {!preview.date && !preview.time && (
                <div className="text-sm text-gray-400 italic">
                  💡 未检测到日期时间，将创建为普通任务
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={handleQuickCreate}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors flex flex-col items-center justify-center"
              >
                <span className="text-lg mb-1">⚡</span>
                <span>快速创建</span>
                <span className="text-xs opacity-80 mt-1">(免费)</span>
              </button>
              <button
                type="button"
                onClick={handleAICreate}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center"
              >
                <span className="text-lg mb-1">🤖</span>
                <span>AI 拆解步骤</span>
                <span className="text-xs opacity-80 mt-1">(消耗 API)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setError(null);
              }}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              取消
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
