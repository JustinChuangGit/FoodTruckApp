import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface CardItemProps {
  item: string;
  index: number;
}

const CardItem: React.FC<CardItemProps> = ({ item, index }) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <View style={styles.cardItem}>
      <Text>{`${item} ${index + 1}`}</Text>
    </View>
    <View style={styles.cardSpacer} onStartShouldSetResponder={() => true} />
  </View>
);

const styles = StyleSheet.create({
  cardItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    width: 120,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  cardSpacer: { width: 10 },
});

export default CardItem;
