import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Alert,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Modal,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, {
  BottomSheetView,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import Carousel from "react-native-reanimated-carousel";
import haversine from "haversine";
import MyRow from "@/components/MyRow";
import HorizontalLine from "@/components/default/HorizontalLine";
import VendorMarker from "../../../components/VendorMarker";
import VendorMapInfoCard from "../../../components/VendorMapInfoCard";
import { SECTIONS } from "../../../constants/UserConstants";
import { Vendor, LocationCoordinates } from "@/constants/types";
import { collection, onSnapshot } from "firebase/firestore";
import { db, getVendorInfo } from "@/services/firestore";
import { Section } from "@/constants/types";

//TODO: Replace with collections from Firestore
import liveVendors from "../../../dummyVendorMapData.json";
import { router } from "expo-router";
import { encode } from "punycode";

const { width } = Dimensions.get("window");

function getNearbyVendors(
  vendors: Vendor[],
  location: LocationCoordinates | null
): { id: string; title: string; vendors: Vendor[] } {
  if (!location) {
    return {
      id: "nearby",
      title: "Nearby Vendors",
      vendors: [],
    };
  }

  const sortedVendors = vendors
    .map((vendor) => ({
      ...vendor,
      distance: haversine(location, {
        latitude: vendor.latitude,
        longitude: vendor.longitude,
      }),
    }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

  return {
    id: "nearby",
    title: "Nearby Vendors",
    vendors: sortedVendors,
  };
}

function formatSections(
  sections: { id: string; title: string; vendors: Vendor[] }[]
): Section[] {
  return sections.map((section, index) => ({
    id: (index + 1).toString(),
    title: section.title,
    vendors: section.vendors,
  }));
}

export default function Index() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const SECTIONDATA = formatSections([
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
  ]);
  const snapPoints = useMemo(() => ["15%", "50%", "60%"], []);
  const scaleAnim = useRef(new Animated.Value(0)).current; // Initial scale value

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation(coords);
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "activeVendors"),
      (snapshot) => {
        const updatedVendors = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            latitude: data.location?.latitude,
            longitude: data.location?.longitude,
            price: data.price || "$$", // Default price if not provided
            name: data.name || "Unknown Vendor",
            rating: data.rating || 0, // Default rating if not provided
            description: data.description || "No description available",
            image: data.image || "https://via.placeholder.com/150", // Default image
            menu: data.menu || [], // Include menu field, default to an empty array
            vendorType: data.vendorType || "Other", // Default vendor type
            truckImage: data.truckImage || "https://via.placeholder.com/150", // Default truck image
            coupons: data.coupons || [], // Default coupons to an empty array
          };
        });
        setVendors(updatedVendors);
      },
      (error) => {
        console.error("Error fetching active vendors:", error); // Log errors
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedVendor && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: selectedVendor.latitude,
          longitude: selectedVendor.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500 // Animation duration
      );
    }
    if (selectedVendor) {
      // Grow animation
      Animated.timing(scaleAnim, {
        toValue: 1, // Full size
        duration: 300, // Animation duration
        useNativeDriver: true,
      }).start();
    } else {
      // Shrink animation
      Animated.timing(scaleAnim, {
        toValue: 0, // Shrink to nothing
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedVendor]);

  const handleMarkerPress = (vendor: Vendor) => {
    const index = vendors.findIndex((v) => v.uid === vendor.uid);
    setSelectedVendor(vendor);
    setCarouselIndex(index);
  };

  const handleCardClose = () => {
    setSelectedVendor(null);
    setCarouselIndex(0);
  };

  const handleCardPress = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    const index = vendors.findIndex((v) => v.uid === vendor.uid);
    setCarouselIndex(index);

    const location = JSON.stringify({
      latitude: vendor.latitude,
      longitude: vendor.longitude,
    });
    const menu = JSON.stringify(vendor.menu);

    router.push({
      pathname: "/sharedScreens/userVendorInfo",
      params: {
        uid: vendor.uid,
        location: encodeURIComponent(location),
        menu: encodeURIComponent(menu),
        name: vendor.name,
        vendorType: vendor.vendorType,
        price: vendor.price,
        description: vendor.description,
        image: encodeURIComponent(vendor.image), // Encode the image URL
        rating: vendor.rating,
        coupons: encodeURIComponent(JSON.stringify(vendor.coupons)),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          showsUserLocation={true}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {vendors.map((vendor) => (
            <VendorMarker
              key={vendor.uid}
              vendor={vendor}
              onPress={() => handleMarkerPress(vendor)}
            />
          ))}

          {selectedVendor && (
            <Marker
              coordinate={{
                latitude: selectedVendor.latitude,
                longitude: selectedVendor.longitude,
              }}
              zIndex={999} // Higher zIndex for selected
            >
              {/* Animated Marker */}
              <Animated.View
                style={[
                  styles.selectedMarker,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <View style={styles.selectedMarkerInner} />
              </Animated.View>
            </Marker>
          )}
        </MapView>
      )}

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
                onClose={handleCardClose}
                onPress={(vendor) => handleCardPress(vendor)} // Pass the vendor to handleCardPress
              />
            )}
            onSnapToItem={(index) => {
              setCarouselIndex(index);
              handleMarkerPress(vendors[index]);
            }}
            defaultIndex={carouselIndex}
          />
        </View>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={2}
        snapPoints={snapPoints}
        enableOverDrag={false}
        topInset={100}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.dragSectionHeaderContainer}>
            <Text style={styles.dragSectionHeader}>For You</Text>
            <Text style={styles.dragSectionSubheader}>
              Checkout some spots we think you'd like
            </Text>
            <HorizontalLine />
          </View>
          <BottomSheetFlatList
            data={SECTIONDATA}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MyRow section={item} onCardPress={handleCardPress} />
            )}
            contentContainerStyle={{
              paddingHorizontal: 0, // Remove extra padding here
              paddingBottom: 16, // Optional for spacing at the bottom
            }}
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
    paddingTop: 10,
  },
  dragSectionHeader: {
    fontSize: 28,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Align modal to the bottom
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
  },
  modalContent: {
    ...StyleSheet.absoluteFillObject, // Extend modal to fill the bottom area
    backgroundColor: "#fff", // Modal background
    borderTopLeftRadius: 20, // Rounded corners at the top
    borderTopRightRadius: 20,
    paddingBottom: 32, // Extra padding to account for the safe area
  },
  logo: {
    width: "100%", // Fill the container's width
    height: "100%", // Fill the container's height
    resizeMode: "cover", // Scale the image to cover the container
    zIndex: 1, // Place the image above other content
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  menuHeader: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  menuList: {
    paddingBottom: 16, // Adds spacing below the last item
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#555",
  },
  menuItemPrice: {
    fontSize: 14,
    color: "#007bff",
    marginTop: 4,
  },
  dragSectionHeaderContainer: {
    paddingHorizontal: 16,
  },
  emptyMenuText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 16,
  },
  categoryHeader: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 20,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemPriceContainer: {
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "red",
    height: 300,
  },
  modalInformationContainer: {
    paddingHorizontal: 16,
  },
  selectedMarker: {
    width: 30,
    height: 30,
    borderRadius: 15, // Make it a circle for better appearance
    backgroundColor: "#FF6F61", // Slightly transparent white
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000", // Optional: Add shadow for better visibility
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1, // Place the marker above other content
    elevation: 5, // Android shadow
  },
  selectedMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 15, // Inner circle
    backgroundColor: "white", // Inner circle color
    zIndex: 999, // Place the marker above other content
  },
});
