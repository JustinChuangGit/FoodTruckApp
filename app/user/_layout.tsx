import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot, Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../../redux/store";

export default function UserLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="otherScreens/UserAccountScreen"
          options={{
            title: "Account",
            headerShown: false,
          }}
        />
      </Stack>
    </Provider>
  );
}
