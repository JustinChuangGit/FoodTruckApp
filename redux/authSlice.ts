// store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MenuItem } from "@/constants/types";

// Define the User interface
export interface User {
  uid: string;
  email: string;
  name: string;
  isVendor: boolean;
  image?: string;
  price?: string;
  vendorType?: string;
  description?: string;
  menu?: MenuItem[]; // Add menu field
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
      console.log("Redux State after setUser:", JSON.stringify(state, null, 2));
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      console.log("Redux State after clearUser:", JSON.stringify(state, null, 2));
    },
    updateMenu: (state, action: PayloadAction<MenuItem[]>) => {
      if (state.user) {
        state.user.menu = action.payload; // Update the menu for the current user
        console.log("Redux State after updateMenu:", JSON.stringify(state, null, 2));
      }
    },
  },
});


// Export the new action
export const { setUser, clearUser, updateMenu } = authSlice.actions;


// Export selectors for accessing user state
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;

// Export reducer
export default authSlice.reducer;
