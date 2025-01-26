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

type RenderMenuProps = {
  menu: MenuItem[];
  scrollToCategory: (category: string) => void;
};
export const RenderMenu: React.FC<RenderMenuProps> = ({
  menu,
  scrollToCategory,
}) => {
  const categories = menu.reduce((acc: string[], item) => {
    if (!acc.includes(item.category)) {
      acc.push(item.category);
    }
    return acc;
  }, []);

  const menuData = menu.reduce((acc: any[], item) => {
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
              <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
            </View>
          )
        }
      />
    </>
  );
};
const styles = StyleSheet.create({
  horizontalList: {
    flexDirection: "row",
  },
  horizontalItem: {
    marginRight: 16,
  },
  horizontalItemText: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
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
  menuItemTextContainer: {
    flex: 1,
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
});
