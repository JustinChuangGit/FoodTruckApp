import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Vendor } from "@/constants/types";
import { FontAwesome } from "@expo/vector-icons";
import { munchStyles } from "@/constants/styles";
import { logClickThrough, logImpression } from "@/services/firestore";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/authSlice"; // Update the path as needed
interface CardItemProps {
  vendor: Vendor;
  onPress: () => void; // Add this prop
}

const CardItem: React.FC<CardItemProps> = ({ vendor, onPress }) => {
  const [loading, setLoading] = useState(true); // Track image loading state
  const [isFavorited, setIsFavorited] = useState(false);
  const user = useSelector(selectUser);

  const handleHeartPress = () => {
    setIsFavorited((prev) => !prev);
  };

  const units = useMemo(() => {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.includes("US") ? "miles" : "km";
  }, []);

  useEffect(() => {
    logImpression(
      vendor.uid,
      user?.uid ?? "unknown_user", // Default value for undefined user ID
      user?.latitude ?? 0, // Default latitude
      user?.longitude ?? 0, // Default longitude
      "cardItem"
    );
  }, []); // Empty dependency array means it runs only once
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
          key={vendor.image}
          source={{ uri: vendor.image }}
          style={styles.vendorImage}
          onLoadStart={() => setLoading(true)} // Show loader
          onLoad={() => setLoading(false)} // Hide loader once loaded
        />
      </View>
      <View style={styles.vendorInfoContainer}>
        <Text style={styles.vendorName}>{vendor.vendorName}</Text>
        <TouchableOpacity style={styles.heartButton} onPress={handleHeartPress}>
          <FontAwesome
            name={isFavorited ? "heart" : "heart-o"}
            size={20}
            color={isFavorited ? "red" : "black"}
          />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.vendorPrice}>{vendor.vendorType} </Text>
          <FontAwesome name="circle" size={8} color="#888" />
          <Text style={styles.vendorPrice}> {vendor.price} </Text>
          {vendor.rating > 0 && (
            <View>
              <FontAwesome name="circle" size={8} color="#888" />
              <Text style={styles.vendorRating}> {vendor.rating}</Text>
              <FontAwesome name="star" size={12} color="#888" />
            </View>
          )}
        </View>
        <Text style={styles.vendorRating}>
          {vendor.distance !== undefined
            ? `${vendor.distance.toFixed(1)} ${units} away`
            : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardItem: {
    borderRadius: munchStyles.smallRadius,
    width: 250,
    height: "auto",
    marginLeft: 10,
    paddingHorizontal: 16,
  },
  imageContainer: {
    width: 218,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: munchStyles.smallRadius,
    overflow: "hidden", // Ensure the loader stays within the image bounds
    backgroundColor: "#e0e0e0", // Placeholder background while loading
    marginHorizontal: "auto",
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
  },
  vendorPrice: {
    fontSize: 14,
    color: "#555",
  },
  vendorRating: {
    fontSize: 14,
    color: "#888",
  },
  heartButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
  },
  vendorInfoContainer: {},
});

export default CardItem;
