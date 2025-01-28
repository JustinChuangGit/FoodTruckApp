import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import CardItem from "./CardItem";
import { Vendor } from "@/constants/types";

interface Section {
  id: string;
  title: string;
  vendors: Vendor[];
}

interface CouponRowProps {
  section: Section;
  onCardPress: (vendor: Vendor) => void; // Add this prop
}

const CouponRow: React.FC<CouponRowProps> = ({ section, onCardPress }) => (
  <View style={styles.mainSection}>
    <View
      style={styles.sectionTitleContainer}
      onStartShouldSetResponder={() => true}
    >
      <Text style={styles.sectionTitle}>Coupons Based On Your Location</Text>
    </View>
    <FlatList
      data={section.vendors}
      keyExtractor={(vendor) => vendor.uid}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <CardItem vendor={item} onPress={() => onCardPress(item)} />
      )}
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
});

export default CouponRow;
