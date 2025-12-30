import { create } from 'zustand';
import type { Task, TaskStep } from '../types';
import { storage } from '../utils/storage';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateStep: (taskId: string, stepId: string, updates: Partial<TaskStep>) => void;
  loadTasks: () => void;
  saveTasks: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],

  addTask: (task) => {
    set((state) => {
      const newTasks = [...state.tasks, task];
      return { tasks: newTasks };
    });
    get().saveTasks();
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
    get().saveTasks();
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
    get().saveTasks();
  },

  updateStep: (taskId, stepId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const newSteps = task.steps.map((step) =>
          step.id === stepId ? { ...step, ...updates } : step
        );
        const completedPomodoros = newSteps
          .filter((s) => s.status === 'completed')
          .reduce((sum, s) => sum + s.pomodoroCount, 0);
        return {
          ...task,
          steps: newSteps,
          completedPomodoros,
          status: completedPomodoros === task.totalPomodoros ? 'completed' : task.status,
        };
      }),
    }));
    get().saveTasks();
  },

  loadTasks: () => {
    const tasks = storage.get<Task[]>('tasks', []);
    set({ tasks: tasks.map((task) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      steps: task.steps.map((step) => ({ ...step })),
    })) });
  },

  saveTasks: () => {
    storage.set('tasks', get().tasks);
  },
}));
