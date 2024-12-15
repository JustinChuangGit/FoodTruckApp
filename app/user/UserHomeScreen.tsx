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

// Types
interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface MapRegion extends LocationCoordinates {
  latitudeDelta: number;
  longitudeDelta: number;
}

interface Section {
  id: string;
  title: string;
  data: string[];
}

interface CardItemProps {
  item: string;
  index: number;
}

interface MyRowProps {
  section: Section;
}

// Snap Points
const SNAP_POINTS = {
  TOP: 100,
  BOTTOM: height - 300,
};

const SECTIONS: Section[] = [
  { id: "1", title: "Recommended for You", data: Array(10).fill("Card") },
  { id: "2", title: "Trending Now", data: Array(8).fill("Card") },
  { id: "3", title: "New Releases", data: Array(12).fill("Card") },
  { id: "4", title: "Recommended for You", data: Array(10).fill("Card") },
  { id: "5", title: "Trending Now", data: Array(8).fill("Card") },
  { id: "6", title: "New Releases", data: Array(12).fill("Card") },
];

// Child components
const CardItem: React.FC<CardItemProps> = ({ item, index }) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <View style={styles.cardItem}>
      <Text>{`${item} ${index + 1}`}</Text>
    </View>
    <View style={styles.cardSpacer} />
  </View>
);

const MyRow: React.FC<MyRowProps> = ({ section }) => (
  <View style={styles.mainSection}>
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
    <FlatList
      data={section.data}
      keyExtractor={(_, idx) => `${section.title}-${idx}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item, index }) => <CardItem item={item} index={index} />}
    />
  </View>
);

export default function UserHomeScreen() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [region, setRegion] = useState<MapRegion | null>(null);

  // Track which snap point the card is logically at
  const [currentSnapPoint, setCurrentSnapPoint] = useState(SNAP_POINTS.BOTTOM);

  // Single Animated.Value for vertical position
  const translateY = useRef(new Animated.Value(SNAP_POINTS.BOTTOM)).current;

  const panResponder = useRef(
    PanResponder.create({
      // Only drag if user touches within top 50px ("handle")
      onStartShouldSetPanResponder: (evt) => {
        const { locationY } = evt.nativeEvent;
        return locationY <= 50;
      },

      onPanResponderGrant: () => {
        // Stop any existing animation, so we can accurately read current translateY
        translateY.stopAnimation((currentVal) => {
          // currentVal is where the card actually is when finger touches down
          // Shift that position into an offset
          translateY.setOffset(currentVal);
          // Reset the base translateY to 0 for this gesture
          translateY.setValue(0);
        });
      },

      onPanResponderMove: Animated.event([null, { dy: translateY }], {
        useNativeDriver: false,
      }),

      onPanResponderRelease: () => {
        // Merge offset + value so translateY is the final distance
        translateY.flattenOffset();

        // Now figure out where user let go
        translateY.stopAnimation((finalVal) => {
          const distanceToTop = Math.abs(finalVal - SNAP_POINTS.TOP);
          const distanceToBottom = Math.abs(finalVal - SNAP_POINTS.BOTTOM);

          const closestPoint =
            distanceToTop < distanceToBottom
              ? SNAP_POINTS.TOP
              : SNAP_POINTS.BOTTOM;

          setCurrentSnapPoint(closestPoint);

          // Animate to the snap point
          Animated.spring(translateY, {
            toValue: closestPoint,
            useNativeDriver: false,
          }).start();
        });
      },
    })
  ).current;

  // Request location on mount
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

  return (
    <SafeAreaView style={styles.container}>
      {region ? (
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={(r) => setRegion(r as MapRegion)}
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

      <Animated.View
        style={[styles.card, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        {/* Drag Handle at the top (50px) */}
        <View style={styles.dragableSection}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.vendorInformationSection}>
          <FlatList
            data={SECTIONS}
            keyExtractor={(section) => section.id}
            renderItem={({ item }) => <MyRow section={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  loadingText: { fontSize: 16, color: "#555" },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    height,
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
  dragableSection: {
    marginBottom: 16,
    width: "100%",
    height: 50,
  },
  dragHandle: {
    width: 40,
    height: 6,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
  vendorInformationSection: {},
  sectionTitle: { fontSize: 16, fontWeight: "bold" },
  cardItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    width: 120,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  cardSpacer: { width: 10 },
  sectionTitleContainer: {
    height: 40,
    width: "100%",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
  },
  mainSection: { marginBottom: 16 },
});
