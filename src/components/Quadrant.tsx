import { useState } from 'react';
import { useTaskStore } from '../stores/taskStore';
import type { Task } from '../types';

type PriorityType = 'urgent-important' | 'important' | 'urgent' | 'neither';

interface QuadrantConfig {
  id: PriorityType;
  label: string;
  emoji: string;
  description: string;
  bgColor: string;
  borderColor: string;
}

const quadrantConfigs: QuadrantConfig[] = [
  {
    id: 'urgent-important',
    label: '紧急且重要',
    emoji: '🔴',
    description: '立即执行',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
  },
  {
    id: 'important',
    label: '重要不紧急',
    emoji: '🟡',
    description: '计划执行',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
  },
  {
    id: 'urgent',
    label: '紧急不重要',
    emoji: '🟠',
    description: '委托他人',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
  },
  {
    id: 'neither',
    label: '不紧急不重要',
    emoji: '⚪',
    description: '考虑删除',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
  },
];

export function Quadrant() {
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const tasksByPriority = {
    'urgent-important': tasks.filter((t) => t.priority === 'urgent-important'),
    'important': tasks.filter((t) => t.priority === 'important'),
    'urgent': tasks.filter((t) => t.priority === 'urgent'),
    'neither': tasks.filter((t) => t.priority === 'neither'),
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetPriority: PriorityType) => {
    e.preventDefault();
    if (draggedTask && draggedTask.priority !== targetPriority) {
      updateTask(draggedTask.id, { priority: targetPriority });
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const renderQuadrant = (config: QuadrantConfig) => {
    const quadrantTasks = tasksByPriority[config.id];

    return (
      <div
        key={config.id}
        className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-4 min-h-[300px]`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, config.id)}
      >
        <div className="mb-3">
          <div className="text-2xl mb-1">{config.emoji}</div>
          <div className="font-semibold text-lg">{config.label}</div>
          <div className="text-sm text-gray-600">({config.description})</div>
          <div className="text-xs text-gray-500 mt-1">
            {quadrantTasks.length} 个任务
          </div>
        </div>

        <div className="space-y-2">
          {quadrantTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              暂无任务
              <br />
              拖拽任务到此处
            </div>
          ) : (
            quadrantTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task)}
                onDragEnd={handleDragEnd}
                className="glass-card p-3 cursor-move hover:shadow-md transition-shadow active:opacity-50"
              >
                <div className="font-medium text-sm mb-1">{task.title}</div>
                {task.description && (
                  <div className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {task.description}
                  </div>
                )}
                <div className="flex flex-wrap gap-1 items-center">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                  {task.dueDate && (
                    <span className="text-xs text-gray-500">
                      📅 {new Date(task.dueDate).toLocaleDateString('zh-CN')}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">
                    🍅 {task.completedPomodoros}/{task.totalPomodoros}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 pb-20">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">四象限视图</h1>
        <p className="text-sm text-gray-600">
          拖拽任务卡片可在不同象限之间移动，自动更新优先级
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrantConfigs.map((config) => renderQuadrant(config))}
      </div>

      {draggedTask && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm">
            正在移动: {draggedTask.title}
          </div>
        </div>
      )}
    </div>
  );
}
