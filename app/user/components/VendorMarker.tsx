import React from "react";
import { StyleSheet, View } from "react-native";
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
      <View style={styles.marker} />
    </Marker>
  );
};

export default VendorMarker;

const styles = StyleSheet.create({
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2D2D2D", // Single style for all markers
  },
});
