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

  const openEventModal = (event: Event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
    setModalVisible(false);
  };

  const categorizeEvents = () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayEvents: Event[] = [];
    const tomorrowEvents: Event[] = [];
    const upcomingEvents: Event[] = [];

    events
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

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => openEventModal(item)}
    >
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
        <Text style={styles.eventLocation}>{item.locationText}</Text>
      </View>
      <FontAwesome name="chevron-right" size={16} style={styles.rightChevron} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Events</Text>
        <TouchableOpacity
          onPress={() => router.push("/sharedScreens/createNewEventScreen")}
        >
          <FontAwesome name="plus" size={24} color={munchColors.primary} />
        </TouchableOpacity>
      </View>

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
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        {selectedEvent && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeEventModal}
              >
                <FontAwesome name="times" size={24} color="#fff" />
              </TouchableOpacity>

              {/* Map */}
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: selectedEvent.region.latitude,
                  longitude: selectedEvent.region.longitude,
                  latitudeDelta: selectedEvent.region.latitudeDelta,
                  longitudeDelta: selectedEvent.region.longitudeDelta,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: selectedEvent.region.latitude,
                    longitude: selectedEvent.region.longitude,
                  }}
                  title={selectedEvent.eventTitle}
                  description={selectedEvent.locationText}
                >
                  {/* Custom Styled Marker */}
                  <View style={styles.customMarker}>
                    <FontAwesome
                      name="map-marker"
                      size={30}
                      color={munchColors.primary}
                    />
                  </View>
                </Marker>
              </MapView>

              <View style={styles.modalTextContainer}>
                {/* Event Details */}
                <Text style={styles.modalTitle}>
                  {selectedEvent.eventTitle}
                </Text>
                <Text style={styles.modalDate}>
                  {format(new Date(selectedEvent.date), "EEEE, MMM d, yyyy")}
                </Text>
                {selectedEvent.startTime && selectedEvent.endTime && (
                  <Text style={styles.modalTime}>
                    {format(new Date(selectedEvent.startTime), "h:mm a")} -{" "}
                    {format(new Date(selectedEvent.endTime), "h:mm a")}
                  </Text>
                )}
                {userLocation && (
                  <Text style={styles.eventDistance}>
                    {calculateDistance(
                      userLocation?.latitude,
                      userLocation?.longitude,
                      selectedEvent.region.latitude,
                      selectedEvent.region.longitude,
                      units
                    )}
                  </Text>
                )}
                <Text style={styles.modalDescription}>
                  {selectedEvent.description}
                </Text>
                <Text style={styles.modalLocation}>
                  {selectedEvent.locationText}
                </Text>
                <TouchableOpacity
                  style={styles.getDirectionsButton}
                  onPress={
                    () => openMaps() // Open maps when button is pressed
                  }
                >
                  <Text style={styles.getDirectionsButtonText}>
                    Get Directions
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
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
  modalTextContainer: {},
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
});
