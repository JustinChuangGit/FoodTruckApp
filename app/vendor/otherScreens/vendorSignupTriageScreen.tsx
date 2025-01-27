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
          <View style={styles.rowCompletedBox} />

          <View style={styles.rowTextContainer}>
            <Text style={styles.rowText}>Add Account Details</Text>
            <Text style={styles.rowSubText}>
              Tell your customers more about you! Add your logo, description,
              and more
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            router.push("/vendor/otherScreens/vendorEditMenuScreen")
          }
        >
          <View style={styles.rowCompletedBox} />

          <View style={styles.rowTextContainer}>
            <Text style={styles.rowText}>Add Menu Items</Text>
            <Text style={styles.rowSubText}>
              Give your customers a taste of what you have to offer!
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push("/sharedScreens/termsAndServiceScreen")}
        >
          <View style={styles.rowCompletedBox} />
          <View style={styles.rowTextContainer}>
            <Text style={styles.rowText}>Terms and Conditions</Text>
            <Text style={styles.rowSubText}>
              Read our terms and conditions before you start selling
            </Text>
          </View>
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
    borderRadius: munchStyles.smallRadius,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 100,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
    height: 50,
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
  rowSubText: {
    color: "#666",
    fontSize: 12,
  },
  rowCompletedBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: munchColors.primary,
    marginRight: 16,
    borderColor: "black",
    borderWidth: 2,
  },
  rowTextContainer: {
    flex: 1,
  },
});
