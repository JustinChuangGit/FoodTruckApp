import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Alert,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  FlatList,
  Dimensions,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { SNAP_POINTS, SECTIONS } from "../../../constants/UserConstants";
import MyRow from "../components/MyRow";
import HorizontalLine from "@/components/HorizontalLine";

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface MapRegion extends LocationCoordinates {
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function Index() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [region, setRegion] = useState<MapRegion | null>(null);
  const [currentSnapPoint, setCurrentSnapPoint] = useState(SNAP_POINTS.BOTTOM);
  const translateY = useRef(new Animated.Value(SNAP_POINTS.BOTTOM)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.locationY <= 50,
      onPanResponderGrant: () => {
        translateY.stopAnimation((currentVal) => {
          translateY.setOffset(currentVal);
          translateY.setValue(0);
        });
      },
      onPanResponderMove: Animated.event([null, { dy: translateY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        translateY.flattenOffset();
        translateY.stopAnimation((finalVal) => {
          const closestPoint =
            Math.abs(finalVal - SNAP_POINTS.TOP) <
            Math.abs(finalVal - SNAP_POINTS.BOTTOM)
              ? SNAP_POINTS.TOP
              : SNAP_POINTS.BOTTOM;
          setCurrentSnapPoint(closestPoint);
          Animated.spring(translateY, {
            toValue: closestPoint,
            useNativeDriver: false,
          }).start();
        });
      },
    })
  ).current;

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location permission is required.");
          return;
        }
        const { coords } = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = coords;
        setLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        Alert.alert("Error", "Unable to fetch location.");
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {region ? (
        <MapView style={styles.map} region={region}>
          {location && <Marker coordinate={location} title="You are here" />}
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
        <View>
          <View style={styles.dragHandle} />
          <Text style={styles.dragSectionHeader}>For You</Text>
          <HorizontalLine />
        </View>
        <FlatList
          data={SECTIONS}
          keyExtractor={(section) => section.id}
          renderItem={({ item }) => <MyRow section={item} />}
          contentContainerStyle={{ padding: 16 }}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: "#555" },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    height: Dimensions.get("window").height,
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
  dragSectionHeader: {
    fontSize: 30,
    fontWeight: "bold",
  },
});
