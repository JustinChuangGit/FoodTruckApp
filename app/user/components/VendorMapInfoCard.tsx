import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

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
  onClose: () => void; // Callback for closing the card
}

const VendorMapInfoCard: React.FC<VendorMapInfoCardProps> = ({
  vendor,
  onClose,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);

  // Animated values for the appear and disappear animation
  const scaleAnim = useRef(new Animated.Value(0)).current; // Starts at 0 (invisible)
  const opacityAnim = useRef(new Animated.Value(0)).current; // Starts at 0 (invisible)

  useEffect(() => {
    // Appear animation: Scale up and fade in
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

  const handleClose = () => {
    // Disappear animation: Scale down and fade out
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
      // Call the onClose callback after the animation finishes
      onClose();
    });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleAnim }], // Shrink/Grow animation
          opacity: opacityAnim, // Fade animation
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
          <Text style={styles.price}>{vendor.price} night</Text>
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
  rating: {
    fontSize: 14,
    color: "#333",
  },
});
