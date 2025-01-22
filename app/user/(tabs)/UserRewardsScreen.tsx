import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import QRCode from "react-native-qrcode-svg";
import { selectUser } from "@/redux/authSlice"; // Import the selector from your authSlice

export default function UserRewardsScreen() {
  // Retrieve the user from the Redux state
  const user = useSelector(selectUser);

  // Extract the UID, with a fallback in case user data is unavailable
  const userUID = user?.uid || "default-uid";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Rewards</Text>
      <Text style={styles.subtitle}>
        Show this QR code to earn rewards or access features.
      </Text>
      <QRCode
        value={userUID} // Encode the user's UID in the QR code
        size={200} // QR code size
        color="black" // QR code color
        backgroundColor="white" // Background color
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
});
