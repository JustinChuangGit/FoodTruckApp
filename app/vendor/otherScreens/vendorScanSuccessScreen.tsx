import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Vibration,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon";
import { Coupon } from "@/constants/types";
import CustomCheckbox from "@/components/CustomCheckbox";
import { Audio } from "expo-av";
import { decrementCouponUses } from "@/services/firestore";
import { decrementCouponUsesState, selectUser } from "@/redux/authSlice"; // Update the path as needed
import { useSelector, useDispatch } from "react-redux";

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
  const [discount, setDiscount] = useState(0);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/scanSuccess.mp3")
    );
    await sound.playAsync();
  };

  useEffect(() => {
    playSound();
    Vibration.vibrate(250); // Vibrates for 500ms
  }, []);

  const toggleCouponSelection = (couponId: string) => {
    setSelectedCoupons((prev) => ({
      ...prev,
      [couponId]: !prev[couponId],
    }));
  };

  const addCouponToCheckout = (couponId: string) => {
    // Toggle the selection and calculate the discount in a single operation
    setSelectedCoupons((prev) => {
      const updatedSelections = {
        ...prev,
        [couponId]: !prev[couponId],
      };

      // Get the IDs of selected coupons
      const selectedCouponIds = Object.keys(updatedSelections).filter(
        (id) => updatedSelections[id]
      );

      // Filter the parsed coupons based on selected IDs
      const selectedCoupons = parsedCoupons.filter((coupon: Coupon) =>
        selectedCouponIds.includes(coupon.id)
      );

      // Calculate the total discount
      const totalDiscount = selectedCoupons.reduce(
        (acc: number, coupon: Coupon) =>
          acc + (coupon.value ? parseFloat(coupon.value.toString()) : 0),
        0
      );

      // Update the discount state
      setDiscount(totalDiscount);

      return updatedSelections; // Return the updated state
    });
  };
  const handleApplyCoupons = async () => {
    const selectedCouponIds = Object.keys(selectedCoupons).filter(
      (id) => selectedCoupons[id]
    );

    try {
      // 1. Update Firestore for selected coupons
      dispatch(decrementCouponUsesState({ couponIds: selectedCouponIds }));

      await decrementCouponUses(user?.uid ?? "", selectedCouponIds);

      // 2. Dispatch Redux action to update state

      // Redirect after applying coupons
      router.replace("/vendor/(tabs)/VendorScanScreen");
    } catch (error) {
      console.error("Error applying coupons:", error);
    }
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
      </View>
      <View style={styles.discountContainer}>
        <Text style={styles.discountHeaderText}>Apply Discount: </Text>
        <Text style={styles.discountText}>${discount}</Text>
      </View>
      <Text style={styles.couponsTitle}>Select Matching Coupons:</Text>

      <ScrollView>
        {parsedCoupons.length > 0 ? (
          parsedCoupons.map((coupon: Coupon) => (
            <View key={coupon.id} style={styles.couponContainer}>
              <CustomCheckbox
                value={selectedCoupons[coupon.id] || false}
                onValueChange={() => addCouponToCheckout(coupon.id)}
              />

              <View style={styles.couponTextContainer}>
                <Text style={styles.couponHeadline}>{coupon.headline}</Text>
                <Text style={styles.couponDescription}>
                  {coupon.description}
                </Text>
                <View style={styles.couponDetailsRow}>
                  <Text style={styles.couponDetails}>Uses: {coupon.uses}</Text>
                  <Text style={styles.couponDetails}>
                    {" "}
                    | Value: ${coupon.value}
                  </Text>
                </View>
                <Text style={styles.couponDetails}>
                  Valid Until:{" "}
                  {new Date(coupon.validUntil).toLocaleString("en-US", {
                    weekday: "short", // 'short' for abbreviated weekday (e.g., 'Fri')
                    month: "short", // 'short' for abbreviated month (e.g., 'Jan')
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true, // Use 12-hour clock
                  })}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noCouponsText}>No matching coupons found.</Text>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleApplyCoupons}>
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
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: 350,
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
    marginTop: 70,
  },
  discountContainer: {
    alignItems: "center",
  },
  discountHeaderText: {
    fontSize: 20,
    color: "white",
    marginRight: 10,
  },
  discountText: {
    fontSize: 125,
    color: "white",
    fontWeight: "bold",
    paddingBottom: 20,
  },
  couponDetailsRow: {
    flexDirection: "row", // Arrange items horizontally
  },
});
