import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from "react-native";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/services/firestore";
import { Event, User } from "@/constants/types";
import { FontAwesome } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { router } from "expo-router";
import HorizontalLine from "@/components/default/HorizontalLine";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function EventApprovalScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [vendors, setVendors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVendors, setTotalVendors] = useState(0);

  const fetchUserCounts = async () => {
    try {
      const userSnapshot = await getDocs(collection(db, "users"));
      const allUsers = userSnapshot.docs.map((doc) => doc.data());

      // Count vendors and regular users
      const userCount = allUsers.length;

      setTotalUsers(userCount);
    } catch (error) {
      console.error("Error fetching user counts:", error);
    }
  };

  /** 🔄 Fetch Events & Vendors */
  const fetchData = async () => {
    setLoading(true);
    try {
      const eventSnapshot = await getDocs(
        collection(db, "EventsPendingApproval")
      );
      const vendorSnapshot = await getDocs(collection(db, "vendors"));

      let eventList: Event[] = eventSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];

      let vendorList: User[] = vendorSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
        accountCreated: doc.data().accountCreated || "Unknown", // ✅ Use string directly
      })) as User[];

      setTotalVendors(vendorList.length);

      // ✅ Sort from newest to oldest using Date objects
      eventList = eventList.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      vendorList = vendorList.sort(
        (a, b) =>
          new Date(b.accountCreated || "").getTime() -
          new Date(a.accountCreated || "").getTime()
      );

      console.log("Fetched events:", eventList);
      console.log("Fetched vendors:", vendorList);

      setEvents(eventList);
      setVendors(vendorList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUserCounts();
  }, []);

  /** 🔄 Handle Pull-to-Refresh */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);
  const formatDate = (dateValue: string | Date | undefined) => {
    if (!dateValue) return "Unknown";

    // If it's already a string, return it
    if (typeof dateValue === "string") return dateValue;

    // If it's a Date object, format it correctly
    return dateValue.toLocaleString();
  };

  /** ✅ Approve Event */
  const approveEvent = async (event: Event) => {
    try {
      await setDoc(doc(db, "events", event.id!), event);
      await deleteDoc(doc(db, "EventsPendingApproval", event.id!));
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      console.log("Event approved and moved to events collection");
    } catch (error) {
      console.error("Error approving event:", error);
    }
  };

  /** ❌ Delete Event */
  const deleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "EventsPendingApproval", eventId));
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      console.log("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  /** 💰 Toggle Vendor Paid Status */
  const toggleVendorPaid = async (vendor: User) => {
    try {
      const vendorRef = doc(db, "vendors", vendor.uid);
      await updateDoc(vendorRef, { vendorPaid: !vendor.vendorPaid });

      setVendors((prev) =>
        prev.map((v) =>
          v.uid === vendor.uid ? { ...v, vendorPaid: !vendor.vendorPaid } : v
        )
      );
      console.log("Vendor payment status updated.");
    } catch (error) {
      console.error("Error updating vendor paid status:", error);
    }
  };

  /** 🎭 Render Event Item */
  const renderEventItem = ({ item }: { item: Event }) => (
    <View style={styles.card}>
      {item.image && <Image source={{ uri: item.image }} />}
      <Text style={styles.title}>{item.eventTitle}</Text>
      <Text style={styles.details}>
        📅 {new Date(item.date).toDateString()}
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

  /** 🏪 Render Vendor Item */
  const renderVendorItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.vendorRow}>
        {/* Vendor Logo */}
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.logo} />
        ) : (
          <View style={styles.placeholderLogo}>
            <Text style={styles.placeholderText}>No Logo</Text>
          </View>
        )}

        {/* Vendor Details */}
        <View style={styles.vendorDetails}>
          <Text style={styles.title}>
            {item.vendorName || "Unnamed Vendor"}
          </Text>
          <Text style={styles.details}>👤 {item.name}</Text>
          <Text style={styles.details}>🆔 {item.uid}</Text>
          <Text style={styles.details}>
            📅 Account Created: {formatDate(item.accountCreated)}
          </Text>
        </View>
      </View>

      {/* Toggle Vendor Paid Status */}
      <TouchableOpacity
        style={[
          styles.statusButton,
          item.vendorPaid ? styles.paidButton : styles.unpaidButton,
        ]}
        onPress={() => toggleVendorPaid(item)}
      >
        <Text style={styles.buttonText}>
          {item.vendorPaid ? "Paid ✅" : "Not Paid ❌"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 100,
          marginLeft: 10,
        }}
        onPress={() => router.back()}
      >
        <FontAwesome
          name="chevron-circle-left"
          size={30}
          color="black"
          style={{ paddingRight: 20 }}
        />
        <Text style={styles.headerText}>Approve Events and Vendors</Text>
      </TouchableOpacity>
      <HorizontalLine />
      <View>
        <Text style={styles.headerText}>Analytics</Text>

        {/* Display User and Vendor Counts */}
        <View style={styles.analyticsContainer}>
          <Text style={styles.analyticsText}>Total Users: {totalUsers}</Text>
          <Text style={styles.analyticsText}>
            Total Vendors: {totalVendors}
          </Text>
        </View>
      </View>

      <Carousel
        width={SCREEN_WIDTH}
        height={Dimensions.get("window").height - 100}
        loop={false}
        data={[
          {
            key: "events",
            title: "Approve Events",
            content: events,
            renderItem: renderEventItem,
          },
          {
            key: "vendors",
            title: "Approve Vendors",
            content: vendors,
            renderItem: renderVendorItem,
          },
        ]}
        renderItem={({ item }) => (
          <View style={styles.page}>
            <Text style={styles.headerText}>{item.title}</Text>
            <FlatList
              data={
                item.content as typeof item.key extends "events"
                  ? Event[]
                  : User[]
              }
              keyExtractor={(i) => (item.key === "events" ? i.uid! : i.uid)}
              renderItem={item.renderItem as any}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>No items available.</Text>
              }
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  vendorRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  vendorDetails: { marginLeft: 10, flex: 1 },
  logo: { width: 60, height: 60, borderRadius: 30 },
  placeholderLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { color: "white", fontWeight: "bold" },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  buttonText: { color: "white", fontWeight: "bold" },

  page: { flex: 1, padding: 16, backgroundColor: "#fff" },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    marginVertical: 10,
  },

  approveButton: { backgroundColor: "green", padding: 10, borderRadius: 5 },
  deleteButton: { backgroundColor: "red", padding: 10, borderRadius: 5 },
  statusText: { color: "white", fontWeight: "bold" },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  details: {
    fontSize: 14,
    marginVertical: 2,
  },
  statusButton: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  paidButton: { backgroundColor: "green" },
  unpaidButton: { backgroundColor: "red" },
  analyticsContainer: {
    marginTop: 10,
    padding: 16,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
  },
  analyticsText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
