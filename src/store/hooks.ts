import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
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

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector<RootState>;
