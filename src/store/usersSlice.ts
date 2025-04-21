import { createSlice } from '@reduxjs/toolkit';
import { User } from '../types/types';

interface UsersState {
  users: User[];
}

const initialState: UsersState = { users: [] };

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
  },
});

export const { setUsers } = usersSlice.actions;
export default usersSlice.reducer;
