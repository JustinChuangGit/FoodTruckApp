import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot } from "expo-router";

export default function UserLayout() {
  return (
    <View style={styles.container}>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
