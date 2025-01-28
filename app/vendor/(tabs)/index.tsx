import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Alert,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
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
import { Vendor, LocationCoordinates } from "@/constants/types";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firestore";
import { Section } from "@/constants/types";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/authSlice"; // Update the path as needed
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { updateLocation } from "@/redux/authSlice"; // Adjust the path
import CouponManager from "@/components/CouponManager";

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
  const SECTIONDATA = formatSections([getNearbyVendors(vendors, location)]);
  const snapPoints = useMemo(() => ["15%", "50%", "100%"], []);
  const scaleAnim = useRef(new Animated.Value(0)).current; // Initial scale value
  const [isVendorActive, setVendorActive] = useState(false);
  const [buttonColorAnim] = useState(new Animated.Value(0));
  const user = useSelector(selectUser);
  const userName = user?.name || "Vendor Name";
  const hasRunOnce = useRef(false); // Track if the logic has run
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;
      setLocation(coords);

      // Dispatch the action to update the location in Redux
      dispatch(updateLocation({ latitude, longitude }));
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "activeVendors"),
      (snapshot) => {
        const updatedVendors = snapshot.docs.map((doc) => {
          const data = doc.data();
          const vendorCoupons = doc.id === user?.uid ? user?.coupons : []; // Use coupons from Redux for the current vendor

          return {
            uid: doc.id,
            latitude: data.location?.latitude,
            longitude: data.location?.longitude,
            price: data.price || "$$",
            name: data.name || "Unknown Vendor",
            rating: data.rating || 0,
            description: data.description || "No description available",
            image: data.image || "https://via.placeholder.com/150",
            menu: data.menu || [],
            vendorType: data.vendorType || "Other",
            truckImage: data.truckImage || "https://via.placeholder.com/150",
            coupons: vendorCoupons || [], // Attach coupons for the current vendor
            vendorName: data.vendorName || "Unknown Vendor",
          };
        });

        setVendors(updatedVendors);

        // Run setVendorActive only once
        if (!hasRunOnce.current) {
          const isActive = snapshot.docs.some((doc) => doc.id === user?.uid);
          setVendorActive(isActive);
          hasRunOnce.current = true; // Mark as executed
        }
      },
      (error) => {
        console.error("Error fetching active vendors:", error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, user?.coupons]);

  useEffect(() => {
    if (
      selectedVendor &&
      !vendors.some((vendor) => vendor.uid === selectedVendor.uid)
    ) {
      setSelectedVendor(null);
      setCarouselIndex(0); // Reset carouselIndex to a valid value
      Alert.alert(
        "Vendor Unavailable",
        "The selected vendor is no longer active."
      );
    }
  }, [vendors, selectedVendor]);

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
        vendorName: vendor.vendorName,
        vendorType: vendor.vendorType,
        price: vendor.price,
        description: vendor.description,
        image: encodeURIComponent(vendor.image), // Encode the image URL
        rating: vendor.rating,
        truckImage: encodeURIComponent(vendor.truckImage), // Encode the truck image URL
      },
    });
  };
  const toggleVendorActive = async (uid: string | undefined) => {
    if (!uid) {
      console.error("User UID is not available");
      return;
    }

    if (!location) {
      Alert.alert("Error", "Location is not available. Please try again.");
      return;
    }

    try {
      if (!isVendorActive) {
        if (!user || !user.isVendor) {
          console.error("User is not a vendor or not logged in.");
          return;
        }

        // Include coupons directly in the vendor data
        const vendorData = {
          uid,
          timestamp: new Date().toISOString(),
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          menu: user.menu || [], // Include the vendor's menu
          name: user.name, // Include vendor's name
          vendorType: user.vendorType, // Include vendor's type
          price: user.price, // Include vendor's price range
          description: user.description, // Include vendor's description
          image: user.image || null, // Include vendor's logo image
          truckImage: user.truckImage || null, // Include vendor's truck image
          coupons: user.coupons || [], // Include coupons directly
        };

        // Add the vendor to the `activeVendors` collection
        await setDoc(doc(db, "activeVendors", uid), vendorData);

        console.log(
          "User added to activeVendors collection with location, menu, and coupons"
        );
      } else {
        // Remove the vendor from the `activeVendors` collection
        await deleteDoc(doc(db, "activeVendors", uid));

        console.log("User removed from activeVendors collection");
      }

      setVendorActive((prev) => !prev); // Toggle the local state
    } catch (error) {
      console.error("Error toggling vendor active status:", error);
      Alert.alert("Error", "Failed to toggle vendor status. Please try again.");
    }
  };

  const buttonBackgroundColor = buttonColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#90EE90", "#FF7F7F"], // Green for inactive, red for active
  });
  useEffect(() => {
    Animated.timing(buttonColorAnim, {
      toValue: isVendorActive ? 1 : 0, // 1 for active, 0 for inactive
      duration: 500, // Animation duration
      useNativeDriver: false, // Required for color interpolation
    }).start();
  }, [isVendorActive]);

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
          {" "}
          <Text style={styles.dragSectionHeader}>{userName}</Text>{" "}
          <Text style={styles.dragSectionSubheader}>Manage your store</Text>
          <HorizontalLine />{" "}
          <BottomSheetFlatList
            data={SECTIONDATA}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BottomSheetView>
                <TouchableOpacity
                  onPress={() => user && toggleVendorActive(user.uid)}
                >
                  <Animated.View
                    style={[
                      styles.toggleButton,
                      { backgroundColor: buttonBackgroundColor },
                    ]}
                  >
                    <Text style={styles.toggleButtonText}>
                      {isVendorActive ? "Close Up Shop" : "Go Live"}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
                <MyRow section={item} onCardPress={handleCardPress} />
                <CouponManager />
              </BottomSheetView>
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
    padding: 16, // Add padding for content
    paddingBottom: 32, // Extra padding to account for the safe area
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
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
    fontSize: 18,
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
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    height: 65,
    justifyContent: "center",
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
