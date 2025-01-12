import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MenuItem } from "@/constants/types";
import { FontAwesome } from "@expo/vector-icons";
import HorizontalLine from "@/components/default/HorizontalLine";

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
  }>();

  const [contentWidth, setContentWidth] = useState(0);

  const {
    location = "{}",
    menu = "[]",
    name,
    vendorType,
    price,
    description,
    image,
    rating,
  } = params;

  const parsedMenu: MenuItem[] = JSON.parse(menu);
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
                <Image source={{ uri: image }} style={styles.logo} />
              ) : (
                <Text style={styles.imageFallbackText}>
                  Image not available
                </Text>
              )}
            </View>
            <View style={styles.informationContainer}>
              <Text style={styles.name}>{name}</Text>
              <View style={styles.informationSubHeaderContainer}>
                <Text style={styles.vendorPrice}>{vendorType} </Text>
                <FontAwesome name="circle" size={8} color="#888" />
                <Text style={styles.vendorPrice}> {price} </Text>
                <FontAwesome name="circle" size={8} color="#888" />
                <Text style={styles.vendorRating}> {rating}</Text>
                <FontAwesome name="star" size={12} color="#888" />
              </View>
              <Text style={styles.description}>{description}</Text>

              {/* Horizontal FlatList for Categories */}
              <HorizontalLine />
              <View
                style={{
                  alignItems: categories.length <= 3 ? "center" : "flex-start", // Center for 3 or fewer categories
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
              </View>

              <HorizontalLine />
            </View>
          </>
        ),
      },
    ];

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

  // Render a single item in the vertical FlatList
  const renderItem = ({ item }: { item: any }) => {
    if (item.type === "header") {
      return item.component;
    } else if (item.type === "category") {
      return <Text style={styles.categoryHeader}>{item.title}</Text>;
    } else if (item.type === "item") {
      return (
        <View style={styles.menuItem}>
          <View style={styles.menuItemTextContainer}>
            <Text style={styles.menuItemName}>{item.name}</Text>
            <Text style={styles.menuItemDescription}>{item.description}</Text>
          </View>
          <View style={styles.menuItemPriceContainer}>
            <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
          </View>
        </View>
      );
    } else if (item.type === "empty") {
      return <Text style={styles.emptyMenuText}>{item.message}</Text>;
    }
    return null;
  };

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
    paddingHorizontal: 8, // Add spacing if necessary
  },
  horizontalItem: {
    marginRight: 16,
  },
  horizontalItemText: {
    color: "black",
    fontSize: 25,
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
    padding: 16,
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
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
    color: "#007bff",
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
});
