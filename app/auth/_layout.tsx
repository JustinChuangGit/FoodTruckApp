// app/auth/_layout.tsx
import React from "react";
import { Slot } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../../redux/store";
import { Stack } from "expo-router";

// Import your global CSS file
import "../../global.css";

export default function AuthLayout() {
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* This renders all screens under /auth */}
      </Stack>
    </Provider>
  );
}
