import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import CardItem from "./CardItem";

interface Vendor {
  uid: string;
  name: string;
  price: string;
  rating: number;
  image: string;
}

interface Section {
  id: string;
  title: string;
  vendors: Vendor[];
}

interface MyRowProps {
  section: Section;
}

const MyRow: React.FC<MyRowProps> = ({ section }) => (
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
      renderItem={({ item }) => <CardItem vendor={item} />}
    />
  </View>
);

const styles = StyleSheet.create({
  mainSection: { marginBottom: 16 },
  sectionTitleContainer: {
    height: 40,
    width: "100%",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MyRow;
