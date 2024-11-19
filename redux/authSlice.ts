// store/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";

export interface User {
  uid: string;
  email: string;
  name: string;
  isVendor: boolean;
}

const initialState = {
  user: null as User | null,
  isAuthenticated: false,
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
