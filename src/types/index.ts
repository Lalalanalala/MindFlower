export interface TaskStep {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  pomodoroCount: number;
  order: number;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Task {
  id: string;
  rawInput: string;
  title: string;
  description: string;
  steps: TaskStep[];
  totalPomodoros: number;
  completedPomodoros: number;
  priority: 'urgent-important' | 'important' | 'urgent' | 'neither';
  dueDate?: Date;
  startTime?: string; // "HH:mm" 格式
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  tags: string[];
  createdAt: Date;
}

export interface Alarm {
  id: string;
  taskId?: string;
  time: Date;
  repeat: 'none' | 'daily' | 'weekdays' | 'weekly';
  message: string;
  enabled: boolean;
}

export interface AITaskAnalysis {
  title: string;
  description: string;
  priority: 'urgent-important' | 'important' | 'urgent' | 'neither';
  suggestedDueDate?: string; // "YYYY-MM-DD" 格式
  suggestedStartTime?: string; // "HH:mm" 格式（如 "09:10"）
  tags: string[];
  steps: Array<{
    title: string;
    description: string;
    estimatedMinutes: number;
    order: number;
  }>;
  totalMinutes: number;
  pomodoroCount: number;
}
