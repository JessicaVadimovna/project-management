import tasksReducer, { setTasks } from '../store/tasksSlice';

describe('tasksSlice', () => {
  it('должен устанавливать задачи', () => {
    const initialState = { tasks: [] };
    const action = setTasks([{ id: '1', title: 'Task One', status: 'backlog', priority: 'medium', assignee: '1', boardId: '1' }]);
    const newState = tasksReducer(initialState, action);
    expect(newState.tasks).toHaveLength(1);
    expect(newState.tasks[0].title).toBe('Task One');
  });
});