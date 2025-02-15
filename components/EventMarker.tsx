// EventMarker.tsx
import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import { Event } from "@/constants/types";
import { EventMarkerProps } from "@/constants/types";
import { FontAwesome } from "@expo/vector-icons";

const EventMarker: React.FC<EventMarkerProps> = ({ event, onPress }) => {
  return (
    <Marker
      coordinate={{
        latitude: event.region.latitude,
        longitude: event.region.longitude,
      }}
      onPress={() => onPress(event)}
    >
      <View style={styles.markerContainer}>
        {/* Replace the source with your local custom event marker image */}
        <FontAwesome name="flag" size={24} color="white" />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 165, 0, 0.8)", // semi-transparent orange
    justifyContent: "center",
    alignItems: "center",
  },
  markerImage: {
    width: 30,
    height: 30,
    tintColor: "white", // optional tint if your image is monochrome
  },
});

export default EventMarker;
