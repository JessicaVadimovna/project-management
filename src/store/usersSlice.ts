import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
}

interface UsersState {
  users: User[];
}

const initialState: UsersState = {
  users: [
    { id: '1', name: 'Пользователь 1' },
    { id: '2', name: 'Пользователь 2' },
  ],
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
    },
  },
});

export const { setUsers } = usersSlice.actions;
export default usersSlice.reducer;
