import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import haversine from "haversine";
import { Vendor } from "@/constants/types";

interface VendorMapInfoCardProps {
  vendor: Vendor;
  onClose: () => void;
  userLocation: { latitude: number; longitude: number } | null;
  onPress: (vendor: Vendor) => void;
}

const VendorMapInfoCard: React.FC<VendorMapInfoCardProps> = ({
  vendor,
  onClose,
  userLocation,
  onPress,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const units = useMemo(() => {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.includes("US") ? "mile" : "km";
  }, []);

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

      const distanceValue = haversine(start, end, { unit: units });
      return distanceValue.toFixed(1);
    }
    return null;
  }, [userLocation, vendor, units]);

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

  const handleHeartPress = () => {
    setIsFavorited((prev) => !prev);
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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

      {/* Main Card Area */}
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => onPress(vendor)}
      >
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
            style={styles.image}
            onLoadStart={() => setLoading(true)}
            onLoad={() => setLoading(false)}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{vendor.name}</Text>
          <Text style={styles.subtitle}>{vendor.description}</Text>

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
      </TouchableOpacity>
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
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: "row",
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
  imageContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  image: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  loadingIndicator: {
    position: "absolute",
    zIndex: 1,
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
