import axios from 'axios';
import { Task } from '../types/task';

axios.defaults.baseURL = 'http://127.0.0.1:8080/api/v1';

export const fetchUsers = async () => {
  try {
    const response = await axios.get('/users');
    console.log('fetchUsers response:', response.data);
    const data = response.data.data || response.data.users || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
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

export const fetchTasks = async () => {
  try {
    const response = await axios.get('/tasks');
    console.log('fetchTasks response:', response.data);
    const data = response.data.data || response.data.tasks || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('fetchTasks error:', error);
    return [];
  }
};

export const fetchTasksByBoard = async (boardId: string) => {
  try {
    const response = await axios.get(`/boards/${boardId}`);
    console.log('fetchTasksByBoard response:', response.data);
    const data = response.data.data?.tasks || response.data.data || response.data.tasks || response.data;
    console.log('fetchTasksByBoard extracted data:', data);
    // Добавляем boardId к задачам, так как API его не возвращает
    return Array.isArray(data) ? data.map(task => ({ ...task, boardId })) : [];
  } catch (error) {
    console.error('fetchTasksByBoard error:', error);
    return [];
  }
};

export const createTask = async (task: Omit<Task, 'id'>) => {
  try {
    const response = await axios.post('/tasks/create', task);
    console.log('createTask response:', response.data);
    return response.data;
  } catch (error) {
    console.error('createTask error:', error);
    throw error;
  }
};

export const updateTask = async (task: Task) => {
  try {
    const response = await axios.put(`/tasks/${task.id}`, task);
    console.log('updateTask response:', response.data);
    return response.data;
  } catch (error) {
    console.error('updateTask error:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId: string, status: Task['status']) => {
  try {
    const response = await axios.put(`/tasks/updateStatus/${taskId}`, { status });
    console.log('updateTaskStatus response:', response.data);
    return response.data;
  } catch (error) {
    console.error('updateTaskStatus error:', error);
    throw error;
  }
};

export const mapServerUserToClient = (serverUser: any) => ({
  id: serverUser.id?.toString() || '',
  name: serverUser.fullName || serverUser.name || serverUser.username || '',
});

export const mapServerBoardToClient = (serverBoard: any) => ({
  id: serverBoard.id?.toString() || '',
  title: serverBoard.name || serverBoard.title || 'Без названия',
  description: serverBoard.description || '',
});

export const mapServerTaskToClient = (serverTask: any): Task => {
  const normalizeStatus = (status: string) => {
    console.log('Raw task status:', status);
    const statusMap: { [key: string]: Task['status'] } = {
      done: 'done',
      inprogress: 'inprogress',
      todo: 'todo',
      Done: 'done',
      InProgress: 'inprogress',
      Todo: 'todo',
      DONE: 'done',
      INPROGRESS: 'inprogress',
      TODO: 'todo',
    };
    return statusMap[status] || 'todo';
  };

  const normalizePriority = (priority: string) => {
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
    status: serverTask.status ? normalizeStatus(serverTask.status) : 'todo',
    assignee: serverTask.assignee?.toString() || '',
    boardId: serverTask.boardId?.toString() || '', // boardId уже добавлен в fetchTasksByBoard
  };
};
