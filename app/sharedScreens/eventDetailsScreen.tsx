// eventDetailsScreen.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function EventDetailsScreen() {
  const params = useLocalSearchParams<{
    eventId?: string;
    eventTitle?: string;
    eventDate?: string;
    region?: string;
    description?: string;
  }>();

  const { eventId, eventTitle, eventDate, region, description } = params;

  let parsedRegion: { latitude: number; longitude: number } | null = null;
  try {
    parsedRegion = region ? JSON.parse(region) : null;
  } catch (error) {
    console.error("Error parsing region:", error);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{eventTitle || "Event Details"}</Text>
      {eventId && <Text style={styles.info}>Event ID: {eventId}</Text>}
      {eventDate && <Text style={styles.info}>Date: {eventDate}</Text>}
      {parsedRegion && (
        <Text style={styles.info}>
          Location: {parsedRegion.latitude.toFixed(4)},{" "}
          {parsedRegion.longitude.toFixed(4)}
        </Text>
      )}
      <Text style={styles.description}>
        {description || "No description provided."}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginTop: 10,
  },
});
