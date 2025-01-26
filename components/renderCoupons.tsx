import React from "react";
import { View, FlatList, StyleSheet, Dimensions } from "react-native";
import { Coupon } from "@/constants/types";
import CouponCard from "@/components/CouponCard";

type RenderCouponsProps = {
  coupons: Coupon[];
  vendorImage: string;
};

export const RenderCoupons: React.FC<RenderCouponsProps> = ({
  coupons,
  vendorImage,
}) => {
  return (
    <View style={styles.couponContainer}>
      <FlatList
        data={coupons}
        keyExtractor={(item) => `coupon-${item.id}`}
        renderItem={({ item }) => (
          <View style={styles.couponGridItem}>
            <CouponCard coupon={item} vendorImage={vendorImage} />
          </View>
        )}
        numColumns={2}
        columnWrapperStyle={styles.couponColumnWrapper}
        contentContainerStyle={styles.couponFlatListContainer}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  couponContainer: {
    backgroundColor: "white",
    height: Dimensions.get("window").height,
  },
  couponFlatListContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  couponColumnWrapper: {
    justifyContent: "space-between",
  },
  couponGridItem: {
    flex: 1,
    maxWidth: "48%",
    margin: 8,
  },
});
