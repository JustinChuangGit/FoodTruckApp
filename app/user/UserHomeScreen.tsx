import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store"; // Adjust the path to your store
import type { User } from "../../redux/authSlice"; // Adjust the path to your slice

export default function UserHomeScreen() {
  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as User | null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Home</Text>
      {user ? (
        <View style={styles.userInfo}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user.name}</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
          <Text style={styles.label}>Vendor:</Text>
          <Text style={styles.value}>{user.isVendor ? "Yes" : "No"}</Text>
        </View>
      ) : (
        <Text style={styles.errorText}>No user data available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  userInfo: {
    alignItems: "flex-start",
    width: "100%",
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
  },
  value: {
    fontSize: 18,
    fontWeight: "400",
    color: "#000",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
  },
});
