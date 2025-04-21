import { createSlice } from '@reduxjs/toolkit';
import { Task } from '../types/task';

interface ModalState {
  isOpen: boolean;
  taskId?: string;
  initialValues?: Partial<Task>;
  redirectToBoard?: string;
  isCreatingFromBoard?: boolean;
}

const initialState: ModalState = {
  isOpen: false,
};

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.isOpen = true;
      state.taskId = action.payload.taskId;
      state.initialValues = action.payload.initialValues;
      state.redirectToBoard = action.payload.redirectToBoard;
      state.isCreatingFromBoard = action.payload.isCreatingFromBoard;
    },
    closeModal: state => {
      state.isOpen = false;
      state.taskId = undefined;
      state.initialValues = undefined;
      state.redirectToBoard = undefined;
      state.isCreatingFromBoard = undefined;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
