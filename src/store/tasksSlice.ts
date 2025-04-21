import { createSlice } from '@reduxjs/toolkit';
import { Task } from '../types/task';

interface TasksState {
  tasks: Task[];
}

const initialState: TasksState = { tasks: [] };

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
  },
});

export const { setTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
