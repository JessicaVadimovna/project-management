import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Board {
  id: string;
  title: string;
}

interface BoardsState {
  boards: Board[];
}

const initialState: BoardsState = {
  boards: [
    { id: '1', title: 'Доска 1' },
    { id: '2', title: 'Доска 2' },
  ],
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    addBoard: (state, action: PayloadAction<Board>) => {
      state.boards.push(action.payload);
    },
  },
});

export const { addBoard } = boardsSlice.actions;
export default boardsSlice.reducer;
