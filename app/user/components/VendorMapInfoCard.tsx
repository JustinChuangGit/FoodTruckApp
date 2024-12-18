import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import haversine from "haversine";

interface Vendor {
  uid: string;
  name: string;
  price: string;
  rating: number;
  image: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface VendorMapInfoCardProps {
  vendor: Vendor;
  onClose: () => void;
  userLocation: { latitude: number; longitude: number } | null;
}

const VendorMapInfoCard: React.FC<VendorMapInfoCardProps> = ({
  vendor,
  onClose,
  userLocation,
}) => {
  const [isFavorited, setIsFavorited] = useState(false); // Tracks heart state
  const scaleAnim = useRef(new Animated.Value(0)).current; // Scale starts at 0
  const opacityAnim = useRef(new Animated.Value(0)).current; // Opacity starts at 0

  // Determine units dynamically based on locale
  const units = useMemo(() => {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale; // e.g., "en-US"
    return locale.includes("US") ? "mile" : "km";
  }, []);

  // Calculate distance dynamically
  const distance = useMemo(() => {
    if (userLocation) {
      const start = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
      const end = {
        latitude: vendor.latitude,
        longitude: vendor.longitude,
      };

      // Calculate distance using Haversine
      const distanceValue = haversine(start, end, { unit: units });
      return distanceValue.toFixed(1); // Round to 1 decimal place
    }
    return null;
  }, [userLocation, vendor, units]);

  // Appear animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    // Disappear animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose(); // Remove the card after animation completes
    });
  };

  const handleHeartPress = () => {
    setIsFavorited((prev) => !prev); // Toggle favorite state
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleAnim }], // Scale animation
          opacity: opacityAnim, // Opacity animation
        },
      ]}
    >
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <FontAwesome name="close" size={24} color="black" />
      </TouchableOpacity>

      {/* Heart Button */}
      <TouchableOpacity style={styles.heartButton} onPress={handleHeartPress}>
        <FontAwesome
          name={isFavorited ? "heart" : "heart-o"}
          size={24}
          color={isFavorited ? "red" : "black"}
        />
      </TouchableOpacity>

      {/* Image */}
      <Image source={{ uri: vendor.image }} style={styles.image} />

      {/* Vendor Details */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{vendor.name}</Text>
        <Text style={styles.subtitle}>{vendor.description}</Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.price}>{vendor.price}</Text>
          {distance && (
            <Text style={styles.distance}>
              {distance} {units} away
            </Text>
          )}
          <Text style={styles.rating}>
            <FontAwesome name="star" size={14} color="gold" /> {vendor.rating}
          </Text>
        </View>
      </View>
    </Animated.View>
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  image: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  distance: {
    fontSize: 14,
    color: "#555",
  },
  rating: {
    fontSize: 14,
    color: "#333",
  },
});
