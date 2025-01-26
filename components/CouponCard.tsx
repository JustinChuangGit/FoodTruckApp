import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Coupon } from "@/constants/types";
import { munchStyles } from "@/constants/styles";
import { munchColors } from "@/constants/Colors";

type CouponCardProps = {
  coupon: Coupon;
  vendorImage?: string; // Optional vendor image URL
};

const CouponCard: React.FC<CouponCardProps> = ({ coupon, vendorImage }) => {
  return (
    <View style={styles.card}>
      <>
        {vendorImage && (
          <Image source={{ uri: vendorImage }} style={styles.vendorImage} />
        )}
        <Text style={styles.headline}>{coupon.headline}</Text>
        <Text style={styles.description}>{coupon.description}</Text>
      </>
      <TouchableOpacity
        style={styles.addCouponButton}
        onPress={() => {
          // Handle coupon redemption
        }}
      >
        <Text style={styles.addCouponText}>Redeem</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: munchStyles.cardRadius,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    // alignItems: "center", // Center content for a cleaner layout
    width: 175,
  },
  vendorImage: {
    width: 130,
    height: 100,
    borderRadius: munchStyles.smallRadius, // Circular image
    marginBottom: 16,
    resizeMode: "cover", // Cover the entire image container
    marginHorizontal: "auto", // Center the image
  },
  headline: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
    textAlign: "left", // Center text for consistency with the image
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    textAlign: "left",
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 4,
    textAlign: "center",
  },
  uses: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    textAlign: "center",
  },
  validUntil: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
    textAlign: "center",
  },
  createdOn: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 8,
    textAlign: "center",
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
});

export default CouponCard;
