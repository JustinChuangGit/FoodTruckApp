import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function UserEventsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Events Screen</Text>
      <Text>This is a dummy screen to show user events or activities.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
});
