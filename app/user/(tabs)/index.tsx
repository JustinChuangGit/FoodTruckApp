import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Alert,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
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
import { db, logClickThrough, logImpression } from "@/services/firestore";
import { Section } from "@/constants/types";
import { router } from "expo-router";
import CouponRow from "@/components/couponRow";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/authSlice"; // Update the path as needed
import { FontAwesome } from "@expo/vector-icons";
import { getSortedEvents } from "@/services/firestore";
import { Event } from "@/constants/types";
import EventListRow from "@/components/EventListRow";
import EventMarker from "@/components/EventMarker";
import EventMapInfoCard from "@/components/EventMapInfoCard";

interface MyRowSection {
  id: string;
  title: string;
  vendors: Vendor[];
}

interface EventRowSection {
  title: string;
  events: Event[];
}

interface MyRowData {
  type: "myRow";
  section: MyRowSection;
  key: string;
}

interface CouponRowData {
  type: "couponRow";
  section: MyRowSection;
  key: string;
}

interface EventRowData {
  type: "eventRow";
  section: EventRowSection;
  key: string;
}

type CombinedData = MyRowData | CouponRowData | EventRowData;

const { width } = Dimensions.get("window");

function getNearbyCoupons(
  vendors: Vendor[],
  location: LocationCoordinates | null
): {
  id: string;
  title: string;
  coupons: { vendor: Vendor; coupon: any; distance: number }[];
} {
  if (!location) {
    return {
      id: "nearbyCoupons",
      title: "Nearby Coupons",
      coupons: [],
    };
  }

  // Collect all coupons from vendors
  const couponsWithVendor = vendors.flatMap((vendor) =>
    (vendor.coupons || []).map((coupon) => ({
      vendor,
      coupon,
      distance: haversine(location, {
        latitude: vendor.latitude,
        longitude: vendor.longitude,
      }),
    }))
  );

  // Sort by distance
  const sortedCoupons = couponsWithVendor.sort(
    (a, b) => a.distance - b.distance
  );

  return {
    id: "nearbyCoupons",
    title: "Nearby Coupons",
    coupons: sortedCoupons,
  };
}

