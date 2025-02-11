import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import EventCard from "./EventCard";
import { Event } from "@/constants/types";

interface EventSection {
  title: string;
  events: Event[];
}

interface EventListRowProps {
  section: EventSection;
  onEventPress: (event: Event) => void;
}

const EventListRow: React.FC<EventListRowProps> = ({
  section,
  onEventPress,
}) => (
  <View style={styles.mainSection}>
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
    <FlatList
      data={section.events}
      keyExtractor={(event) => event.id || Math.random().toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <EventCard event={item} onPress={() => onEventPress(item)} />
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events available.</Text>
        </View>
      }
    />
  </View>
);

const styles = StyleSheet.create({
  mainSection: { marginVertical: 16 },
  sectionTitleContainer: {
    paddingLeft: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 250,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "gray",
    textAlign: "center",
    paddingHorizontal: 30,
  },
});

export default EventListRow;
