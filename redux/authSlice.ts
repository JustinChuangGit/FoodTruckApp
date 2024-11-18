// store/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // Will hold user details (e.g., uid, email, etc.)
  isAuthenticated: false, // Tracks authentication state
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
