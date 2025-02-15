import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot, Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../../redux/store";

export default function VendorLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="otherScreens/vendorEditMenuScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="otherScreens/vendorEditAccountScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="otherScreens/vendorScanSuccessScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="otherScreens/vendorSignupTriageScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="otherScreens/VendorAccountScreen"
          options={{
            title: "Account",
            headerShown: false,
          }}
        />
      </Stack>
    </Provider>
  );
}
