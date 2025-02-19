// EventMapInfoCard.tsx
import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { format, differenceInCalendarDays } from "date-fns";
import haversine from "haversine";
import { Event } from "@/constants/types";
import { munchColors } from "@/constants/Colors";

interface EventMapInfoCardProps {
  event: Event;
  onClose: () => void;
  userLocation: { latitude: number; longitude: number } | null;
  onPress: (event: Event) => void;
}
const eventImageMap: { [key: string]: any } = {
  "Farmers Market": require("@/assets/images/FarmersMarketEvent.png"),
  "Food Truck Rally": require("@/assets/images/FoodTruckEvent.png"),
  "Small Business Vendors": require("@/assets/images/vendorEvent.png"),
};
const EventMapInfoCard: React.FC<EventMapInfoCardProps> = ({
  event,
  onClose,
  userLocation,
  onPress,
}) => {
  const [loading, setLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const eventImage =
    eventImageMap[event.eventTitle] ||
    require("@/assets/images/otherEvent.png");

  // Determine unit based on locale.
  const units = useMemo(() => {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.includes("US") ? "mile" : "km";
  }, []);

  // Calculate the distance from the user to the event.
  const distance = useMemo(() => {
    if (userLocation && event.region) {
      const start = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
      const end = {
        latitude: event.region.latitude,
        longitude: event.region.longitude,
      };
      const distanceValue = haversine(start, end, { unit: units });
      return distanceValue.toFixed(1);
    }
    return null;
  }, [userLocation, event, units]);

  // Compute a display date.
  const eventDate = new Date(event.date);
  const dayDiff = differenceInCalendarDays(eventDate, new Date());
  let displayDate = "";
  if (dayDiff === 0) {
    displayDate = "Today";
  } else if (dayDiff === 1) {
    displayDate = "Tomorrow";
  } else {
    displayDate = format(eventDate, "EEE, MMM d");
  }

  const locationParts = event.locationText ? event.locationText.split(",") : [];
  const displayLocation =
    locationParts.length >= 2
      ? locationParts.slice(0, 2).join(",").trim()
      : event.locationText || "";

  // Compute time display if available.
  const timeDisplay =
    event.startTime && event.endTime
      ? `${format(new Date(event.startTime), "h:mm a")} - ${format(
          new Date(event.endTime),
          "h:mm a"
        )}`
      : "";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <FontAwesome name="close" size={24} color="black" />
      </TouchableOpacity>

      {/* Main Card Content */}
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => onPress(event)}
      >
        <View style={styles.imageContainer}>
          {/* {loading && (
            <ActivityIndicator
              size="small"
              color="#007bff"
              style={styles.loadingIndicator}
            />
          )} */}
          <Image
            key={event.id}
            source={eventImage}
            style={styles.image}
            onLoadStart={() => setLoading(true)}
            onLoad={() => setLoading(false)}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{event.eventTitle}</Text>
          <Text style={styles.date}>{displayDate}</Text>
          {timeDisplay !== "" && <Text style={styles.time}>{timeDisplay}</Text>}
          {distance && (
            <Text style={styles.distance}>
              {distance} {units} away
            </Text>
          )}
          <Text style={styles.location} numberOfLines={1}>
            {displayLocation}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default EventMapInfoCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    position: "absolute",
    bottom: 125,
    left: 10,
    right: 10,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: "row",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  imageContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingIndicator: {
    position: "absolute",
    zIndex: 1,
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#555",
  },
  time: {
    fontSize: 14,
    color: "#777",
  },
  distance: {
    fontSize: 14,
    color: "#555",
  },
  location: {
    fontSize: 14,
    color: munchColors.primary,
    marginTop: 4,
  },
});
