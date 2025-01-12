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
    uid,
    location = "{}",
    menu = "[]",
    name,
    vendorType,
    price,
    description,
    image,
    rating,
  } = params;

  const parsedLocation = JSON.parse(location); // Parse location object
  const parsedMenu: MenuItem[] = JSON.parse(menu);
  const decodedImage = decodeURIComponent(image);

  const formatMenuWithHeaders = (menu: MenuItem[]) => {
    const grouped = menu.reduce((acc: Record<string, MenuItem[]>, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    const formatted = [];
    for (const [category, items] of Object.entries(grouped)) {
      formatted.push({ type: "header", title: category }); // Header type
      formatted.push(
        ...items.map((item) => ({
          ...item,
          type: "item", // Item type
        }))
      );
    }
    return formatted;
  };

  console.log("image", image);
  console.log("decodedImage", decodedImage);

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.logoContainer}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.logo}
              // onError={(error) => console.error("Image load error:", error)}
            />
          ) : (
            <Text style={styles.imageFallbackText}>Image not available</Text>
          )}
        </View>
        <View style={styles.modalInformationContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.price}>Price: {price}</Text>
          <Text style={styles.rating}>Rating: {rating}/5</Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>

          <View
            style={{ marginVertical: 16, height: 1, backgroundColor: "#ddd" }}
          />

          <Text style={styles.menuHeader}>Menu</Text>
          {parsedMenu.length > 0 ? (
            <FlatList
              data={formatMenuWithHeaders(parsedMenu)}
              keyExtractor={(item, index) =>
                item.type === "header"
                  ? `header-${index}`
                  : `item-${(item as MenuItem).name}-${index}`
              }
              renderItem={({ item }) => {
                if (item.type === "header") {
                  // Render headers safely

                  return (
                    <Text style={styles.categoryHeader}>
                      {(item as { title: string }).title}
                    </Text>
                  );
                } else if (isMenuItem(item)) {
                  // Render menu items safely
                  return (
                    <View style={styles.menuItem}>
                      <View style={styles.menuItemTextContainer}>
                        <Text style={styles.menuItemName}>{item.name}</Text>
                        <Text style={styles.menuItemDescription}>
                          {item.description}
                        </Text>
                      </View>
                      <View style={styles.menuItemPriceContainer}>
                        <Text style={styles.menuItemPrice}>
                          ${item.price.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  );
                }
                return null; // Fallback for unexpected types
              }}
              contentContainerStyle={styles.menuList}
            />
          ) : (
            <Text style={styles.emptyMenuText}>No menu items available</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    paddingBottom: 32,
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
  modalInformationContainer: {
    paddingHorizontal: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
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
    marginTop: 16,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "center",
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
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
  menuList: {
    paddingBottom: 16, // Adjust for spacing below the last item
  },
  imageFallbackText: {
    textAlign: "center",
    color: "#555",
  },
});

function isMenuItem(item: any): item is MenuItem {
  return item.type === "item";
}
