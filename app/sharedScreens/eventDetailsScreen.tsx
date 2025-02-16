// eventDetailsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { format } from "date-fns";
import * as Location from "expo-location";
import { munchColors } from "@/constants/Colors";
import { munchStyles } from "@/constants/styles";
import HorizontalLine from "@/components/default/HorizontalLine";

// Helper function: Format the address to show only street and city.
const formatAddress = (address?: string): string => {
  if (!address) return "";
  const parts = address.split(",");
  return parts.length >= 2 ? `${parts[0]}, ${parts[1]}`.trim() : address;
};

// Helper function: Calculate distance between two lat/lon points.
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  units: "miles" | "km"
): string => {
  const R = 6371; // Earth's radius in kilometers.
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  const distance = units === "miles" ? distanceKm * 0.621371 : distanceKm;
  return `${distance.toFixed(2)} ${units}`;
};

// Hook to determine units based on locale.
const useUnits = (): "miles" | "km" => {
  return React.useMemo(() => {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.includes("US") ? "miles" : "km";
  }, []);
};

export default function EventDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    eventId: string;
    eventTitle: string;
    eventDate: string;
    region: string;
    description: string;
    locationText?: string;
    startTime?: string;
    endTime?: string;
  }>();

  const {
    eventId,
    eventTitle,
    eventDate,
    region,
    description,
    locationText,
    startTime,
    endTime,
  } = params;
  const units = useUnits();

  // Parse the event region from the JSON string.
  let parsedRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  } | null = null;
  try {
    parsedRegion = region ? JSON.parse(region) : null;
  } catch (error) {
    console.error("Error parsing region:", error);
  }

  // Set up the initial region for the MapView.
  const initialRegion = parsedRegion
    ? {
        latitude: parsedRegion.latitude,
        longitude: parsedRegion.longitude,
        latitudeDelta: parsedRegion.latitudeDelta || 0.01,
        longitudeDelta: parsedRegion.longitudeDelta || 0.01,
      }
    : undefined;

  // Fetch the user's current location.
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  // Function to open external maps.
  const openMaps = () => {
    if (!parsedRegion) {
      Alert.alert("Error", "Event location not available");
      return;
    }
    const { latitude, longitude } = parsedRegion;
    const label = encodeURIComponent(eventTitle);
    let url = "";
    if (Platform.OS === "ios") {
      url = `maps://?q=${label}&ll=${latitude},${longitude}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open maps", err)
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <FontAwesome name="chevron-left" size={24} color="#fff" />
      </TouchableOpacity>

      {initialRegion && (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
        >
          <Marker
            coordinate={{
              latitude: initialRegion.latitude,
              longitude: initialRegion.longitude,
            }}
            title={eventTitle}
            description={locationText}
          >
            <View style={styles.customMarker}>
              <FontAwesome
                name="map-marker"
                size={30}
                color={munchColors.primary}
              />
            </View>
          </Marker>
        </MapView>
      )}

      <View style={styles.modalTextContainer}>
        <Text style={styles.modalTitle}>{eventTitle}</Text>
        <Text style={styles.modalDate}>
          {format(new Date(eventDate), "EEEE, MMM d, yyyy")}
        </Text>
        {startTime && endTime && (
          <Text style={styles.modalTime}>
            {format(new Date(startTime), "h:mm a")} -{" "}
            {format(new Date(endTime), "h:mm a")}
          </Text>
        )}
        {startTime && !endTime && (
          <Text style={styles.modalTime}>
            Start Time: {format(new Date(startTime), "h:mm a")}
          </Text>
        )}
        {endTime && !startTime && (
          <Text style={styles.modalTime}>
            End Time: {format(new Date(endTime), "h:mm a")}
          </Text>
        )}

        {userLocation && initialRegion && (
          <Text style={styles.eventDistance}>
            {calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              initialRegion.latitude,
              initialRegion.longitude,
              units
            )}{" "}
            Away
          </Text>
        )}
        <Text style={styles.modalLocation}>{formatAddress(locationText)}</Text>
        <HorizontalLine />
        <Text style={styles.modalDescription}>{description}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getDirectionsButton}
            onPress={openMaps}
          >
            <Text style={styles.getDirectionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
    backgroundColor: munchColors.primary,
    borderRadius: 20,
    padding: 8,
    width: 40,
    height: 40,
  },
  map: {
    width: "100%",
    height: 400,
    marginBottom: 10,
  },
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  modalTextContainer: {
    width: "100%",
    padding: 20,
    flex: 1,
  },
  modalTitle: {
    fontSize: 35,
    fontWeight: "bold",
    color: munchColors.primary,
    marginBottom: 20,
  },
  modalDate: {
    fontSize: 18,
    color: "#555",
  },
  modalTime: {
    fontSize: 16,
    color: "#777",
    marginTop: 5,
  },
  eventDistance: {
    fontSize: 16,
    color: "#777",
    marginTop: 5,
  },
  modalDescription: {
    fontSize: 16,
    color: "#555",
    marginTop: 10,
  },
  modalLocation: {
    fontSize: 16,
    color: munchColors.primary,
    marginTop: 5,
  },
  getDirectionsButton: {
    marginTop: 15,
    backgroundColor: munchColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: munchStyles.smallRadius,
    alignItems: "center",
    width: 350,
    height: 50,
    justifyContent: "center",
  },
  getDirectionsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
