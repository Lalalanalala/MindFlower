import { useState } from 'react';
import type { Task } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { useAlarmStore } from '../stores/alarmStore';

interface TaskCardProps {
  task: Task;
}

const priorityLabels = {
  'urgent-important': '🎯 重要且紧急',
  'important': '📌 重要',
  'urgent': '⚡ 紧急',
  'neither': '📝 普通',
};

const priorityColors = {
  'urgent-important': 'bg-red-100 text-red-700',
  'important': 'bg-blue-100 text-blue-700',
  'urgent': 'bg-orange-100 text-orange-700',
  'neither': 'bg-gray-100 text-gray-700',
};

export function TaskCard({ task }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { deleteTask, updateStep } = useTaskStore();
  const alarms = useAlarmStore((state) => state.alarms);
  
  // 查找关联的闹钟
  const relatedAlarms = alarms.filter((alarm) => alarm.taskId === task.id);

  const toggleStep = (stepId: string, currentStatus: Task['steps'][0]['status']) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateStep(task.id, stepId, { status: newStatus });
  };

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`px-2 py-1 rounded text-xs ${priorityColors[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
            {task.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs">
                #{tag}
              </span>
            ))}
            <span className="text-xs text-gray-500">
              🍅 {task.completedPomodoros}/{task.totalPomodoros}
            </span>
            {task.dueDate && (
              <span className="text-xs text-gray-500">
                📅 {new Date(task.dueDate).toLocaleDateString('zh-CN')}
              </span>
            )}
            {task.startTime && (
              <span className="text-xs text-gray-500">
                🕐 {task.startTime}
              </span>
            )}
            {relatedAlarms.length > 0 && (
              <span className="text-xs text-primary">
                ⏰ {relatedAlarms.length} 个提醒
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => deleteTask(task.id)}
          className="text-red-400 hover:text-red-600 ml-2"
        >
          🗑️
        </button>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-primary hover:underline mb-2"
      >
        {expanded ? '收起步骤' : `展开步骤 (${task.steps.length})`}
      </button>

      {expanded && (
        <div className="space-y-2 mt-3 border-t pt-3">
          {task.steps.map((step) => (
            <div
              key={step.id}
              className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/50"
            >
              <input
                type="checkbox"
                checked={step.status === 'completed'}
                onChange={() => toggleStep(step.id, step.status)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium">{step.title}</div>
                <div className="text-sm text-gray-600">{step.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  🍅×{step.pomodoroCount} · {step.estimatedMinutes}分钟
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
