export type Page = 'home' | 'tasks' | 'pomodoro' | 'alarms' | 'calendar' | 'quadrant';

interface BottomNavProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function BottomNav({ currentPage, onPageChange }: BottomNavProps) {
  const navItems: Array<{ id: Page; icon: string; label: string }> = [
    { id: 'home', icon: '🏠', label: '首页' },
    { id: 'tasks', icon: '📋', label: '任务' },
    { id: 'pomodoro', icon: '🍅', label: '番茄' },
    { id: 'alarms', icon: '⏰', label: '闹钟' },
    { id: 'calendar', icon: '📅', label: '日历' },
    { id: 'quadrant', icon: '⚡', label: '四象限' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              currentPage === item.id
                ? 'text-primary'
                : 'text-gray-500'
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
