import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";

interface Vendor {
  uid: string;
  latitude: number;
  longitude: number;
  name: string;
}

interface VendorMarkerProps {
  vendor: Vendor;
  onPress: () => void; // Callback when the marker is pressed
  isSelected: boolean; // Whether the marker is selected
}

const VendorMarker: React.FC<VendorMarkerProps> = ({
  vendor,
  onPress,
  isSelected,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current; // Default scale is 1

  // Animate marker size when selected or deselected
  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isSelected ? 1.5 : 1, // Scale up if selected, normal otherwise
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  return (
    <Marker
      coordinate={{
        latitude: vendor.latitude,
        longitude: vendor.longitude,
      }}
      onPress={onPress}
    >
      {/* Animated marker view */}
      <Animated.View
        style={[styles.marker, { transform: [{ scale: scaleAnim }] }]}
      >
        <View
          style={isSelected ? styles.selectedMarker : styles.defaultMarker}
        />
      </Animated.View>
    </Marker>
  );
};

export default VendorMarker;

const styles = StyleSheet.create({
  marker: {
    justifyContent: "center",
    alignItems: "center",
  },
  defaultMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
  },
  selectedMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "orange",
    borderWidth: 2,
    borderColor: "white",
  },
});
