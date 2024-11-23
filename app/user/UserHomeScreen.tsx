import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Alert,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  FlatList,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

const SNAP_POINTS = {
  TOP: 0,
  MIDDLE: height / 2 - 200,
  BOTTOM: height - 300,
};

const SECTIONS = [
  { id: "1", title: "Recommended for You", data: Array(10).fill("Card") },
  { id: "2", title: "Trending Now", data: Array(8).fill("Card") },
  { id: "3", title: "New Releases", data: Array(12).fill("Card") },
  { id: "4", title: "Top Picks for You", data: Array(15).fill("Card") },
  { id: "5", title: "Popular in Your Area", data: Array(10).fill("Card") },
  { id: "6", title: "Recently Watched", data: Array(6).fill("Card") },
  { id: "7", title: "Action-Packed Favorites", data: Array(8).fill("Card") },
  { id: "8", title: "Romantic Comedies", data: Array(9).fill("Card") },
  { id: "9", title: "Family-Friendly Picks", data: Array(7).fill("Card") },
  { id: "10", title: "Highly Rated Movies", data: Array(10).fill("Card") },
];

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export default function UserHomeScreen() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const translateY = useRef(new Animated.Value(SNAP_POINTS.BOTTOM)).current;
  const [lastTranslateY, setLastTranslateY] = useState(SNAP_POINTS.BOTTOM);
  const [isAtTop, setIsAtTop] = useState(false);

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

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      translateY.stopAnimation(); // Stop any ongoing animation
    },
    onPanResponderMove: (e, gestureState) => {
      // Follow the finger directly
      const newTranslateY = Math.max(
        SNAP_POINTS.TOP,
        Math.min(SNAP_POINTS.BOTTOM, lastTranslateY + gestureState.dy)
      );
      translateY.setValue(newTranslateY);
    },
    onPanResponderRelease: (e, gestureState) => {
      const endPosition = lastTranslateY + gestureState.dy;

      // Determine the closest snap point
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

      Animated.spring(translateY, {
        toValue: closestPoint,
        useNativeDriver: true,
      }).start(() => {
        setLastTranslateY(closestPoint); // Update the last snapped position
        setIsAtTop(closestPoint === SNAP_POINTS.TOP);
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
        <FlatList
          data={SECTIONS}
          keyExtractor={(section) => section.id}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <FlatList
                data={item.data}
                keyExtractor={(_, index) => `${item.id}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ index }) => (
                  <View style={styles.cardItem}>
                    <Text>Card {index + 1}</Text>
                  </View>
                )}
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16 }}
          scrollEnabled={isAtTop} // Enable scrolling only when at top
        />
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
    flexGrow: 0,
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 8,
    width: 120,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
});
