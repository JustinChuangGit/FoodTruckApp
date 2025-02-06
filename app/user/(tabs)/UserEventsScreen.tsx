import React, { useEffect, useState, useCallback } from "react";
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
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { munchColors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { fetchEvents } from "@/services/firestore";
import { Event } from "@/constants/types";
import { format } from "date-fns";

const height = Dimensions.get("window").height;

export default function UserEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh

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
      onPress={() => router.push(`/event/${item.id}`)}
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
});
