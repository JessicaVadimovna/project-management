export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'backlog' | 'inprogress' | 'done';
  assignee: string;
  boardId: string;
}
