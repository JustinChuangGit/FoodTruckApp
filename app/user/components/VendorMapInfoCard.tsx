import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";
import { autoBatchEnhancer } from "@reduxjs/toolkit";
interface Vendor {
  uid: string;
  name: string;
  price: string;
  rating: number;
  image: string;
  description: string;
}
interface VendorMapInfoCardProps {
  vendor: Vendor;
}

const VendorMapInfoCard: React.FC<VendorMapInfoCardProps> = ({ vendor }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: vendor.image }} style={styles.image} />
      <View style={styles.rightContainer}>
        <Text>{vendor.name}</Text>
        <Text>{vendor.description}</Text>

        <View style={styles.footer}>
          <Text>{vendor.price}</Text>
          <Text>{vendor.rating}</Text>
        </View>
      </View>
    </View>
  );
};

export default VendorMapInfoCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    position: "absolute",
    bottom: 125,
    left: 10,
    right: 10,
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
  },
  title: {
    marginBottom: 10,
  },
  image: {
    width: 150,
    aspectRatio: 1,
  },
  rightContainer: {
    paddingLeft: 10,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
  },
});
