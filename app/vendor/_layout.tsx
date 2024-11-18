import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot, Stack } from "expo-router";

export default function VendorLayout() {
  return (
    <Stack>
      <Stack.Screen name="UserHomeScreen" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
