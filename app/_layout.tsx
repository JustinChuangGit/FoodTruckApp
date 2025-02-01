// _layout.ts
import React from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../redux/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://747134d92cb68b3dfbc573de941569c0@o4508744923873280.ingest.us.sentry.io/4508744929378304",

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  spotlight: __DEV__,
  enableNative: true, // Track native crashes on iOS/Android
  tracesSampleRate: 1.0, // Capture performance issues
  debug: true, // Log debug info (disable in production)
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Stack>
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="user" options={{ headerShown: false }} />
            <Stack.Screen name="vendor" options={{ headerShown: false }} />
            <Stack.Screen
              name="sharedScreens"
              options={{ headerShown: false }}
            />
          </Stack>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
