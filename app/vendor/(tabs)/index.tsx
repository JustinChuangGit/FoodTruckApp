import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Alert,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Linking,
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
import { db, updateTrackingEnabled } from "@/services/firestore";
import { Section } from "@/constants/types";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { selectUser, updateTrackingPermission } from "../../../redux/authSlice"; // Update the path as needed
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { updateLocation } from "@/redux/authSlice"; // Adjust the path
import CouponManager from "@/components/CouponManager";
import { getSortedEvents } from "@/services/firestore";
import { Event } from "@/constants/types";
import EventListRow from "@/components/EventListRow";
import EventMarker from "@/components/EventMarker";
import EventMapInfoCard from "@/components/EventMapInfoCard";
import { FontAwesome } from "@expo/vector-icons";
import { munchColors } from "@/constants/Colors";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";

const PermissionScreen = ({
  onRequestPermissions,
}: {
  onRequestPermissions: () => void;
}) => {
  return (
    <SafeAreaView style={styles.permissionContainer}>
      <Text style={styles.permissionText}>
        Please grant Location permissions to continue.
      </Text>
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={onRequestPermissions}
      >
        <Text style={styles.permissionButtonText}>Grant Permissions</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
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
  const userName = user?.vendorName || "Vendor Name";
  const hasRunOnce = useRef(false); // Track if the logic has run
  const dispatch = useDispatch();
  const vendorPaid = user?.vendorPaid || false;
  const [sortedEvents, setSortedEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventCarouselIndex, setEventCarouselIndex] = useState(0);
  const [activeCarousel, setActiveCarousel] = useState<
    "vendor" | "event" | null
  >(null);

  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const checkPermissions = async () => {
    // Check Location Permission
    let { status: locStatus } = await Location.getForegroundPermissionsAsync();
    if (locStatus !== "granted") {
      const result = await Location.requestForegroundPermissionsAsync();
      if (result.status !== "granted") {
        Alert.alert(
          "Location Permission Denied",
          "Please enable location permissions in Settings."
        );
        return;
      }
      locStatus = result.status;
    }
    setHasLocationPermission(true);
    const { coords } = await Location.getCurrentPositionAsync({});
    setLocation(coords);
    const { latitude, longitude } = coords;
    dispatch(updateLocation({ latitude, longitude }));
    const trackingResult = await requestTrackingPermissionsAsync();
    if (trackingResult.status === "granted") {
      console.log("Tracking permission granted");
      updateTrackingEnabled(user?.uid ?? "", true);
      dispatch(updateTrackingPermission(true));
    } else {
      console.log("Tracking permission denied");
      updateTrackingEnabled(user?.uid ?? "", false);
      dispatch(updateTrackingPermission(false));
    }
  };

  // Run the permission check once on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const events = await getSortedEvents();
        setSortedEvents(events);
      } catch (error) {
        console.error("Error fetching sorted events:", error);
      } finally {
        setLoadingEvents(false);
      }
    })();
  }, []);
  // After you filter for upcoming events:
  const upcomingEvents = sortedEvents.filter(
    (event) => new Date(event.date).getTime() >= new Date().setHours(0, 0, 0, 0)
  );

  // Compute and add the distance property (in meters) if location is available.
  const eventsWithDistance = location
    ? upcomingEvents.map((event) => {
        if (
          event.region &&
          typeof event.region.latitude === "number" &&
          typeof event.region.longitude === "number"
        ) {
          const distance = haversine(
            location,
            {
              latitude: event.region.latitude,
              longitude: event.region.longitude,
            },
            { unit: "meter" }
          );
          return { ...event, distance };
        }
        return event;
      })
    : upcomingEvents;
  const todayEvents = eventsWithDistance.filter(
    (event) =>
      new Date(event.date).setHours(0, 0, 0, 0) ===
      new Date().setHours(0, 0, 0, 0)
  );

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
    console.log("Marker pressed");
    const index = vendors.findIndex((v) => v.uid === vendor.uid);
    // Set vendor carousel active and clear event carousel
    setActiveCarousel("vendor");
    setSelectedVendor(vendor);
    setSelectedEvent(null);
    setCarouselIndex(index);
  };
  const handleEventMarkerPress = (event: Event, index: number) => {
    // Set event carousel active and clear vendor carousel
    setActiveCarousel("event");
    setSelectedEvent(event);
    setSelectedVendor(null);
    setEventCarouselIndex(index);
    if (mapRef.current && event.region) {
      mapRef.current.animateToRegion(
        {
          latitude: event.region.latitude,
          longitude: event.region.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };
  const handleEventPress = (event: Event) => {
    setActiveCarousel("event");
    setSelectedEvent(event);
    setSelectedVendor(null);

    const index = todayEvents.findIndex((e) => e.id === event.id);
    console.log("Event index:", index);

    if (index !== -1) {
      setEventCarouselIndex(index);

      if (mapRef.current && event.region) {
        mapRef.current.animateToRegion(
          {
            latitude: event.region.latitude,
            longitude: event.region.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500 // animation duration in ms
        );
      }
    }
    // Push to the event details page with parameters.
    router.push({
      pathname: "/sharedScreens/eventDetailsScreen",
      params: {
        eventId: event.id,
        eventTitle: event.eventTitle,
        eventDate: event.date.toString(), // You may format this as needed.
        region: JSON.stringify(event.region),
        description: event.description,
        // Add any additional parameters as needed.
      },
    });
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
          vendorName: user.vendorName, // Include truck name
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
      {!hasLocationPermission ? (
        <PermissionScreen onRequestPermissions={checkPermissions} />
      ) : (
        // Main content that uses all your hooks:
        <>
          <TouchableOpacity
            style={styles.accountScreenButtonContainer}
            onPress={() =>
              router.push("/vendor/otherScreens/VendorAccountScreen")
            }
          >
            <FontAwesome name="gear" size={32} color="#FFF" />
          </TouchableOpacity>
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

              {todayEvents.map((event, index) => (
                <EventMarker
                  key={event.id || `event-${index}`}
                  event={event}
                  onPress={(event) => {
                    handleEventMarkerPress(event, index);
                  }}
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

          {activeCarousel === "vendor" && selectedVendor && (
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

          {activeCarousel === "event" && selectedEvent && (
            <View style={styles.carouselContainer}>
              <Carousel
                width={width * 0.9}
                height={250}
                data={todayEvents}
                renderItem={({ index }) => (
                  <EventMapInfoCard
                    event={todayEvents[index]}
                    userLocation={location}
                    onClose={() => setSelectedEvent(null)}
                    onPress={(event) => {
                      handleEventPress(event);
                    }}
                  />
                )}
                onSnapToItem={(index) => {
                  setEventCarouselIndex(index);
                  const newEvent = todayEvents[index];
                  setSelectedEvent(newEvent);
                  if (mapRef.current && newEvent.region) {
                    mapRef.current.animateToRegion(
                      {
                        latitude: newEvent.region.latitude,
                        longitude: newEvent.region.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      },
                      500 // Animation duration
                    );
                  }
                }}
                defaultIndex={eventCarouselIndex}
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
                    {vendorPaid ? (
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
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            "Please allow up to 24 hours for your account to be approved \n\n If you believe this is an error, please contact support"
                          );
                        }}
                        style={[
                          styles.toggleButton,
                          { backgroundColor: "grey" },
                        ]}
                      >
                        <Text style={styles.toggleButtonText}>
                          Your Account Status Is Pending
                        </Text>
                      </TouchableOpacity>
                    )}
                    <CouponManager />
                    {upcomingEvents.length > 0 && (
                      <EventListRow
                        section={{
                          title: "Events",
                          events: eventsWithDistance,
                        }}
                        onEventPress={(event) => handleEventPress(event)}
                      />
                    )}
                    <MyRow section={item} onCardPress={handleCardPress} />
                  </BottomSheetView>
                )}
                contentContainerStyle={{
                  paddingHorizontal: 0, // Remove extra padding here
                  paddingBottom: 16, // Optional for spacing at the bottom
                }}
              />
            </BottomSheetView>
          </BottomSheet>
        </>
      )}
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
  accountScreenButtonContainer: {
    position: "absolute",
    top: 60,
    right: 30,
    zIndex: 999,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: munchColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
