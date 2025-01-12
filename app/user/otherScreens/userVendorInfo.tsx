import React from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MenuItem } from "@/constants/types";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const decodedImage = decodeURIComponent(image);

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

              <View
                style={{
                  marginVertical: 16,
                  height: 1,
                  backgroundColor: "#ddd",
                }}
              />
              <Text style={styles.menuHeader}>Menu</Text>
            </View>
          </>
        ),
      },
    ];

    const menuData = parsedMenu.length
      ? parsedMenu.reduce((acc: any[], item) => {
          const categoryIndex = acc.findIndex(
            (data) => data.type === "category" && data.title === item.category
          );
          if (categoryIndex === -1) {
            acc.push({ type: "category", title: item.category });
          }
          acc.push({ type: "item", ...item });
          return acc;
        }, [])
      : [{ type: "empty", message: "No menu items available" }];

    return [...headerData, ...menuData];
  };

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
    <View>
      <FlatList
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
  informationContainer: {
    padding: 16,
  },
  name: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 3,
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    marginBottom: 16,
  },
  closeButton: {
    position: "absolute", // Make the button positioned absolutely
    top: 50, // Distance from the top
    left: 10, // Distance from the left
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10, // Ensure the button appears above other content
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  menuHeader: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 8,
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
  imageFallbackText: {
    textAlign: "center",
    color: "#555",
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
  iconOutline: {
    position: "absolute",
  },
  icon: {
    position: "absolute",
    top: 19,
    left: 26,
  },
});
