import { useTaskStore } from '../stores/taskStore';
import { TaskCard } from './TaskCard';

export function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);

  const sortedTasks = [...tasks].sort((a, b) => {
    // 按状态排序：in-progress > pending > completed > overdue
    const statusOrder = { 'in-progress': 0, 'pending': 1, 'completed': 3, 'overdue': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">📋</div>
        <div>还没有任务，输入任务描述开始吧～</div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-20">
      {sortedTasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
