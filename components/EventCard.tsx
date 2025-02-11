import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Event } from "@/constants/types";
import { munchStyles } from "@/constants/styles";
import { format, differenceInCalendarDays } from "date-fns";

interface EventCardProps {
  event: Event & { distance?: number }; // Precomputed distance in meters
  onPress: () => void;
  // Optionally, you could still pass userLocation if needed.
  userLocation?: { latitude: number; longitude: number };
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const [loading, setLoading] = useState(false);

  // Calculate the display date.
  const eventDate = new Date(event.date);
  const dayDiff = differenceInCalendarDays(eventDate, new Date());
  let displayDate: string;
  if (dayDiff === 0) {
    displayDate = "Today";
  } else if (dayDiff === 1) {
    displayDate = "Tomorrow";
  } else {
    displayDate = format(eventDate, "EEE, MMM d");
  }

  // Process the location string: Only keep the first two comma-separated parts.
  const locationParts = event.locationText ? event.locationText.split(",") : [];
  const displayLocation =
    locationParts.length >= 2
      ? locationParts.slice(0, 2).join(",").trim()
      : event.locationText || "";

  // Determine units based on locale.
  const units = useMemo(() => {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.includes("US") ? "miles" : "km";
  }, []);

  // Compute the distance display string using the precomputed distance.
  const distanceDisplay = useMemo(() => {
    if (typeof event.distance === "number") {
      if (units === "miles") {
        const distanceInMiles = event.distance / 1609.34;
        return `${distanceInMiles.toFixed(1)} mi`;
      } else {
        const distanceInKm = event.distance / 1000;
        return `${distanceInKm.toFixed(1)} km`;
      }
    }
    return "";
  }, [event.distance, units]);

  return (
    <TouchableOpacity style={styles.cardItem} onPress={onPress}>
      <View style={styles.imageContainer}>
        {loading && (
          <ActivityIndicator
            size="small"
            color="#007bff"
            style={styles.loadingIndicator}
          />
        )}
        <Image
          source={{
            uri: "https://via.placeholder.com/218x130.png?text=Event",
          }}
          style={styles.eventImage}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
        />
      </View>
      <View style={styles.eventInfoContainer}>
        <Text style={styles.eventName}>{event.eventTitle}</Text>
        <Text style={styles.eventDate}>{displayDate}</Text>
        {distanceDisplay !== "" && (
          <Text style={styles.eventDistance}>{distanceDisplay}</Text>
        )}
        {event.startTime && event.endTime && (
          <Text style={styles.eventTime}>
            {format(new Date(event.startTime), "h:mm a")} -{" "}
            {format(new Date(event.endTime), "h:mm a")}
          </Text>
        )}
        <Text style={styles.eventLocation}>{displayLocation}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardItem: {
    borderRadius: munchStyles.smallRadius,
    width: 250,
    marginLeft: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 10,
    height: 250,
  },
  imageContainer: {
    width: "100%",
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: munchStyles.smallRadius,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  loadingIndicator: {
    position: "absolute",
    zIndex: 1,
  },
  eventInfoContainer: {
    marginTop: 8,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  eventDate: {
    fontSize: 14,
    color: "#555",
  },
  eventDistance: {
    fontSize: 14,
    color: "#555",
  },
  eventTime: {
    fontSize: 14,
    color: "#777",
  },
  eventLocation: {
    fontSize: 14,
    color: "#007bff",
    marginTop: 4,
  },
});

export default EventCard;
