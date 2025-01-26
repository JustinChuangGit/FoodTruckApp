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

  const renderMenu = () => {
    const categories = parsedMenu.reduce((acc: string[], item) => {
      if (!acc.includes(item.category)) {
        acc.push(item.category);
      }
      return acc;
    }, []);

    const menuData = parsedMenu.reduce((acc: any[], item) => {
      const categoryIndex = acc.findIndex(
        (data) => data.type === "category" && data.title === item.category
      );
      if (categoryIndex === -1) {
        acc.push({ type: "category", title: item.category });
      }
      acc.push({ type: "item", ...item });
      return acc;
    }, []);

    return (
      <>
        <FlatList
          data={categories}
          keyExtractor={(item, index) => `horizontal-${index}`}
          horizontal
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.horizontalItem}
              onPress={() => scrollToCategory(item)}
            >
              <Text style={styles.horizontalItemText}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.horizontalList}
          showsHorizontalScrollIndicator={false}
        />
        <FlatList
          ref={verticalFlatListRef}
          data={menuData}
          keyExtractor={(item, index) =>
            item.type === "category"
              ? `category-${item.title}-${index}`
              : `item-${item.name}-${index}`
          }
          renderItem={({ item }) =>
            item.type === "category" ? (
              <Text style={styles.categoryHeader}>{item.title}</Text>
            ) : (
              <View style={styles.menuItem}>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemDescription}>
                    {item.description}
                  </Text>
                </View>
                <Text style={styles.menuItemPrice}>
                  ${item.price.toFixed(2)}
                </Text>
              </View>
            )
          }
        />
      </>
    );
  };

  const renderCoupons = () => {
    return (
      <FlatList
        data={parsedCoupons}
        keyExtractor={(item) => `coupon-${item.id}`}
        renderItem={({ item }) => (
          <View style={styles.couponGridItem}>
            <CouponCard coupon={item} vendorImage={image} />
          </View>
        )}
        numColumns={2}
        columnWrapperStyle={styles.couponColumnWrapper}
        contentContainerStyle={styles.couponFlatListContainer}
      />
    );
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
      {activeTab === "items" ? renderMenu() : renderCoupons()}
    </View>
  );
}

// Keep your existing styles here.

const styles = StyleSheet.create({
  flatListContainer: {
    flexGrow: 1,
    backgroundColor: "white",
    paddingBottom: 16,
  },
  horizontalList: {
    flexDirection: "row", // Horizontal layout for categories
  },
  horizontalItem: {
    marginRight: 16, // Space between category items
  },
  horizontalItemText: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  logoContainer: {
    alignItems: "center",
    height: 300,
    backgroundColor: "#e0e0e0", // Light grey background for the vendor logo
  },
  logo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // Ensure the image covers the container
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
    top: -65, // Positioning for the circle logo
    right: 16,
    zIndex: 10,
  },
  circleLogo: {
    width: 125, // Diameter of the circle
    height: 125,
    borderRadius: 80, // Makes it a perfect circle
    resizeMode: "contain", // Ensure the image fits within the circle
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 5,
  },
  tab: {
    padding: 10,
    borderBottomWidth: 2,
    borderColor: "transparent", // Transparent border by default
  },
  activeTab: {
    borderColor: munchColors.primary, // Highlight active tab
  },
  tabText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between", // Space between item details and price
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuItemTextContainer: {
    flex: 1, // Allow the text container to grow and take available space
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#555",
  },
  menuItemPrice: {
    fontSize: 14,
    color: munchColors.primary, // Highlight price
  },
  couponFlatListContainer: {
    padding: 16, // Padding for the grid layout of coupons
    backgroundColor: "white",
  },
  couponColumnWrapper: {
    justifyContent: "space-between", // Space between items in the same row
  },
  couponGridItem: {
    flex: 1, // Allow equal space for items
    maxWidth: "48%", // Limit item width to fit two items per row
    margin: 8, // Spacing between grid items
  },
  categoryHeader: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
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
    zIndex: 10, // Ensures the button is on top
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
    position: "absolute", // Ensure it overlaps the image
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }], // Center the spinner
  },
});
