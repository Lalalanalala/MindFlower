import type { Task } from '../types';
import { TaskCard } from './TaskCard';

interface CalendarDetailModalProps {
  date: Date;
  tasks: Task[];
  onClose: () => void;
}

export function CalendarDetailModal({ date, tasks, onClose }: CalendarDetailModalProps) {
  const dateStr = date.toLocaleDateString('zh-CN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-semibold">{dateStr}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📅</div>
              <div>这天没有任务</div>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
