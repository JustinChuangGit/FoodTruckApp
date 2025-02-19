import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/services/firestore";
import { Event } from "@/constants/types";
import { FontAwesome } from "@expo/vector-icons";

export default function EventApprovalScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "EventsPendingApproval")
        );
        const eventList = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Event)
        );
        setEvents(eventList);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const approveEvent = async (event: Event) => {
    try {
      await setDoc(doc(db, "events", event.id!), event);
      await deleteDoc(doc(db, "EventsPendingApproval", event.id!));
      setEvents(events.filter((e) => e.id !== event.id));
      console.log("Event approved and moved to events collection");
    } catch (error) {
      console.error("Error approving event:", error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "EventsPendingApproval", eventId));
      setEvents(events.filter((e) => e.id !== eventId));
      console.log("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const renderItem = ({ item }: { item: Event }) => (
    <View style={styles.card}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}
      <Text style={styles.title}>{item.eventTitle}</Text>
      <Text style={styles.details}>
        📅 {new Date(item.date).toDateString()}
      </Text>
      <Text style={styles.details}>
        🕒{" "}
        {item.startTime
          ? new Date(item.startTime).toLocaleTimeString()
          : "No start time"}{" "}
        -{" "}
        {item.endTime
          ? new Date(item.endTime).toLocaleTimeString()
          : "No end time"}
      </Text>
      <Text style={styles.details}>
        📍 {item.locationText || "No location specified"}
      </Text>
      <Text style={styles.details}>
        {item.description || "No description available"}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => approveEvent(item)}
        >
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteEvent(item.id!)}
        >
          <FontAwesome name="trash" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Approve Events</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading events...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Approve Events</Text>
      </View>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id!}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No events pending approval.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  details: {
    fontSize: 14,
    marginVertical: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  approveButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
  header: {
    marginTop: 70,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
  },
});
