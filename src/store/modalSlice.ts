import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../types/task';

interface ModalState {
  isOpen: boolean;
  taskId: string | null;
  initialValues: Partial<Omit<Task, 'id'>>;
  redirectToBoard: string | null;
}

const initialState: ModalState = {
  isOpen: false,
  taskId: null,
  initialValues: {},
  redirectToBoard: null,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (
      state,
      action: PayloadAction<{
        taskId?: string;
        initialValues?: Partial<Omit<Task, 'id'>>;
        redirectToBoard?: string;
      }>
    ) => {
      state.isOpen = true;
      state.taskId = action.payload.taskId || null;
      state.initialValues = action.payload.initialValues || {};
      state.redirectToBoard = action.payload.redirectToBoard || null;
    },
    closeModal: state => {
      state.isOpen = false;
      state.taskId = null;
      state.initialValues = {};
      state.redirectToBoard = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
