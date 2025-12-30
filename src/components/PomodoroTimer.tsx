import { useState, useEffect, useRef } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { notify } from '../services/notificationService';
import type { Task, TaskStep } from '../types';

export function PomodoroTimer() {
  const tasks = useTaskStore((state) => state.tasks);
  const updateStep = useTaskStore((state) => state.updateStep);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分钟
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (isBreak) {
        setTimeLeft(25 * 60);
        setIsBreak(false);
        notify.pomodoroEnd();
      } else {
        // 完成一个番茄钟
        if (selectedStepId && selectedTaskId) {
          // 更新步骤进度（简化处理，实际应该跟踪已完成的番茄钟数量）
          const step = selectedTask?.steps.find((s) => s.id === selectedStepId);
          if (step && step.status !== 'completed') {
            updateStep(selectedTaskId, selectedStepId, { status: 'completed' });
          }
        }
        setTimeLeft(5 * 60); // 5分钟休息
        setIsBreak(true);
        notify.pomodoroEnd();
      }
    }
  }, [timeLeft, isRunning, isBreak, selectedStepId, selectedTaskId, selectedTask, updateStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAvailableSteps = (): Array<{ task: Task; step: TaskStep }> => {
    const available: Array<{ task: Task; step: TaskStep }> = [];
    tasks.forEach((task) => {
      task.steps.forEach((step) => {
        if (step.status === 'pending' || step.status === 'in-progress') {
          available.push({ task, step });
        }
      });
    });
    return available;
  };

  const availableSteps = getAvailableSteps();

  return (
    <div className="px-4 py-8">
      <div className="glass-card p-8 text-center mb-6">
        <div className="text-6xl font-mono mb-4">{formatTime(timeLeft)}</div>
        <div className="text-xl text-gray-600 mb-6">
          {isBreak ? '☕ 休息时间' : '🍅 专注时间'}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setIsRunning(!isRunning);
              if (!isRunning) {
                notify.requestPermission();
              }
            }}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark"
          >
            {isRunning ? '⏸️ 暂停' : '▶️ 开始'}
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(25 * 60);
              setIsBreak(false);
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300"
          >
            🔄 重置
          </button>
        </div>
      </div>

      <div className="glass-card p-4 mb-4">
        <h3 className="font-semibold mb-3">选择任务步骤</h3>
        {availableSteps.length === 0 ? (
          <div className="text-gray-500 text-center py-4">暂无可用任务步骤</div>
        ) : (
          <div className="space-y-2">
            {availableSteps.map(({ task, step }) => (
              <button
                key={step.id}
                onClick={() => {
                  setSelectedTaskId(task.id);
                  setSelectedStepId(step.id);
                  updateStep(task.id, step.id, { status: 'in-progress' });
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedStepId === step.id
                    ? 'bg-primary text-white'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              >
                <div className="font-medium">{step.title}</div>
                <div className="text-sm opacity-80">{task.title}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
