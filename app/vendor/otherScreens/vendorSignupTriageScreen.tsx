import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { munchColors } from "@/constants/Colors";
import { munchStyles } from "@/constants/styles";

export default function VendorSignupTriageScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/munchLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.triageContainer}>
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            router.push("/vendor/otherScreens/vendorEditAccountScreen")
          }
        >
          <Text style={styles.rowText}>Add Account Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            router.push("/vendor/otherScreens/vendorEditMenuScreen")
          }
        >
          <Text style={styles.rowText}>Add Menu Items</Text>
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
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: munchColors.primary,
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
    height: 100,
  },
  rowText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  buttonContainer: {
    marginTop: 32,
    alignItems: "center",
    backgroundColor: "white",
    height: 48,
    borderRadius: munchStyles.smallRadius,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: munchColors.primary,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  logo: {
    width: 200,
    height: 200,
  },
  triageContainer: {},
});
