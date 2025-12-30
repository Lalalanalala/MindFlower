import { TaskInput } from './TaskInput';
import { TaskList } from './TaskList';
import { Banner } from './Banner';

export function Home() {
  return (
    <div>
      <Banner />
      <TaskInput />
      <TaskList />
    </div>
  );
}
