// store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the User interface
export interface User {
  uid: string;
  email: string;
  name: string;
  isVendor: boolean;
  image?: string; // Add this field
  price?: string; // Add this field
  vendorType?: string; // Add this field
  description?: string; // Add this field
}

// Define the initial state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

// Create the auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

// Export actions
export const { setUser, clearUser } = authSlice.actions;

// Export selectors for accessing user state
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;

// Export reducer
export default authSlice.reducer;
