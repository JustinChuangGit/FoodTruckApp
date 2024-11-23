import React, { useState, useEffect } from "react";
import {
  View,
  Alert,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

const SNAP_POINTS = {
  TOP: 0,
  MIDDLE: height / 2 - 200,
  BOTTOM: height - 300, // Adjust as needed
};

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export default function UserHomeScreen() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const translateY = useState(new Animated.Value(SNAP_POINTS.BOTTOM))[0]; // Start at bottom
  const [lastTranslateY, setLastTranslateY] = useState(SNAP_POINTS.BOTTOM); // Track the last snapped position

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location permission is required to use this feature."
          );
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = userLocation.coords;

        setLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        console.error("Error fetching location:", error);
        Alert.alert("Error", "Unable to fetch location. Please try again.");
      }
    })();
  }, []);

  // PanResponder for drag gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Sync the starting position of the drag
      translateY.stopAnimation(); // Stop any ongoing animation
    },
    onPanResponderMove: (e, gestureState) => {
      // Move the card directly with the gesture
      const newTranslateY = Math.max(
        SNAP_POINTS.TOP,
        Math.min(SNAP_POINTS.BOTTOM, lastTranslateY + gestureState.dy)
      );
      translateY.setValue(newTranslateY);
    },
    onPanResponderRelease: (e, gestureState) => {
      const endPosition = lastTranslateY + gestureState.dy;

      // Snap to the nearest point
      let closestPoint = SNAP_POINTS.BOTTOM;
      let minDistance = Math.abs(SNAP_POINTS.BOTTOM - endPosition);

      for (const point of [
        SNAP_POINTS.TOP,
        SNAP_POINTS.MIDDLE,
        SNAP_POINTS.BOTTOM,
      ]) {
        const distance = Math.abs(point - endPosition);
        if (distance < minDistance) {
          closestPoint = point;
          minDistance = distance;
        }
      }

      // Animate the card to the closest point
      Animated.spring(translateY, {
        toValue: closestPoint,
        useNativeDriver: true,
      }).start(() => {
        setLastTranslateY(closestPoint); // Update the last snapped position
      });
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {region ? (
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        >
          {location && (
            <Marker
              coordinate={location}
              title="You are here"
              description="Your current location"
            />
          )}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your location...</Text>
        </View>
      )}

      {/* Draggable Card */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateY: translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandle} />
        <Text style={styles.cardContent}>Welcome to your dashboard!</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    height: height - 200, // Adjust height to fit your needs
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 16,
  },
  dragHandle: {
    width: 40,
    height: 6,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
  cardContent: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});
