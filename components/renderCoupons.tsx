import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Coupon, MenuItem } from "@/constants/types";
import { FontAwesome } from "@expo/vector-icons";
import HorizontalLine from "@/components/default/HorizontalLine";
import { munchColors } from "@/constants/Colors";
import CouponCard from "@/components/CouponCard";

const screenWidth = Dimensions.get("window").width;

type RenderCouponsProps = {
  coupons: Coupon[];
  vendorImage: string;
};

export const RenderCoupons: React.FC<RenderCouponsProps> = ({
  coupons,
  vendorImage,
}) => {
  return (
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
    />
  );
};

const styles = StyleSheet.create({
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
