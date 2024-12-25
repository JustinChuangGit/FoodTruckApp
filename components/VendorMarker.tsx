import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { Marker } from "react-native-maps";

interface Vendor {
  uid: string;
  latitude: number;
  longitude: number;
  name: string;
  image?: string; // Optional vendor-specific icon or image
}

interface VendorMarkerProps {
  vendor: Vendor;
  onPress: () => void; // Callback when the marker is pressed
}

const VendorMarker: React.FC<VendorMarkerProps> = ({ vendor, onPress }) => {
  return (
    <Marker
      coordinate={{
        latitude: vendor.latitude,
        longitude: vendor.longitude,
      }}
      onPress={onPress}
    >
      {/* Custom Marker Design */}
      <View style={styles.markerContainer}>
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}></View>
        </View>
      </View>
    </Marker>
  );
};

export default VendorMarker;

const styles = StyleSheet.create({
  markerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  outerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF6F61", // Outer background
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 15,
    backgroundColor: "white", // Inner background
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20, // Adjust size to fit within the marker
  },
});
