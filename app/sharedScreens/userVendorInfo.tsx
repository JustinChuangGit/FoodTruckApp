import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { munchColors } from "@/constants/Colors";
import HorizontalLine from "@/components/default/HorizontalLine";
import { RenderMenu } from "@/components/renderMenu";
import { RenderCoupons } from "@/components/renderCoupons";
import { Coupon, MenuItem } from "@/constants/types";

export default function UserVendorInfo() {
  const router = useRouter();
  const params = useLocalSearchParams<{
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
    coupons = "[]",
  } = params;

  const [activeTab, setActiveTab] = useState("items");
  const [imageLoading, setImageLoading] = useState(true);

  const parsedMenu: MenuItem[] = JSON.parse(menu);
  const parsedCoupons: Coupon[] = JSON.parse(coupons).filter(
    (item: Coupon): item is Coupon =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "headline" in item &&
      "description" in item &&
      "uses" in item &&
      "validUntil" in item &&
      "value" in item
  );

  useEffect(() => {
    setImageLoading(true);
  }, [image]);

  return (
    <FlatList
      data={[1]}
      renderItem={({ item }) => (
        <View>
          <View style={{ flex: 1 }}>
            <View style={styles.logoContainer}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.closeButton}
              >
                <FontAwesome
                  name="circle"
                  size={40}
                  color="rgba(0, 0, 0, 0.5)"
                />
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
                <Text style={styles.imageFallbackText}>
                  Image not available
                </Text>
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
                  style={[
                    styles.tab,
                    activeTab === "items" && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab("items")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color:
                          activeTab === "items" ? munchColors.primary : "#555",
                      },
                    ]}
                  >
                    Items
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "coupons" && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab("coupons")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color:
                          activeTab === "coupons"
                            ? munchColors.primary
                            : "#555",
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
              <RenderMenu menu={parsedMenu} scrollToCategory={() => {}} />
            ) : (
              <RenderCoupons coupons={parsedCoupons} vendorImage={image} />
            )}
          </View>
        </View>
      )}
    />
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
    backgroundColor: "white",
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
    borderColor: munchColors.primary,
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
