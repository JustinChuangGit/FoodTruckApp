import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MenuItem } from "@/constants/types";
import { munchColors } from "@/constants/Colors";

type RenderMenuProps = {
  menu: MenuItem[];
  scrollToCategory: (category: string) => void;
};

export const RenderMenu: React.FC<RenderMenuProps> = ({
  menu,
  scrollToCategory,
}) => {
  // Group menu items by category
  const menuData = menu.reduce((acc: { [key: string]: MenuItem[] }, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(menuData);

  return (
    <View style={styles.menuContainer}>
      {/* <FlatList
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
      /> */}
      <FlatList
        data={categories}
        keyExtractor={(item) => `category-${item}`}
        renderItem={({ item }) => (
          <View>
            <Text style={styles.categoryHeader}>{item}</Text>
            {menuData[item].map((menuItem) => (
              <View key={menuItem.name} style={styles.menuItem}>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemName}>{menuItem.name}</Text>
                  <Text style={styles.menuItemDescription}>
                    {menuItem.description}
                  </Text>
                </View>
                <Text style={styles.menuItemPrice}>
                  ${menuItem.price.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalList: {
    flexDirection: "row",
    height: 40,
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
    color: munchColors.primary,
  },
  menuContainer: {
    backgroundColor: "white",
    paddingBottom: 50,
  },
});
