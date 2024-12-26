import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function VendorAccountScreen() {
  const router = useRouter(); // Use router for navigation

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vendor Account Screen</Text>
      <Text>This is a dummy screen for vendor account details.</Text>

      {/* Edit Menu Button */}
      <TouchableOpacity
        style={styles.editMenuButton}
        onPress={() => router.push("../otherScreens/EditMenuItemsScreen")} // Navigate to EditMenuItemsScreen
      >
        <Text style={styles.editMenuButtonText}>Edit Menu</Text>
      </TouchableOpacity>
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
  editMenuButton: {
    marginTop: 20,
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  editMenuButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
