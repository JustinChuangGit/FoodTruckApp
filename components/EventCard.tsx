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
import { munchColors } from "@/constants/Colors";

interface EventCardProps {
  event: Event & { distance?: number }; // Precomputed distance in meters
  onPress: () => void;
  // Optionally, you could still pass userLocation if needed.
  userLocation?: { latitude: number; longitude: number };
}

const eventImageMap: { [key: string]: any } = {
  "Farmers Market": require("@/assets/images/FarmersMarketEvent.png"),
  "Food Truck Rally": require("@/assets/images/FoodTruckEvent.png"),
  "Small Business Vendors": require("@/assets/images/vendorEvent.png"),
};

const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const [loading, setLoading] = useState(false);
  const eventImage =
    eventImageMap[event.eventType] || require("@/assets/images/otherEvent.png");
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
        <Image
          source={eventImage}
          style={styles.eventImage}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
        />
      </View>
      <View style={styles.eventInfoContainer}>
        <Text style={styles.eventName}>{event.eventTitle}</Text>
        <Text style={styles.eventDate}>{displayDate}</Text>
        {distanceDisplay !== "" && (
          <Text style={styles.eventDistance}>{distanceDisplay} Away</Text>
        )}
        {/* {event.startTime && event.endTime && (
          <Text style={styles.eventTime}>
            {format(new Date(event.startTime), "h:mm a")} -{" "}
            {format(new Date(event.endTime), "h:mm a")}
          </Text>
        )} */}
        <Text style={styles.eventLocation}>{displayLocation}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardItem: {
    borderRadius: munchStyles.smallRadius,
    backgroundColor: "#fff",
    height: 150,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
  },
  imageContainer: {
    width: 130,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: munchStyles.smallRadius,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
    resizeMode: "cover",
    marginRight: 8,
  },
  eventImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFF",
  },
  loadingIndicator: {
    position: "absolute",
    zIndex: 1,
  },
  eventInfoContainer: {
    marginTop: 8,
    alignContent: "center",
    justifyContent: "center",
    width: 150,
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
    color: munchColors.primary,
    marginTop: 4,
  },
});

export default EventCard;
