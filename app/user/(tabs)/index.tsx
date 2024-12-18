import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { View, Alert, Text, StyleSheet, FlatList } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MyRow from "../components/MyRow";
import HorizontalLine from "@/components/HorizontalLine";
import liveVendors from "../../../dummyVendorMapData.json";
import VendorMarker from "../components/VendorMarker";
import VendorMapInfoCard from "../components/VendorMapInfoCard";
import { SECTIONS } from "../../../constants/UserConstants";

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
}

export default function Index() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [region, setRegion] = useState<any | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

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
          {liveVendors.map((vendor) => (
            <VendorMarker
              key={vendor.uid}
              vendor={vendor}
              onPress={() => setSelectedVendor(vendor)}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your location...</Text>
        </View>
      )}

      {selectedVendor && (
        <VendorMapInfoCard
          vendor={selectedVendor}
          userLocation={location} // Pass user location here
          onClose={() => setSelectedVendor(null)} // Hides the card
        />
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
    position: "relative", // Ensure proper positioning
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0, // Set a lower z-index for the map
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
  loadingContainer: {},
  loadingText: {
    fontSize: 18,
  },
});
