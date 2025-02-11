import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Event } from "@/constants/types";
import { FontAwesome } from "@expo/vector-icons";
import { munchStyles } from "@/constants/styles";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const [loading, setLoading] = useState(false);

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
          source={{ uri: "https://via.placeholder.com/218x130.png?text=Event" }}
          style={styles.eventImage}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
        />
      </View>
      <View style={styles.eventInfoContainer}>
        <Text style={styles.eventName}>{event.eventTitle}</Text>
        <Text style={styles.eventDate}>
          {format(new Date(event.date), "EEE, MMM d")}
        </Text>
        {event.startTime && event.endTime && (
          <Text style={styles.eventTime}>
            {format(new Date(event.startTime), "h:mm a")} -{" "}
            {format(new Date(event.endTime), "h:mm a")}
          </Text>
        )}
        <Text style={styles.eventLocation}>{event.locationText}</Text>
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
