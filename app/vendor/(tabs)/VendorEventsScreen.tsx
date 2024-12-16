import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function VendorEventsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vendor Events Screen</Text>
      <Text>This is a dummy screen to show vendor events or activities.</Text>
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