function groupVendorsByType(vendors: Vendor[]): Section[] {
  // Explicitly type the groupedVendors object
  const groupedVendors: Record<string, Vendor[]> = vendors.reduce(
    (groups, vendor) => {
      const type = vendor.vendorType || "Other"; // Default to "Other" if vendorType is missing
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(vendor);
      return groups;
    },
    {} as Record<string, Vendor[]> // Initial value with explicit type
  );

  // Convert the grouped vendors into sections
  const sections: Section[] = Object.keys(groupedVendors).map(
    (type, index) => ({
      id: `section-${index}`,
      title: type, // Use the vendorType as the section title
      vendors: groupedVendors[type],
    })
  );

  return sections;
}

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
  const SECTIONDATA = formatSections(groupVendorsByType(vendors));
  const snapPoints = useMemo(() => ["15%", "50%", "95%"], []);
  const scaleAnim = useRef(new Animated.Value(0)).current; // Initial scale value
  const nearbyVendors = getNearbyVendors(vendors, location);
  const user = useSelector(selectUser);
  const [sortedEvents, setSortedEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventCarouselIndex, setEventCarouselIndex] = useState(0);
  const [activeCarousel, setActiveCarousel] = useState<
    "vendor" | "event" | null
  >(null);

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

  // Filter events that occur today or later.
  const upcomingEvents = sortedEvents.filter(
    (event) => new Date(event.date).getTime() >= new Date().setHours(0, 0, 0, 0)
  );

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

  const combinedData: CombinedData[] = [
    {
      type: "eventRow" as const,
      section: { title: "Events", events: eventsWithDistance },
      key: "eventRow",
    },
    { type: "myRow" as const, section: nearbyVendors, key: "myRow1" },
    { type: "couponRow" as const, section: nearbyVendors, key: "couponRow" },
    ...SECTIONDATA.map((item, index) => ({
      type: "myRow" as const,
      section: item,
      key: `myRow${index + 2}`,
    })),
  ];

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
            vendorName: data.vendorName || "Unknown Vendor",
            rating: data.rating || 0, // Default rating if not provided
            description: data.description || "No description available",
            image: data.image || "https://via.placeholder.com/150", // Default image
            menu: data.menu || [], // Include menu field, default to an empty array
            vendorType: data.vendorType || "Other", // Default vendor type
            truckImage: data.truckImage || "https://via.placeholder.com/150", // Default truck image
            coupons: data.coupons || [], // Default coupons to an empty array
            name: data.name || "Unknown", // Default name if not provided
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
    if (carouselIndex >= vendors.length) {
      setCarouselIndex(vendors.length - 1); // Adjust to the last valid index
    }
  }, [vendors, carouselIndex]);

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
    logImpression(
      vendor?.uid ?? "unknown_vendor",
      user?.uid ?? "unknown_user",
      user?.latitude ?? 0,
      user?.longitude ?? 0,
      "carousel"
    );
  };

  // Inside your marker press handler for events:
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

  const handleCardClose = () => {
    setSelectedVendor(null);
    setCarouselIndex(0);
  };

  const handleCardPress = (vendor: Vendor) => {
    console.log("Card pressed");
    handlePress(vendor, "card");
  };

  const handleCouponPress = (vendor: Vendor) => {
    console.log("Coupon pressed");
    handlePress(vendor, "coupon");
  };

  const handleEventPress = (event: Event) => {
    setActiveCarousel("event");
    setSelectedEvent(event);
    setSelectedVendor(null);
    const index = eventsWithDistance.findIndex(
      (event) => event.id === event.id
    );
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

  const handlePress = (vendor: Vendor, pressType: string) => {
    setSelectedEvent(null);
    setSelectedVendor(vendor);
    const index = vendors.findIndex((v) => v.uid === vendor.uid);
    setCarouselIndex(index);
    logClickThrough(
      vendor?.uid ?? "unknown_vendor", // Default value for undefined vendor ID
      user?.uid ?? "unknown_user", // Default value for undefined user ID
      user?.latitude ?? 0, // Default latitude
      user?.longitude ?? 0, // Default longitude
      pressType ?? "unknown_press_type" // Default value for undefined press type
    );

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
        truckImage: encodeURIComponent(vendor.truckImage), // Encode the truck
        vendorName: vendor.vendorName, // Add vendorName to params
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.accountScreenButtonContainer}
        onPress={() => router.push("/user/otherScreens/UserAccountScreen")}
      >
        <FontAwesome name="gear" size={32} color="white" />
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

          {eventsWithDistance.map((event, index) => (
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
            defaultIndex={Math.min(carouselIndex, vendors.length - 1)} // Ensure index is within bounds
          />
        </View>
      )}

      {activeCarousel === "event" && selectedEvent && (
        <View style={styles.carouselContainer}>
          <Carousel
            width={width * 0.9}
            height={250}
            data={eventsWithDistance}
            renderItem={({ index }) => (
              <EventMapInfoCard
                event={eventsWithDistance[index]}
                userLocation={location}
                onClose={() => setSelectedEvent(null)}
                onPress={(event) => {
                  handleEventPress(event);
                }}
              />
            )}
            onSnapToItem={(index) => {
              setEventCarouselIndex(index);
              const newEvent = eventsWithDistance[index];
              setSelectedEvent(newEvent);
              if (mapRef.current && newEvent.region) {
                mapRef.current.animateToRegion(
                  {
                    latitude: newEvent.region.latitude,
                    longitude: newEvent.region.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  },
                  500 // duration in ms
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
          <View style={styles.dragSectionHeaderContainer}>
            <Text style={styles.dragSectionHeader}>For You</Text>
            <Text style={styles.dragSectionSubheader}>
              Checkout some spots we think you'd like
            </Text>
            <HorizontalLine />
          </View>

          <BottomSheetFlatList
            data={combinedData}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => {
              if (item.type === "eventRow") {
                return (
                  <EventListRow
                    section={item.section}
                    onEventPress={(event) => handleEventPress(event)}
                  />
                );
              }
              if (item.type === "myRow") {
                return (
                  <MyRow section={item.section} onCardPress={handleCardPress} />
                );
              }
              if (item.type === "couponRow") {
                return (
                  <CouponRow
                    section={item.section}
                    onCardPress={handleCouponPress}
                  />
                );
              }
              return null;
            }}
            contentContainerStyle={{
              paddingHorizontal: 0,
              paddingBottom: 16,
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
  accountScreenButtonContainer: {
    position: "absolute",
    top: 60,
    right: 30,
    zIndex: 999,
  },
});
