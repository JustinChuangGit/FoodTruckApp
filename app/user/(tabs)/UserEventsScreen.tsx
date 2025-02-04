import React, { useEffect } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { munchColors } from "@/constants/Colors";
import { useRouter } from "expo-router";

export default function UserEventsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [events, setEvents] = React.useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setEvents([]);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const shimmerAnimation = new Animated.Value(0);

  const startAnimation = () => {
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  React.useEffect(() => {
    if (isLoading) startAnimation();
  }, [isLoading]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 300],
  });

  const SkeletonEventItem = () => (
    <View style={styles.eventItem}>
      <Animated.View
        style={[styles.shimmerOverlay, { transform: [{ translateX }] }]}
      />
      <View style={styles.imagePlaceholder} />
      <View style={styles.detailsContainer}>
        <View style={[styles.textPlaceholder, { width: "60%" }]} />
        <View style={[styles.textPlaceholder, { width: "40%" }]} />
        <View style={[styles.textPlaceholder, { width: "30%" }]} />
        <View style={styles.buttonPlaceholder} />
      </View>
      <FontAwesome name="chevron-right" size={16} style={styles.rightChevron} />
    </View>
  );

  const HeaderRightButton = () => (
    <TouchableOpacity
      onPress={() => router.push("/sharedScreens/createNewEventScreen")}
    >
      <FontAwesome name="plus" size={24} color={munchColors.primary} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Events</Text>
          <FontAwesome name="plus" size={24} color="#e1e1e1" />
        </View>
        <FlatList
          data={[1, 2, 3]}
          renderItem={SkeletonEventItem}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Events</Text>
        <HeaderRightButton />
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome
            name="calendar-times-o"
            size={48}
            color={munchColors.primary}
          />
          <Text style={styles.emptyStateText}>No events found</Text>
          <Text style={styles.emptyStateSubText}>Check back later!</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={({ item }) => (
            // Your actual event list item component here
            <View />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
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
    height: 100,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#000",
  },
  listContent: {
    paddingHorizontal: 20,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#e1e1e1",
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  textPlaceholder: {
    height: 16,
    backgroundColor: "#e1e1e1",
    borderRadius: 4,
    marginVertical: 4,
  },
  buttonPlaceholder: {
    width: 80,
    height: 30,
    backgroundColor: "#e1e1e1",
    borderRadius: 15,
    marginTop: 12,
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "30%",
    backgroundColor: "rgba(255,255,255,0.6)",
    zIndex: 1,
  },
  rightChevron: {
    color: munchColors.primary,
    marginLeft: 10,
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
