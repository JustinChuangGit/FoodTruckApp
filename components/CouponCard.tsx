import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux"; // Import Redux hooks
import { Coupon, Vendor } from "@/constants/types";
import { munchStyles } from "@/constants/styles";
import { munchColors } from "@/constants/Colors";
import { redeemCoupon } from "@/redux/authSlice"; // Import the redeem action
import { selectUser } from "@/redux/authSlice"; // Import the user selector
import { addCouponToAccount } from "@/services/firestore";

type CouponCardProps = {
  coupon: Coupon;
  vendor?: Vendor; // Optional vendor image URL
  onPress?: () => void; // Optional onPress handler
};

const CouponCard: React.FC<CouponCardProps> = ({ coupon, vendor, onPress }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [imageLoading, setImageLoading] = useState(true); // State for loading indicator

  // Check if the coupon has already been added
  const isApplied = user?.addedCoupons?.includes(coupon.id) || false;

  const handleRedeem = () => {
    if (user?.uid) {
      dispatch(redeemCoupon(coupon.id));
      addCouponToAccount(user.uid, coupon.id); // Add the coupon to the user's account
    }
  };

  const units = useMemo(() => {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.includes("US") ? "miles" : "km";
  }, []);

  return (
    <View style={[styles.card, { height: vendor ? 265 : 150 }]}>
      <TouchableOpacity
        onPress={onPress}
        style={styles.couponContent}
        disabled={!onPress}
      >
        <View>
          {vendor && (
            <View style={styles.imageContainer}>
              {imageLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={munchColors.primary} />
                </View>
              )}
              <Image
                source={{ uri: vendor.image }}
                style={styles.vendorImage}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </View>
          )}
          <Text style={styles.headline}>{coupon.headline}</Text>
          <Text style={styles.description}>{coupon.description}</Text>
        </View>
        <>
          {vendor && (
            <Text style={styles.vendorDistance}>
              {vendor?.distance !== undefined
                ? `${vendor.distance.toFixed(1)} ${units} away`
                : ""}
            </Text>
          )}
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
              {isApplied ? "Applied" : "Redeem"}
            </Text>
          </TouchableOpacity>
        </>
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
    elevation: 10,
    width: 175,
    justifyContent: "space-between",
    marginHorizontal: "auto",
    marginLeft: 20,
  },
  couponContent: {
    flex: 1,
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
    textAlign: "left", // Ensures left justification
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    textAlign: "left", // Ensures left justification
  },
  addCouponButton: {
    backgroundColor: munchColors.primary,
    borderRadius: munchStyles.smallRadius,
    padding: 8,
    marginTop: 1,
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
  imageContainer: {
    width: 140,
    height: 100,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  vendorDistance: {
    fontSize: 12,
    color: "#AAA",
    marginTop: 8,
    textAlign: "left", // Ensures left justification
  },
});

export default CouponCard;
