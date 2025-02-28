import React, { useState, useEffect, useRef } from "react";
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
    vendorType: string;
    price: string;
    description: string;
    image: string;
    rating: string;
    truckImage: string;
    coupons: string;
    vendorName: string;
  }>();

  const {
    menu = "[]",
    vendorName,
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
  const flatListRef = useRef<FlatList>(null); // Reference to FlatList
  const [truckImageLoading, setTruckImageLoading] = useState(true); // Loading state for truck image

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

  const handleScroll = (category: string) => {
    console.log("Scrolling to category:", category);
    const index = parsedMenu.findIndex((item) => item.category === category);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewOffset: 50, // Adjust offset to account for header or padding
      });
    }
  };
  return (
    <FlatList
      data={[1]}
      ref={flatListRef}
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
              {truckImage ? (
                <>
                  {imageLoading && (
                    <ActivityIndicator
                      size="large"
                      color="#007bff"
                      style={styles.loadingIndicator}
                    />
                  )}
                  <Image
                    source={{ uri: truckImage }}
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
              <Text style={styles.name}>{vendorName}</Text>
              <View style={styles.circleContainer}>
                <View style={styles.circle}>
                  {image && (
                    <ActivityIndicator
                      size="small"
                      color="#007bff"
                      style={styles.loadingIndicator}
                    />
                  )}
                  <Image
                    source={{ uri: image }}
                    style={styles.circleLogo}
                    onLoad={() => setTruckImageLoading(false)} // Image successfully loaded
                    onLoadStart={() => setTruckImageLoading(true)} // Start loading
                    onError={() => setTruckImageLoading(false)} // Stop spinner if image fails to load
                  />
                </View>
              </View>
              <View style={styles.informationSubHeaderContainer}>
                <Text style={styles.vendorPrice}>{vendorType} </Text>
                <FontAwesome name="circle" size={8} color="#888" />
                <Text style={styles.vendorPrice}> {price} </Text>
                {parseFloat(rating) > 0 && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FontAwesome name="circle" size={8} color="#888" />
                    <Text style={styles.vendorRating}> {rating}</Text>
                    <FontAwesome name="star" size={12} color="#888" />
                  </View>
                )}
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
            </View>
            {activeTab === "items" ? (
              <RenderMenu menu={parsedMenu} scrollToCategory={handleScroll} />
            ) : (
              <RenderCoupons coupons={parsedCoupons} />
              // <RenderCoupons coupons={parsedCoupons} />
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
    resizeMode: "cover",
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
  circle: {
    width: 125, // Diameter of the circle
    height: 125,
    borderRadius: 80, // Makes it a perfect circle
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});
