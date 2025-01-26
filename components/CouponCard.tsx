import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux"; // Import Redux hooks
import { Coupon } from "@/constants/types";
import { munchStyles } from "@/constants/styles";
import { munchColors } from "@/constants/Colors";
import { redeemCoupon } from "@/redux/authSlice"; // Import the redeem action
import { selectUser } from "@/redux/authSlice"; // Import the user selector

type CouponCardProps = {
  coupon: Coupon;
  vendorImage?: string; // Optional vendor image URL
};

const CouponCard: React.FC<CouponCardProps> = ({ coupon, vendorImage }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // Check if the coupon has already been added
  const isApplied = user?.userAddedCoupons?.includes(coupon.id) || false;

  const handleRedeem = () => {
    console.log("Redeeming coupon:", coupon.id);
    dispatch(redeemCoupon(coupon.id));
  };

  return (
    <View style={[styles.card, { height: vendorImage ? 275 : 175 }]}>
      <View>
        {vendorImage && (
          <Image source={{ uri: vendorImage }} style={styles.vendorImage} />
        )}
        <Text style={styles.headline}>{coupon.headline}</Text>
        <Text style={styles.description}>{coupon.description}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.addCouponButton,
          isApplied && styles.disabledCouponButton, // Style the button if already redeemed
        ]}
        disabled={isApplied} // Disable button if already redeemed
        onPress={handleRedeem}
      >
        <Text
          style={[
            styles.addCouponText,
            isApplied && styles.disabledCouponText, // Change text style if already redeemed
          ]}
        >
          {isApplied ? "Already Redeemed" : "Redeem"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: munchStyles.smallRadius,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: 175,
    justifyContent: "space-between",
  },
  vendorImage: {
    width: 140,
    height: 100,
    borderRadius: munchStyles.smallRadius,
    marginBottom: 16,
    resizeMode: "cover",
  },
  headline: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  addCouponButton: {
    backgroundColor: munchColors.primary,
    borderRadius: munchStyles.smallRadius,
    padding: 8,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addCouponText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledCouponButton: {
    backgroundColor: "#ccc", // Gray out the button
  },
  disabledCouponText: {
    color: "#999", // Change text color
  },
});

export default CouponCard;
