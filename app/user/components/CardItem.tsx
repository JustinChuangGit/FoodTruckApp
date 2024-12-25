import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Vendor } from "@/constants/types";

interface CardItemProps {
  vendor: Vendor;
  onPress: () => void; // Add this prop
}

const CardItem: React.FC<CardItemProps> = ({ vendor, onPress }) => (
  <TouchableOpacity style={styles.cardItem} onPress={onPress}>
    <Image source={{ uri: vendor.image }} style={styles.vendorImage} />
    <Text style={styles.vendorName}>{vendor.name}</Text>
    <Text style={styles.vendorPrice}>{vendor.price}</Text>
    <Text style={styles.vendorRating}>Rating: {vendor.rating}/5</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  cardItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    width: 150,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  vendorImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginBottom: 10,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  vendorPrice: {
    fontSize: 14,
    color: "#555",
  },
  vendorRating: {
    fontSize: 14,
    color: "#888",
  },
});

export default CardItem;
