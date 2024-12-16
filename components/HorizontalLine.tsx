import React from "react";
import { View, StyleSheet } from "react-native";

const HorizontalLine = () => {
  return <View style={styles.line} />;
};

const styles = StyleSheet.create({
  line: {
    height: 1, // Thickness of the line
    backgroundColor: "#ccc",
    marginVertical: 10, // Spacing around the line
    width: "100%", // Make the line span the full width of its container
  },
});

export default HorizontalLine;
