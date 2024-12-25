// _layout.ts
import React from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../redux/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Stack>
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="user" options={{ headerShown: false }} />
            <Stack.Screen name="vendor" options={{ headerShown: false }} />
          </Stack>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
