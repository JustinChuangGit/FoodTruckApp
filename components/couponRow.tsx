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
  // Extract and flatten coupons from the vendors
  const coupons = section.vendors.flatMap((vendor) =>
    (vendor.coupons || []).map((coupon) => ({
      ...coupon,
      vendor, // Include vendor info for each coupon
    }))
  );

  return (
    <View style={styles.mainSection}>
      <View
        style={styles.sectionTitleContainer}
        onStartShouldSetResponder={() => true}
      >
        <Text style={styles.sectionTitle}>Coupons Based On Your Location</Text>
      </View>
      <FlatList
        data={coupons}
        keyExtractor={(coupon) => coupon.id}
        horizontal
        showsHorizontalScrollIndicator={false}
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
});

export default CouponRow;
