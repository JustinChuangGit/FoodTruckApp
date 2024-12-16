import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function UserAccountScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Account Screen</Text>
      <Text>This is a dummy screen for user account details.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
});
