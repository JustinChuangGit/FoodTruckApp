import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon";
import { Coupon } from "@/constants/types";
import CustomCheckbox from "@/components/CustomCheckbox";

export default function VendorScanSuccessScreen() {
  const params = useLocalSearchParams<{
    userId: string;
    matchingCoupons: string; // Serialized JSON string
  }>();
  const router = useRouter();

  const { matchingCoupons } = params;
  const parsedCoupons = matchingCoupons ? JSON.parse(matchingCoupons) : [];
  const [selectedCoupons, setSelectedCoupons] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleCouponSelection = (couponId: string) => {
    setSelectedCoupons((prev) => ({
      ...prev,
      [couponId]: !prev[couponId],
    }));
  };

  return (
    <View style={styles.container}>
      <ConfettiCannon
        count={200}
        origin={{ x: -10, y: 0 }}
        fadeOut={true}
        autoStart={true}
      />
      <View style={styles.successTextContainer}>
        <Text style={styles.successText}>Scan Successful!</Text>
        <Text style={styles.couponsTitle}>Select Matching Coupons:</Text>
      </View>

      <ScrollView>
        {parsedCoupons.length > 0 ? (
          parsedCoupons.map((coupon: Coupon) => (
            <View key={coupon.id} style={styles.couponContainer}>
              <CustomCheckbox
                value={selectedCoupons[coupon.id] || false}
                onValueChange={() => toggleCouponSelection(coupon.id)}
              />

              <View style={styles.couponTextContainer}>
                <Text style={styles.couponHeadline}>{coupon.headline}</Text>
                <Text style={styles.couponDescription}>
                  {coupon.description}
                </Text>
                <Text style={styles.couponDetails}>
                  Uses: {coupon.uses} | Value: {coupon.value} | Valid Until:{" "}
                  {coupon.validUntil}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noCouponsText}>No matching coupons found.</Text>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            const selectedCouponIds = Object.keys(selectedCoupons).filter(
              (id) => selectedCoupons[id]
            );
            console.log("Selected Coupons:", selectedCouponIds);
            router.replace("/vendor/(tabs)/VendorScanScreen");
          }}
        >
          <Text style={styles.buttonText}>Confirm Selection</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "grey" }]}
          onPress={() => {
            const selectedCouponIds = Object.keys(selectedCoupons).filter(
              (id) => selectedCoupons[id]
            );
            router.replace("/vendor/(tabs)/VendorScanScreen");
          }}
        >
          <Text style={[styles.buttonText, { color: "white" }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: 325,
  },
  couponTextContainer: {
    flex: 1,
    marginLeft: 10,
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
    borderRadius: 10,
    width: 250,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  buttonContainer: {
    marginBottom: 40,
  },

  successTextContainer: {
    marginTop: 275,
  },
});
