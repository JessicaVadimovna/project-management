import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './tasksSlice';
import boardsReducer from './boardsSlice';
import usersReducer from './usersSlice';
import modalReducer from './modalSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    boards: boardsReducer,
    users: usersReducer,
    modal: modalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
