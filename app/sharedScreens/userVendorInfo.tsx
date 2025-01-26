import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Coupon, MenuItem } from "@/constants/types";
import { FontAwesome } from "@expo/vector-icons";
import HorizontalLine from "@/components/default/HorizontalLine";
import { munchColors } from "@/constants/Colors";

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

  const [contentWidth, setContentWidth] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [truckImageLoading, setTruckImageLoading] = useState(true); // Loading state for truck image
  const [activeTab, setActiveTab] = useState("items"); // Added: State for active tab

  const {
    location = "{}",
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

  const parsedMenu: MenuItem[] = JSON.parse(menu);
  const parsedCoupons: Coupon[] = JSON.parse(coupons || "[]"); // Added: Parse coupons
  const verticalFlatListRef = useRef<FlatList>(null);

  // Extract categories for the horizontal list
  const categories = parsedMenu.reduce((acc: string[], item) => {
    if (!acc.includes(item.category)) {
      acc.push(item.category);
    }
    return acc;
  }, []);

  // Format data for the vertical FlatList
  const formatData = () => {
    const headerData = [
      {
        type: "header",
        component: (
          <>
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
                    key={image}
                    source={{ uri: image }}
                    style={styles.logo}
                    onLoad={() => setImageLoading(false)} // Image loaded
                    onLoadStart={() => setImageLoading(true)} // Start loading
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
                <View style={styles.circle}>
                  {truckImageLoading && (
                    <ActivityIndicator
                      size="small"
                      color="#007bff"
                      style={styles.loadingIndicator}
                    />
                  )}
                  <Image
                    source={{ uri: truckImage }}
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
              {activeTab === "items" && (
                <View
                  style={{
                    alignItems:
                      categories.length <= 3 ? "center" : "flex-start", // Center for 3 or fewer categories
                  }}
                >
                  <FlatList
                    data={categories}
                    keyExtractor={(item, index) => `horizontal-${index}`}
                    horizontal
                    renderItem={renderHorizontalItem}
                    contentContainerStyle={styles.horizontalList}
                    showsHorizontalScrollIndicator={false} // Allow scrolling for long lists
                    scrollEnabled={categories.length > 3} // Enable scrolling only if there are more than 3 items
                  />
                  <HorizontalLine />
                </View>
              )}
            </View>
          </>
        ),
      },
    ];

    if (activeTab === "items") {
      // Added: Show items if the active tab is items
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
      return [...headerData, ...menuData];
    } else if (activeTab === "coupons") {
      // Added: Show coupons if the active tab is coupons
      const couponData = parsedCoupons.map((coupon) => ({
        type: "coupon",
        ...coupon,
      }));
      return [...headerData, ...couponData];
    }
    return headerData;
  };

  // Scroll the vertical FlatList to a specific category
  const scrollToCategory = (category: string) => {
    const index = formatData().findIndex(
      (item) => item.type === "category" && item.title === category
    );
    if (index !== -1 && verticalFlatListRef.current) {
      verticalFlatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  // Render a single item in the horizontal FlatList
  const renderHorizontalItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.horizontalItem}
      onPress={() => scrollToCategory(item)}
    >
      <Text style={styles.horizontalItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === "header") {
      return item.component;
    } else if (item.type === "category") {
      return <Text style={styles.categoryHeader}>{item.title}</Text>;
    } else if (item.type === "item") {
      return (
        <View style={{ display: "flex" }}>
          <View style={styles.menuItem}>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
            </View>
            <View style={styles.menuItemPriceContainer}>
              <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: 16 }}>
            <HorizontalLine />
          </View>
        </View>
      );
    } else if (item.type === "coupon") {
      // Added: Render coupon data
      return (
        <View style={styles.couponItem}>
          <Text style={styles.couponHeadline}>{item.headline}</Text>
          <Text style={styles.couponDescription}>{item.description}</Text>
          <Text style={styles.couponDetails}>Value: ${item.value}</Text>
          <Text style={styles.couponDetails}>
            Valid Until: {item.validUntil}
          </Text>
        </View>
      );
    }
    return null;
  };

  useEffect(() => {
    setImageLoading(true);
  }, [image]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={verticalFlatListRef}
        data={formatData()}
        keyExtractor={(item, index) =>
          item.type === "header"
            ? `header-${index}`
            : item.type === "category"
            ? `category-${item.title}-${index}`
            : `item-${item.name || item.message}-${index}`
        }
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flatListContainer: {
    flexGrow: 1,
    backgroundColor: "white",
    paddingBottom: 16,
  },
  horizontalList: {
    flexDirection: "row", // Ensures horizontal layout
    // alignItems: "center", // Vertically center items
  },
  horizontalItem: {
    marginRight: 16,
  },
  horizontalItemText: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
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
  categoryHeader: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
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
    color: munchColors.primary,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemPriceContainer: {
    justifyContent: "center",
  },
  emptyMenuText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginTop: 16,
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
  informationSubHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  loadingIndicator: {
    position: "absolute", // Ensure it overlaps the image
    top: "50%", // Center it vertically
    left: "50%", // Center it horizontally
    transform: [{ translateX: -15 }, { translateY: -15 }], // Adjust for spinner size
  },
  circleContainer: {
    position: "absolute",
    top: -65, // Adjust based on your layout
    right: 16, // Adjust to align the circle to the right
    zIndex: 10, // Ensure it appears above other elements
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
  circleLogo: {
    width: "100%", // Adjust the logo size within the circle
    height: "100%",
    resizeMode: "contain",
  },
  tabContainer: {
    // Added: Styles for tab container
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 5,
  },
  tab: {
    // Added: Styles for individual tab
    padding: 10,
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  activeTab: {
    // Added: Styles for active tab
    borderColor: munchColors.primary,
  },
  tabText: {
    // Added: Styles for tab text
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
  },
  couponItem: {
    // Added: Styles for coupon items
    padding: 16,
    backgroundColor: "#f9f9f9",
    marginVertical: 8,
    borderRadius: 8,
  },
  couponHeadline: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  couponDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  couponDetails: {
    fontSize: 14,
    color: "#777",
  },
});
