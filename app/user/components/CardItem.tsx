import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Vendor } from "@/constants/types";

interface CardItemProps {
  vendor: Vendor;
  onPress: () => void; // Add this prop
}

const CardItem: React.FC<CardItemProps> = ({ vendor, onPress }) => {
  const [loading, setLoading] = useState(true); // Track image loading state

  return (
    <TouchableOpacity style={styles.cardItem} onPress={onPress}>
      <View style={styles.imageContainer}>
        {loading && (
          <ActivityIndicator
            size="small"
            color="#007bff"
            style={styles.loadingIndicator}
          />
        )}
        <Image
          source={{ uri: vendor.image }}
          style={styles.vendorImage}
          onLoadStart={() => setLoading(true)} // Show loader
          onLoad={() => setLoading(false)} // Hide loader once loaded
        />
      </View>
      <Text style={styles.vendorName}>{vendor.name}</Text>
      <Text style={styles.vendorPrice}>{vendor.price}</Text>
      <Text style={styles.vendorRating}>Rating: {vendor.rating}/5</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    width: 150,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  imageContainer: {
    width: 120,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden", // Ensure the loader stays within the image bounds
    backgroundColor: "#e0e0e0", // Placeholder background while loading
  },
  vendorImage: {
    width: "100%",
    height: "100%",
  },
  loadingIndicator: {
    position: "absolute",
    zIndex: 1, // Ensure loader stays above the image
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
