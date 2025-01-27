import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function VendorSignupTriageScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vendor Sign Up</Text>

      {/* Triage Options */}

      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          router.push("/vendor/otherScreens/vendorEditAccountScreen")
        }
      >
        <Text style={styles.rowText}>Edit Account</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push("/vendor/otherScreens/vendorEditMenuScreen")}
      >
        <Text style={styles.rowText}>Edit Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push("/sharedScreens/termsAndServiceScreen")}
      >
        <Text style={styles.rowText}>Terms and Conditions</Text>
      </TouchableOpacity>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => router.push("/vendor")}
      >
        <Text>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 16,
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
  },
  row: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rowText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  buttonContainer: {
    marginTop: 32,
    alignItems: "center",
  },
});
