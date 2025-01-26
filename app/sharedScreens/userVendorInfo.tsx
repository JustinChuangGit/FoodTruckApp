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
import { RenderMenu } from "@/components/renderMenu";
import { RenderCoupons } from "@/components/renderCoupons";

const screenWidth = Dimensions.get("window").width;

export default function UserVendorInfo() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    uid: string;
    location: string;
    menu: string;
    name: string;
    vendorType: string;
    price: string;
    description: string;
    image: string;
    rating: string;
    truckImage: string;
    coupons: string;
  }>();

  const {
    menu = "[]",
    name,
    vendorType,
    price,
    description,
    image,
    rating,
    truckImage,
    coupons,
  } = params;

  const [activeTab, setActiveTab] = useState("items");
  const [imageLoading, setImageLoading] = useState(true);
  const verticalFlatListRef = useRef<FlatList>(null);

  const parsedMenu: MenuItem[] = JSON.parse(menu);
  const parsedCoupons: Coupon[] = JSON.parse(coupons || "[]");

  useEffect(() => {
    setImageLoading(true);
  }, [image]);

  const scrollToCategory = (category: string) => {
    const index = parsedMenu.findIndex((item) => item.category === category);
    if (index !== -1 && verticalFlatListRef.current) {
      verticalFlatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.logoContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <FontAwesome name="circle" size={40} color="rgba(0, 0, 0, 0.5)" />
          <FontAwesome
            name="chevron-left"
            size={24}
            color="white"
            style={styles.icon}
          />
        </TouchableOpacity>
        {image ? (
          <>
            {imageLoading && (
              <ActivityIndicator
                size="large"
                color="#007bff"
                style={styles.loadingIndicator}
              />
            )}
            <Image
              source={{ uri: image }}
              style={styles.logo}
              onLoad={() => setImageLoading(false)}
              onLoadStart={() => setImageLoading(true)}
            />
          </>
        ) : (
          <Text style={styles.imageFallbackText}>Image not available</Text>
        )}
      </View>
      <View style={styles.informationContainer}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.circleContainer}>
          <Image source={{ uri: truckImage }} style={styles.circleLogo} />
        </View>
        <View style={styles.informationSubHeaderContainer}>
          <Text style={styles.vendorPrice}>{vendorType} </Text>
          <FontAwesome name="circle" size={8} color="#888" />
          <Text style={styles.vendorPrice}> {price} </Text>
          <FontAwesome name="circle" size={8} color="#888" />
          <Text style={styles.vendorRating}> {rating}</Text>
          <FontAwesome name="star" size={12} color="#888" />
        </View>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "items" && styles.activeTab]}
            onPress={() => setActiveTab("items")}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === "items" ? munchColors.primary : "#555" },
              ]}
            >
              Items
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "coupons" && styles.activeTab]}
            onPress={() => setActiveTab("coupons")}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === "coupons" ? munchColors.primary : "#555",
                },
              ]}
            >
              Coupons
            </Text>
          </TouchableOpacity>
        </View>
        <HorizontalLine />
      </View>
      {activeTab === "items" ? (
        <RenderMenu menu={parsedMenu} scrollToCategory={scrollToCategory} />
      ) : (
        <RenderCoupons coupons={parsedCoupons} vendorImage={image} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    height: 300,
    backgroundColor: "#e0e0e0",
  },
  logo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageFallbackText: {
    color: "#555",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  informationContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  name: {
    fontSize: 30,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: "#555",
  },
  informationSubHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  circleContainer: {
    position: "absolute",
    top: -65,
    right: 16,
    zIndex: 10,
  },
  circleLogo: {
    width: 125,
    height: 125,
    borderRadius: 80,
    resizeMode: "contain",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 5,
  },
  tab: {
    padding: 10,
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  activeTab: {
    borderColor: "#007bff",
  },
  tabText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  icon: {
    position: "absolute",
    top: 19,
    left: 26,
  },
  vendorPrice: {
    fontSize: 14,
    color: "#555",
  },
  vendorRating: {
    fontSize: 14,
    color: "#888",
  },
  loadingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
});
