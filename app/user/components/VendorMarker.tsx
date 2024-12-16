import React from "react";
import { Marker } from "react-native-maps";

interface Vendor {
  uid: string;
  latitude: number;
  longitude: number;
  name: string;
  description: string;
}

interface VendorMarkerProps {
  vendor: Vendor; // vendor already contains all necessary properties
}

const VendorMarker: React.FC<VendorMarkerProps> = ({ vendor }) => {
  return (
    <Marker
      coordinate={{
        latitude: vendor.latitude,
        longitude: vendor.longitude,
      }}
      title={vendor.name}
      description={vendor.description}
    />
  );
};

export default VendorMarker;
