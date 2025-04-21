export interface Board {
  id: string;
  title: string;
  description: string;
  taskCount?: number; // Опционально, если потребуется в будущем
}

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'backlog' | 'inprogress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee: string; // ID пользователя
  boardId: string;
  boardName?: string; // Опционально для отображения
}

export interface User {
  id: string;
  name: string; // Используем "name" для простоты, маппим из fullName
  email?: string;
  avatarUrl?: string;
  description?: string;
  tasksCount?: number;
  teamId?: string;
  teamName?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  boardsCount?: number;
  usersCount?: number;
}
