import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import CardItem from "./CardItem";
import { Vendor } from "@/constants/types";

interface Section {
  id: string;
  title: string;
  vendors: Vendor[];
}

interface MyRowProps {
  section: Section;
  onCardPress: (vendor: Vendor) => void; // Add this prop
}

const MyRow: React.FC<MyRowProps> = ({ section, onCardPress }) => (
  <View style={styles.mainSection}>
    <View
      style={styles.sectionTitleContainer}
      onStartShouldSetResponder={() => true}
    >
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
    <FlatList
      data={section.vendors}
      keyExtractor={(vendor) => vendor.uid}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <CardItem vendor={item} onPress={() => onCardPress(item)} />
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No vendors online, please check back soon.
          </Text>
        </View>
      }
    />
  </View>
);

const styles = StyleSheet.create({
  mainSection: { marginVertical: 16 },
  sectionTitleContainer: {
    height: "auto",
    width: "100%",
    justifyContent: "center",
    paddingLeft: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "gray",
    textAlign: "center",
    paddingHorizontal: 30,
  },
});

export default MyRow;
