// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authReducer from "./authSlice";

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
};

// Wrap the authReducer with persistence capabilities
const persistedReducer = persistReducer(persistConfig, authReducer);

// Configure the store
export const store = configureStore({
  reducer: {
    auth: persistedReducer,
  },
});

// Configure persistor for redux-persist
export const persistor = persistStore(store);

// Types for usage in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
