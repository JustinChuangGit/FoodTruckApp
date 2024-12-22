import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Alert,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Carousel from "react-native-reanimated-carousel";
import haversine from "haversine";
import MyRow from "../components/MyRow";
import HorizontalLine from "@/components/HorizontalLine";
import liveVendors from "../../../dummyVendorMapData.json";
import VendorMarker from "../components/VendorMarker";
import VendorMapInfoCard from "../components/VendorMapInfoCard";
import { SECTIONS } from "../../../constants/UserConstants";

const { width } = Dimensions.get("window");

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface Vendor {
  uid: string;
  latitude: number;
  longitude: number;
  price: string;
  name: string;
  rating: number;
  description: string;
  image: string;
  distance?: number;
}

export default function Index() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0); // Track carousel's active index
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["15%", "50%", "60%"], []);

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

        // Calculate distances and sort vendors
        const sortedVendors = liveVendors
          .map((vendor) => {
            const distance = haversine(
              { latitude, longitude },
              { latitude: vendor.latitude, longitude: vendor.longitude },
              { unit: "km" }
            );
            return { ...vendor, distance };
          })
          .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

        setVendors(sortedVendors);
      } catch (error) {
        Alert.alert("Error", "Unable to fetch location.");
      }
    })();
  }, []);

  const handleMarkerPress = (vendor: Vendor) => {
    const index = vendors.findIndex((v) => v.uid === vendor.uid);
    setSelectedVendor(vendor); // Show the selected vendor
    setCarouselIndex(index); // Update carousel index
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: vendor.latitude,
          longitude: vendor.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  const handleCardClose = () => {
    setSelectedVendor(null); // Clear selected vendor state
  };

  return (
    <SafeAreaView style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          // mapType="mutedStandard"
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={location} title="You are here" />
          {vendors.map((vendor) => (
            <VendorMarker
              key={vendor.uid}
              vendor={vendor}
              onPress={() => handleMarkerPress(vendor)}
            />
          ))}
        </MapView>
      )}

      {/* Vendor Carousel */}
      {selectedVendor && (
        <View style={styles.carouselContainer}>
          <Carousel
            width={width * 0.9}
            height={250}
            data={vendors}
            renderItem={({ index }) => (
              <VendorMapInfoCard
                vendor={vendors[index]}
                userLocation={location}
                onClose={handleCardClose} // Close the card
              />
            )}
            onSnapToItem={(index) => {
              setCarouselIndex(index); // Update the active index
              handleMarkerPress(vendors[index]); // Sync map and marker
            }}
            defaultIndex={carouselIndex} // Ensure the correct card is shown
          />
        </View>
      )}

      <BottomSheet ref={bottomSheetRef} index={1} snapPoints={snapPoints}>
        <BottomSheetView style={styles.bottomSheetContent}>
          <Text style={styles.dragSectionHeader}>For You</Text>
          <Text style={styles.dragSectionSubheader}>
            Checkout some spots we think you'd like
          </Text>
          <HorizontalLine />
          <FlatList
            data={SECTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MyRow section={item} />}
            contentContainerStyle={{ padding: 16 }}
          />
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  carouselContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  dragSectionHeader: {
    fontSize: 24,
    fontWeight: "bold",
  },
  dragSectionSubheader: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
  },
});
