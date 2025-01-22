import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon";
import { munchStyles } from "@/constants/styles";

export default function VendorScanSuccessScreen() {
  const router = useRouter();
  const confettiRef = useRef(null);

  return (
    <View style={styles.container}>
      {/* Confetti Animation */}
      <ConfettiCannon
        count={200}
        origin={{ x: -10, y: 0 }}
        fadeOut={true}
        autoStart={true}
      />

      {/* Success Message */}
      <Text style={styles.successText}>Scan Successful!</Text>
      <Text style={styles.message}>You gained a new customer!</Text>

      {/* Button to Scan Again */}
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50", // Green background
  },
  successText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: munchStyles.smallRadius,
    width: 180,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
});
