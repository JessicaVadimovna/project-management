import axios, { AxiosError } from 'axios';
import { Task, Board, User } from '../types/types';

interface ServerUser {
  id: number | string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  description?: string;
  tasksCount?: number;
  teamId?: number | string;
  teamName?: string;
}

interface ServerBoard {
  id: number | string;
  name?: string;
  description?: string;
  taskCount?: number;
}

interface ServerTask {
  id: number | string;
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  assignee?: {
    id: number | string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
  };
  boardId?: number | string;
  boardName?: string;
}

interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assigneeId?: string | number;
  boardId?: string | number;
}

axios.defaults.baseURL = 'http://127.0.0.1:8080/api/v1';

// Вспомогательная функция для нормализации статуса
const normalizeStatusForServer = (status: Task['status']): string => {
  const statusMap: { [key in Task['status']]: string } = {
    backlog: 'Backlog',
    inprogress: 'InProgress',
    done: 'Done',
  };
  return statusMap[status] || 'Backlog';
};

export const fetchUsers = async (
  signal?: AbortSignal
): Promise<ServerUser[]> => {
  try {
    const response = await axios.get('/users', { signal });
    const data = response.data.data || response.data.users || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
      return [];
    }
    console.error('fetchUsers error:', error);
    return [];
  }
};

export const fetchBoards = async (
  signal?: AbortSignal
): Promise<ServerBoard[]> => {
  try {
    const response = await axios.get('/boards', { signal });
    const data = response.data.data || response.data.boards || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('fetchBoards error:', error);
    throw new Error('Failed to fetch boards');
  }
};

export const fetchTasks = async (
  signal?: AbortSignal
): Promise<ServerTask[]> => {
  try {
    const response = await axios.get('/tasks', { signal });
    const data = response.data.data || response.data.tasks || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
      return [];
    }
    console.error('fetchTasks error:', error);
    return [];
  }
};

export const fetchBoardWithTasks = async (
  boardId: string,
  signal?: AbortSignal
): Promise<{ board: Board | null; tasks: Task[] }> => {
  try {
    const tasksResponse = await axios.get(`/boards/${boardId}`, { signal });
    const boardsResponse = await fetchBoards(signal);
    const boardData = boardsResponse.find(
      (board: ServerBoard) => board.id.toString() === boardId
    );
    const tasksData =
      tasksResponse.data.data ||
      tasksResponse.data.tasks ||
      tasksResponse.data ||
      [];
    const tasks = Array.isArray(tasksData)
      ? tasksData.map((serverTask: ServerTask) =>
          mapServerTaskToClient(serverTask)
        )
      : [];
    const board = boardData
      ? mapServerBoardToClient(boardData)
      : { id: boardId, title: `Доска ${boardId}`, description: '' };
    return { board, tasks };
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
      return { board: null, tasks: [] };
    }
    console.error('fetchBoardWithTasks error:', error);
    return { board: null, tasks: [] };
  }
};

export const createTask = async (
  task: Omit<Task, 'id'>
): Promise<TaskResponse> => {
  try {
    const assigneeId = parseInt(task.assignee);
    const boardId = parseInt(task.boardId);
    const status = normalizeStatusForServer(task.status);
    const priority =
      task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    const payload = {
      assigneeId,
      boardId,
      description: task.description,
      priority,
      status,
      title: task.title,
    };
    const response = await axios.post('/tasks/create', payload);
    return response.data as TaskResponse;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      'createTask error:',
      axiosError.message,
      axiosError.response?.data
    );
    throw error;
  }
};

export const updateTask = async (task: Task): Promise<TaskResponse> => {
  try {
    const assigneeId = parseInt(task.assignee);
    const boardId = parseInt(task.boardId);
    const status = normalizeStatusForServer(task.status);
    const priority =
      task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    const payload = {
      assigneeId,
      description: task.description,
      priority,
      status,
      title: task.title,
    };
    const response = await axios.put(`/tasks/update/${task.id}`, payload);
    return response.data as TaskResponse;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      'updateTask error:',
      axiosError.message,
      axiosError.response?.data
    );
    throw error;
  }
};

export const updateTaskStatus = async (
  taskId: string,
  status: Task['status']
): Promise<TaskResponse> => {
  try {
    const formattedStatus = normalizeStatusForServer(status);
    const payload = { status: formattedStatus };
    const response = await axios.put(`/tasks/updateStatus/${taskId}`, payload);
    return response.data as TaskResponse;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      'updateTaskStatus error:',
      axiosError.message,
      axiosError.response?.data
    );
    throw error;
  }
};

export const mapServerUserToClient = (serverUser: ServerUser): User => ({
  id: serverUser.id?.toString() || '',
  name: serverUser.fullName || '',
  email: serverUser.email || '',
  avatarUrl: serverUser.avatarUrl || '',
  description: serverUser.description || '',
  tasksCount: serverUser.tasksCount || 0,
  teamId: serverUser.teamId?.toString() || '',
  teamName: serverUser.teamName || '',
});

export const mapServerBoardToClient = (serverBoard: ServerBoard): Board => ({
  id: serverBoard.id?.toString() || '',
  title: serverBoard.name || 'Без названия',
  description: serverBoard.description || '',
  taskCount: serverBoard.taskCount || 0,
});

export const mapServerTaskToClient = (serverTask: ServerTask): Task => {
  const normalizeStatus = (status?: string): Task['status'] => {
    const statusMap: { [key: string]: Task['status'] } = {
      Done: 'done',
      InProgress: 'inprogress',
      Backlog: 'backlog',
      done: 'done',
      inprogress: 'inprogress',
      backlog: 'backlog',
    };
    return status ? statusMap[status] || 'backlog' : 'backlog';
  };

  const normalizePriority = (priority?: string): Task['priority'] => {
    const priorityMap: { [key: string]: Task['priority'] } = {
      Low: 'low',
      Medium: 'medium',
      High: 'high',
      low: 'low',
      medium: 'medium',
      high: 'high',
    };
    return priority ? priorityMap[priority] || 'medium' : 'medium';
  };

  return {
    id: serverTask.id?.toString() || '',
    title: serverTask.title || '',
    description: serverTask.description || '',
    priority: normalizePriority(serverTask.priority),
    status: normalizeStatus(serverTask.status),
    assignee: serverTask.assignee?.id?.toString() || '',
    boardId: serverTask.boardId?.toString() || '',
    boardName: serverTask.boardName || '',
  };
};
