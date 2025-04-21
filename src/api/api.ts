import axios, { AxiosError } from 'axios';
import { Task } from '../types/task';

interface ServerUser {
  id: number | string;
  fullName?: string;
  name?: string;
  username?: string;
}

interface ServerBoard {
  id: number | string;
  name?: string;
  title?: string;
  description?: string;
}

interface ServerTask {
  id: number | string;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  assignee?: { id: number | string };
  boardId?: number | string;
}

axios.defaults.baseURL = 'http://127.0.0.1:8080/api/v1';

export const fetchUsers = async (signal?: AbortSignal) => {
  try {
    const response = await axios.get('/users', { signal });
    console.log('fetchUsers response:', response.data);
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

export const fetchBoards = async () => {
  try {
    const response = await axios.get('/boards');
    console.log('fetchBoards response:', response.data);
    const data = response.data.data || response.data.boards || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('fetchBoards error:', error);
    throw new Error('Failed to fetch boards');
  }
};

export const fetchTasks = async (signal?: AbortSignal) => {
  try {
    const response = await axios.get('/tasks', { signal });
    console.log('fetchTasks response:', response.data);
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

export const fetchBoardWithTasks = async (boardId: string, signal?: AbortSignal) => {
  try {
    // Запрашиваем задачи для доски
    const tasksResponse = await axios.get(`/boards/${boardId}`, { signal });
    console.log('fetchBoardWithTasks response:', tasksResponse.data);

    // Запрашиваем информацию о всех досках, чтобы найти нужную
    const boardsResponse = await fetchBoards();
    const boardData = boardsResponse.find((board: ServerBoard) => board.id.toString() === boardId);

    // Извлекаем задачи из ответа
    const tasksData = tasksResponse.data.data || tasksResponse.data.tasks || tasksResponse.data || [];
    const tasks = Array.isArray(tasksData) ? tasksData.map(mapServerTaskToClient) : [];

    // Маппим данные доски
    const board = boardData ? mapServerBoardToClient(boardData) : { id: boardId, title: `Доска ${boardId}`, description: '' };

    console.log('fetchBoardWithTasks board:', board);
    console.log('fetchBoardWithTasks tasks:', tasks);

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

export const createTask = async (task: Omit<Task, 'id'>) => {
  try {
    const assigneeId = parseInt(task.assignee);
    if (!assigneeId || assigneeId <= 0) {
      throw new Error('Assignee ID must be a positive number');
    }
    const boardId = parseInt(task.boardId);
    if (!boardId || boardId <= 0) {
      throw new Error('Board ID must be a positive number');
    }
    const status = task.status === 'backlog' ? 'Backlog' :
                   task.status === 'inprogress' ? 'InProgress' : 'Done';
    const payload = {
      assigneeId,
      boardId,
      description: task.description,
      priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
      status,
      title: task.title,
    };
    console.log('createTask payload:', payload);
    const response = await axios.post('/tasks/create', payload);
    console.log('createTask response:', response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('createTask error:', axiosError.message, axiosError.response?.data);
    throw error;
  }
};

export const updateTask = async (task: Task) => {
  try {
    const assigneeId = parseInt(task.assignee);
    if (!assigneeId || assigneeId <= 0) {
      throw new Error('Assignee ID must be a positive number');
    }
    const boardId = parseInt(task.boardId);
    if (!boardId || boardId <= 0) {
      throw new Error('Board ID must be a positive number');
    }
    const status = task.status === 'backlog' ? 'Backlog' :
                   task.status === 'inprogress' ? 'InProgress' : 'Done';
    const payload = {
      assigneeId,
      description: task.description,
      priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
      status,
      title: task.title,
    };
    console.log('updateTask payload:', payload);
    const response = await axios.put(`/tasks/update/${task.id}`, payload);
    console.log('updateTask response:', response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('updateTask error details:', axiosError.message, axiosError.response?.data);
    throw error;
  }
};

export const updateTaskStatus = async (taskId: string, status: Task['status']) => {
  try {
    const formattedStatus = status === 'backlog' ? 'Backlog' :
                           status === 'inprogress' ? 'InProgress' : 'Done';
    const payload = {
      status: formattedStatus,
    };
    console.log('updateTaskStatus payload:', payload);
    const response = await axios.put(`/tasks/updateStatus/${taskId}`, payload);
    console.log('updateTaskStatus response:', response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('updateTaskStatus error details:', axiosError.message, axiosError.response?.data);
    throw error;
  }
};

export const mapServerUserToClient = (serverUser: ServerUser) => ({
  id: serverUser.id?.toString() || '',
  name: serverUser.fullName || serverUser.name || serverUser.username || '',
});

export const mapServerBoardToClient = (serverBoard: ServerBoard) => ({
  id: serverBoard.id?.toString() || '',
  title: serverBoard.name || serverBoard.title || 'Без названия',
  description: serverBoard.description || '',
});

export const mapServerTaskToClient = (serverTask: ServerTask): Task => {
  const normalizeStatus = (status: string): Task['status'] => {
    console.log('Raw task status:', status);
    const statusMap: { [key: string]: Task['status'] } = {
      done: 'done',
      inprogress: 'inprogress',
      backlog: 'backlog',
      Done: 'done',
      InProgress: 'inprogress',
      Backlog: 'backlog',
      DONE: 'done',
      INPROGRESS: 'inprogress',
      BACKLOG: 'backlog',
    };
    return statusMap[status] || 'backlog';
  };

  const normalizePriority = (priority: string): Task['priority'] => {
    console.log('Raw task priority:', priority);
    const priorityMap: { [key: string]: Task['priority'] } = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      Low: 'low',
      Medium: 'medium',
      High: 'high',
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
    };
    return priorityMap[priority] || 'medium';
  };

  return {
    id: serverTask.id?.toString() || '',
    title: serverTask.title || '',
    description: serverTask.description || '',
    priority: serverTask.priority ? normalizePriority(serverTask.priority) : 'medium',
    status: serverTask.status ? normalizeStatus(serverTask.status) : 'backlog',
    assignee: serverTask.assignee?.id?.toString() || '',
    boardId: serverTask.boardId?.toString() || '',
  };
};
