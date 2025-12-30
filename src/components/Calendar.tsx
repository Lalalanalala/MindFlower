import { useState, useMemo } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { CalendarDetailModal } from './CalendarDetailModal';

type CalendarView = 'day' | 'week' | 'month' | 'year';

export function Calendar() {
  const tasks = useTaskStore((state) => state.tasks);
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const tasksWithDates = useMemo(() => {
    return tasks.filter((t) => t.dueDate);
  }, [tasks]);

  // 日视图
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dateStr = currentDate.toLocaleDateString('zh-CN');
    const dayTasks = tasksWithDates.filter((task) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate).toLocaleDateString('zh-CN') === dateStr;
    });

    // 按时间排序任务
    const sortedTasks = [...dayTasks].sort((a, b) => {
      const aTime = a.startTime || '00:00';
      const bTime = b.startTime || '00:00';
      return aTime.localeCompare(bTime);
    });

    return (
      <div className="px-4 pb-20">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => {
              const prev = new Date(currentDate);
              prev.setDate(prev.getDate() - 1);
              setCurrentDate(prev);
            }}
            className="px-3 py-1 text-primary"
          >
            ←
          </button>
          <div className="text-lg font-semibold">
            {currentDate.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <button
            onClick={() => {
              const next = new Date(currentDate);
              next.setDate(next.getDate() + 1);
              setCurrentDate(next);
            }}
            className="px-3 py-1 text-primary"
          >
            →
          </button>
        </div>

        <div className="space-y-2">
          {hours.map((hour) => {
            // 根据 startTime 筛选任务（如果没有 startTime，则按 dueDate 的小时）
            const hourTasks = sortedTasks.filter((task) => {
              if (task.startTime) {
                const [taskHour] = task.startTime.split(':').map(Number);
                return taskHour === hour;
              } else if (task.dueDate) {
                return new Date(task.dueDate).getHours() === hour;
              }
              return false;
            });

            return (
              <div key={hour} className="glass-card p-3">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="space-y-2">
                  {hourTasks.length === 0 ? (
                    <div className="text-sm text-gray-400">暂无任务</div>
                  ) : (
                    hourTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-2 bg-primary/10 rounded-lg border-l-4 border-primary"
                      >
                        {task.startTime && (
                          <div className="text-xs text-primary font-medium mb-1">
                            {task.startTime}
                          </div>
                        )}
                        <div className="font-medium text-sm">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-gray-600 mt-1 truncate">
                            {task.description}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 周视图
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // 周一
    startOfWeek.setDate(diff);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    return (
      <div className="px-4 pb-20">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => {
              const prev = new Date(currentDate);
              prev.setDate(prev.getDate() - 7);
              setCurrentDate(prev);
            }}
            className="px-3 py-1 text-primary"
          >
            ← 上一周
          </button>
          <div className="text-lg font-semibold">
            {weekDays[0].toLocaleDateString('zh-CN', { month: 'long' })} 第 {getWeekNumber(weekDays[0])} 周
          </div>
          <button
            onClick={() => {
              const next = new Date(currentDate);
              next.setDate(next.getDate() + 7);
              setCurrentDate(next);
            }}
            className="px-3 py-1 text-primary"
          >
            下一周 →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const dateStr = date.toLocaleDateString('zh-CN');
            const dayTasks = tasksWithDates.filter((task) => {
              if (!task.dueDate) return false;
              return new Date(task.dueDate).toLocaleDateString('zh-CN') === dateStr;
            });
            const isToday = date.toLocaleDateString('zh-CN') === new Date().toLocaleDateString('zh-CN');

            return (
              <button
                key={index}
                onClick={() => {
                  setSelectedDate(new Date(date));
                }}
                className={`glass-card p-2 min-h-[120px] text-left hover:shadow-md transition-shadow ${
                  isToday ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary' : 'text-gray-700'}`}>
                  {date.getDate()}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {date.toLocaleDateString('zh-CN', { weekday: 'short' })}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="text-xs p-1 bg-primary/10 rounded truncate"
                      title={task.title}
                    >
                      {task.startTime && `${task.startTime} `}
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayTasks.length - 3} 更多
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 月视图
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay(); // 周一为1

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const prevMonthDays = Array.from({ length: startingDayOfWeek - 1 }, (_, i) => {
      const date = new Date(year, month, 1 - (startingDayOfWeek - 1 - i));
      return { day: date.getDate(), isCurrentMonth: false, date };
    });
    const currentMonthDays = days.map((day) => ({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day),
    }));

    const allDays = [...prevMonthDays, ...currentMonthDays];
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    return (
      <div className="px-4 pb-20">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => {
              const prev = new Date(currentDate);
              prev.setMonth(prev.getMonth() - 1);
              setCurrentDate(prev);
            }}
            className="px-3 py-1 text-primary"
          >
            ← 上月
          </button>
          <div className="text-lg font-semibold">
            {currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
          </div>
          <button
            onClick={() => {
              const next = new Date(currentDate);
              next.setMonth(next.getMonth() + 1);
              setCurrentDate(next);
            }}
            className="px-3 py-1 text-primary"
          >
            下月 →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map(({ day, isCurrentMonth, date }, dayIndex) => {
                const dateStr = date.toLocaleDateString('zh-CN');
                const dayTasks = tasksWithDates.filter((task) => {
                  if (!task.dueDate) return false;
                  return new Date(task.dueDate).toLocaleDateString('zh-CN') === dateStr;
                });
                const isToday = dateStr === new Date().toLocaleDateString('zh-CN');

                return (
                  <button
                    key={dayIndex}
                    onClick={() => {
                      setSelectedDate(new Date(date));
                    }}
                    className={`glass-card p-2 min-h-[100px] text-left hover:shadow-md transition-shadow ${
                      isCurrentMonth ? '' : 'opacity-40'
                    } ${isToday ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-primary' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className="text-xs p-1 bg-primary/10 rounded truncate"
                          title={task.title}
                        >
                          {task.startTime && `${task.startTime} `}
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayTasks.length - 2}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 年视图
  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
      <div className="px-4 pb-20">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => {
              const prev = new Date(currentDate);
              prev.setFullYear(prev.getFullYear() - 1);
              setCurrentDate(prev);
            }}
            className="px-3 py-1 text-primary"
          >
            ← 去年
          </button>
          <div className="text-lg font-semibold">{year} 年</div>
          <button
            onClick={() => {
              const next = new Date(currentDate);
              next.setFullYear(next.getFullYear() + 1);
              setCurrentDate(next);
            }}
            className="px-3 py-1 text-primary"
          >
            明年 →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {months.map((monthIndex) => {
            const monthDate = new Date(year, monthIndex, 1);
            const monthTasks = tasksWithDates.filter((task) => {
              if (!task.dueDate) return false;
              const taskDate = new Date(task.dueDate);
              return taskDate.getFullYear() === year && taskDate.getMonth() === monthIndex;
            });

            return (
              <button
                key={monthIndex}
                onClick={() => {
                  setCurrentDate(monthDate);
                  setView('month');
                }}
                className="glass-card p-4 text-left hover:bg-white/90 transition-colors"
              >
                <div className="font-medium mb-2">
                  {monthDate.toLocaleDateString('zh-CN', { month: 'long' })}
                </div>
                <div className="text-sm text-gray-600">
                  {monthTasks.length} 个任务
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  return (
    <div className="pb-20">
      {/* 视图切换按钮 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex gap-2 justify-center">
          {(['day', 'week', 'month', 'year'] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === v
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {{ day: '日', week: '周', month: '月', year: '年' }[v]}视图
            </button>
          ))}
        </div>
      </div>

      {/* 日历内容 */}
      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
      {view === 'year' && renderYearView()}

      {/* 日期详情模态框 */}
      {selectedDate && (
        <CalendarDetailModal
          date={selectedDate}
          tasks={tasksWithDates.filter((task) => {
            if (!task.dueDate) return false;
            return (
              new Date(task.dueDate).toLocaleDateString('zh-CN') ===
              selectedDate.toLocaleDateString('zh-CN')
            );
          })}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}