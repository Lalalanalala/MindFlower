import { useState, useEffect } from 'react';
import { useTaskStore } from './stores/taskStore';
import { useAlarmStore } from './stores/alarmStore';
import { useBannerStore } from './stores/bannerStore';
import { notify } from './services/notificationService';
import { Home } from './components/Home';
import { TaskList } from './components/TaskList';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AlarmList } from './components/AlarmList';
import { Calendar } from './components/Calendar';
import { Quadrant } from './components/Quadrant';
import { BottomNav, type Page } from './components/BottomNav';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const loadAlarms = useAlarmStore((state) => state.loadAlarms);
  const loadBanner = useBannerStore((state) => state.loadBanner);

  useEffect(() => {
    // 加载数据
    loadTasks();
    loadAlarms();
    loadBanner();
    
    // 请求通知权限
    notify.requestPermission();
  }, [loadTasks, loadAlarms, loadBanner]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'tasks':
        return <TaskList />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'alarms':
        return <AlarmList />;
      case 'calendar':
        return <Calendar />;
      case 'quadrant':
        return <Quadrant />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {renderPage()}
      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
}

export default App;
