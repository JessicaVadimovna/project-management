// boardsSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { Board } from '../types/board';

interface BoardsState {
  boards: Board[];
}

const initialState: BoardsState = { boards: [] };

export const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoards: (state, action) => {
      state.boards = action.payload;
    },
  },
});

export const { setBoards } = boardsSlice.actions;
export default boardsSlice.reducer;
