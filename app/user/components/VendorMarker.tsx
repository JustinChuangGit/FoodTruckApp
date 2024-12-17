import React from "react";
import { Marker } from "react-native-maps";

interface Vendor {
  uid: string;
  latitude: number;
  longitude: number;
  price: string;
  name: string;
  rating: number;
  description: string;
  image: string;
}

interface VendorMarkerProps {
  vendor: Vendor;
  onPress: () => void;
}

const VendorMarker: React.FC<VendorMarkerProps> = ({ vendor, onPress }) => {
  return (
    <Marker
      onPress={onPress}
      key={vendor.uid}
      coordinate={{
        latitude: vendor.latitude,
        longitude: vendor.longitude,
      }}
    />
  );
};

export default VendorMarker;
