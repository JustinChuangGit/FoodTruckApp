import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Dimensions,
  Modal,
  Linking,
  Platform,
  Alert,
  Image,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { munchColors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { fetchEvents } from "@/services/firestore";
import { Event } from "@/constants/types";
import { format } from "date-fns";
import MapView, { Marker } from "react-native-maps";
import { selectUser } from "@/redux/authSlice";
import { useSelector } from "react-redux";
import * as Location from "expo-location"; // Import expo-location
import { munchStyles } from "@/constants/styles";

const height = Dimensions.get("window").height;

const useUnits = (): "miles" | "km" => {
  return useMemo(() => {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.includes("US") ? "miles" : "km";
  }, []);
};
const formatAddress = (address: string): string => {
  if (!address) return "";

  // Regex to match a common address pattern: "123 Main St, City, State ZIP, Country"
  const addressParts = address.split(",");

  if (addressParts.length >= 2) {
    return `${addressParts[0]}, ${addressParts[1]}`.trim(); // Keep only Street and City
  }

  return address; // Return as-is if format isn't recognized
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  units: "miles" | "km" // ✅ Pass units as argument
): string => {
  const R: number = 6371; // Earth's radius in kilometers

  const toRad = (value: number): number => (value * Math.PI) / 180;

  const dLat: number = toRad(lat2 - lat1);
  const dLon: number = toRad(lon2 - lon1);

  const a: number =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm: number = R * c; // Distance in kilometers

  // ✅ Use units argument instead of calling useUnits inside a regular function
  const distance = units === "miles" ? distanceKm * 0.621371 : distanceKm;

  return `${distance.toFixed(2)} ${units}`;
};
export default function UserEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const user = useSelector(selectUser);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // Store user's location
  const units = useUnits();
  const [distance, setDistance] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const openMaps = () => {
    if (!selectedEvent) {
      Alert.alert("Error", "Please Try Again");
      return;
    }
    const { latitude, longitude } = selectedEvent.region;
    const label = encodeURIComponent(selectedEvent.eventTitle);

    let url = "";

    if (Platform.OS === "ios") {
      // Open in Apple Maps
      url = `maps://?q=${label}&ll=${latitude},${longitude}`;
    } else {
      // Open in Google Maps
      url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }

    Linking.openURL(url).catch((err) =>
      console.error("Failed to open maps", err)
    );
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await fetchEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Function to handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, []);

  const handleEventPress = (event: Event) => {
    // Push to the event details page with parameters.
    router.push({
      pathname: "/sharedScreens/eventDetailsScreen",
      params: {
        eventId: event.id,
        eventTitle: event.eventTitle,
        eventDate: event.date.toString(),
        region: JSON.stringify(event.region),
        description: event.description,
        locationText: event.locationText, // added parameter
        startTime: event.startTime ? event.startTime.toISOString() : null, // added parameter
        endTime: event.endTime ? event.endTime.toISOString() : null, // added parameter
        image: event.image, // added parameter
        distance: calculateDistance(
          userLocation?.latitude || 0,
          userLocation?.longitude || 0,
          event.region.latitude,
          event.region.longitude,
          units
        ),
      },
    });
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
    setModalVisible(false);
  };

  const categorizeEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of the day
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayEvents: Event[] = [];
    const tomorrowEvents: Event[] = [];
    const upcomingEvents: Event[] = [];

    events
      .filter((event) => new Date(event.date).getTime() >= today.getTime()) // ❌ Exclude past events
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort from closest to furthest
      .forEach((event) => {
        const eventDate = new Date(event.date);
        if (eventDate.toDateString() === today.toDateString()) {
          todayEvents.push(event);
        } else if (eventDate.toDateString() === tomorrow.toDateString()) {
          tomorrowEvents.push(event);
        } else {
          upcomingEvents.push(event);
        }
      });

    return { todayEvents, tomorrowEvents, upcomingEvents };
  };

  const { todayEvents, tomorrowEvents, upcomingEvents } = categorizeEvents();

  const renderEventItem = ({ item }: { item: Event }) => {
    // Map event titles to local images.
    const eventImageMap: { [key: string]: any } = {
      "Farmers Market": require("@/assets/images/FarmersMarketEvent.png"),
      "Food Truck Rally": require("@/assets/images/FoodTruckEvent.png"),
      "Small Business Vendors": require("@/assets/images/vendorEvent.png"),
    };

    const eventImage =
      eventImageMap[item.eventTitle] ||
      require("@/assets/images/otherEvent.png");

    return (
      <TouchableOpacity
        style={styles.eventItem}
        onPress={() => handleEventPress(item)}
      >
        <Image source={eventImage} style={styles.eventImage} />
        <View style={styles.detailsContainer}>
          <Text style={styles.eventTitle}>{item.eventTitle}</Text>
          <Text style={styles.eventDate}>
            {format(new Date(item.date), "EEEE, MMM d, yyyy")}
          </Text>
          {item.startTime && item.endTime && (
            <Text style={styles.eventTime}>
              {format(new Date(item.startTime), "h:mm a")} -{" "}
              {format(new Date(item.endTime), "h:mm a")}
            </Text>
          )}
          {item.startTime && !item.endTime && (
            <Text style={styles.eventTime}>
              Start Time: {format(new Date(item.startTime), "h:mm a")}
            </Text>
          )}
          {item.endTime && !item.startTime && (
            <Text style={styles.eventTime}>
              End Time: {format(new Date(item.endTime), "h:mm a")}
            </Text>
          )}
          {userLocation && (
            <Text style={styles.eventDistance}>
              {calculateDistance(
                userLocation?.latitude,
                userLocation?.longitude,
                item.region.latitude,
                item.region.longitude,
                units
              )}
            </Text>
          )}
          <Text style={styles.eventLocation}>
            {formatAddress(item.locationText ?? "")}
          </Text>
        </View>
        <FontAwesome
          name="chevron-right"
          size={16}
          style={styles.rightChevron}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Events</Text>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/sharedScreens/createNewEventScreen")}
        style={styles.addEventButton}
      >
        <Text style={styles.addEventButtonText}>Add Event</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.loadingText}>Loading events...</Text>
      ) : events.length === 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={[styles.emptyState, { height: height - 250 }]}>
            <FontAwesome
              name="calendar-times-o"
              size={48}
              color={munchColors.primary}
            />
            <Text style={styles.emptyStateText}>No events found</Text>
            <Text style={styles.emptyStateSubText}>Check back later!</Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={[
            { title: "Today", data: todayEvents },
            { title: "Tomorrow", data: tomorrowEvents },
            { title: "Upcoming", data: upcomingEvents },
          ].filter((section) => section.data.length > 0)}
          renderItem={({ item }) => (
            <View>
              <Text style={styles.sectionHeader}>{item.title}</Text>
              <FlatList
                data={item.data}
                renderItem={renderEventItem}
                keyExtractor={(event) => event.id ?? Math.random().toString()}
              />
            </View>
          )}
          keyExtractor={(item) => item.title}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 80,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: munchColors.primary,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  eventDate: {
    fontSize: 14,
    color: "#666",
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
  },
  eventLocation: {
    fontSize: 14,
    fontWeight: "600",
    color: munchColors.primary,
    marginTop: 4,
  },
  rightChevron: {
    color: munchColors.primary,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#888",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 24,
    fontWeight: "600",
    color: munchColors.primary,
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: munchStyles.smallRadius,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 30,
    zIndex: 10,
    width: 45,
    height: 45,
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: munchColors.primary,
  },
  modalDate: {
    fontSize: 16,
    color: "#555",
  },
  modalTime: {
    fontSize: 16,
    color: "#777",
  },
  modalLocation: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    color: munchColors.primary,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    marginTop: 10,
  },
  eventDistance: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  modalTextContainer: {
    width: "100%",
  },
  getDirectionsButton: {
    width: 250,
    height: 40,
    backgroundColor: munchColors.primary,
    justifyContent: "center",
    marginHorizontal: "auto",
    marginTop: 20,
    borderRadius: munchStyles.smallRadius,
  },
  getDirectionsButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  userMarker: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: munchColors.primary,
    borderRadius: 20,
    padding: 6,
  },
  eventImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 10,
  },
  addEventButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center", // This centers the button horizontally
    backgroundColor: munchColors.primary,
    width: 300,
    height: 50,
    borderRadius: munchStyles.smallRadius,
    zIndex: 10,
  },

  addEventButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 50,
  },
});
