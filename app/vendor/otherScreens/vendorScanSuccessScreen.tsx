import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon";
import { Audio } from "expo-av";
import { munchStyles } from "@/constants/styles";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/authSlice"; // Update the path as needed
import { Coupon } from "@/constants/types";

export default function VendorScanSuccessScreen() {
  const params = useLocalSearchParams<{
    userId: string;
    matchingCoupons: string; // Serialized JSON string
  }>();
  const router = useRouter();
  const confettiRef = useRef(null);

  const { userId, matchingCoupons } = params;

  // Parse the matching coupons back into an array
  const parsedCoupons = matchingCoupons ? JSON.parse(matchingCoupons) : [];

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/scanSuccess.mp3")
    );
    await sound.playAsync();
  };

  useEffect(() => {
    playSound();
    Vibration.vibrate(250); // Vibrates for 250ms
  }, []);

  return (
    <View style={styles.container}>
      <ConfettiCannon
        count={200}
        origin={{ x: -10, y: 0 }}
        fadeOut={true}
        autoStart={true}
      />
      <Text style={styles.successText}>Scan Successful!</Text>
      <Text style={styles.message}>You gained a new customer!</Text>

      {/* Display Matching Coupons */}
      <View>
        <Text style={styles.couponsTitle}>Matching Coupons:</Text>
        {parsedCoupons.length > 0 ? (
          parsedCoupons.map((coupon: Coupon, index: number) => (
            <View key={index} style={styles.couponContainer}>
              <Text style={styles.couponHeadline}>{coupon.headline}</Text>
              <Text style={styles.couponDescription}>{coupon.description}</Text>
              <Text style={styles.couponDetails}>
                Uses: {coupon.uses} | Value: {coupon.value} | Valid Until:{" "}
                {coupon.validUntil}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noCouponsText}>No matching coupons found.</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/vendor/(tabs)/VendorScanScreen")}
      >
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
  couponsTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
  },
  couponContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  couponHeadline: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  couponDescription: {
    fontSize: 16,
    color: "#333",
  },
  couponDetails: {
    fontSize: 14,
    color: "#666",
  },
  noCouponsText: {
    fontSize: 16,
    color: "white",
    marginTop: 10,
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
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
});
