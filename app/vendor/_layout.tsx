import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot, Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../../redux/store";

export default function VendorLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="VendorHomeScreen" />
      </Stack>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
