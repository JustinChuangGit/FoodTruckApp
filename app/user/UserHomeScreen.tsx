import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function UserHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up the full screen
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    backgroundColor: "#f8f8f8", // Optional: light background
  },
  text: {
    fontSize: 24, // Font size for the text
    fontWeight: "bold", // Bold text
    color: "#333", // Text color
  },
});
