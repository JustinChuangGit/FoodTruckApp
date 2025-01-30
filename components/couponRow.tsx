import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Vendor, Coupon } from "@/constants/types";
import CouponCard from "./CouponCard";

interface Section {
  id: string;
  title: string;
  vendors: Vendor[];
}

interface CouponRowProps {
  section: Section;
  onCardPress: (vendor: Vendor) => void;
}

const CouponRow: React.FC<CouponRowProps> = ({ section, onCardPress }) => {
  // Filter valid coupons
  const currentDate = new Date();
  const validCoupons = section.vendors.flatMap((vendor) =>
    (vendor.coupons || [])
      .filter(
        (coupon) =>
          coupon.uses !== 0 && new Date(coupon.validUntil) > currentDate // Exclude expired or used-up coupons
      )
      .map((coupon) => ({
        ...coupon,
        vendor, // Include vendor info for each coupon
      }))
  );

  return (
    <View style={styles.mainSection}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Coupons Based On Your Location</Text>
      </View>
      <FlatList
        data={validCoupons}
        keyExtractor={(coupon) => coupon.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No Coupons online, please check back soon.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <CouponCard
            coupon={item}
            vendor={item.vendor}
            onPress={() => onCardPress(item.vendor)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainSection: { marginVertical: 16 },
  sectionTitleContainer: {
    height: "auto",
    width: "100%",
    justifyContent: "center",
    paddingLeft: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "gray",
    textAlign: "center",
    paddingHorizontal: 30,
  },
});

export default CouponRow;
