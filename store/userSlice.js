// src/features/user/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: localStorage.getItem('isLogin') === 'true',
  user: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state) => {
      state.isLoggedIn = true;
      localStorage.setItem('isLogin', 'true');
    },
    logout: (state) => {
      state.isLoggedIn = false;
      localStorage.setItem('isLogin', 'false');
    },
    // You can add more user-related actions here as needed
  }
});

export const { login, logout } = userSlice.actions;

// Selectors
export const selectIsLoggedIn = (state) => state.user.isLoggedIn;

export default userSlice.reducer;