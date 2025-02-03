import React from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Text,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function UserEventsScreen() {
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
    startAnimation();
  }, []);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 300],
  });

  const SkeletonEventItem = () => (
    <View style={styles.eventItem}>
      {/* Shimmer Overlay */}
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            transform: [{ translateX }],
          },
        ]}
      />

      {/* Image Placeholder */}
      <View style={styles.imagePlaceholder} />

      {/* Event Details Placeholder */}
      <View style={styles.detailsContainer}>
        <View style={[styles.textPlaceholder, { width: "60%", height: 20 }]} />
        <View
          style={[
            styles.textPlaceholder,
            { width: "40%", height: 16, marginTop: 8 },
          ]}
        />
        <View
          style={[
            styles.textPlaceholder,
            { width: "30%", height: 16, marginTop: 8 },
          ]}
        />

        {/* Button Placeholder */}
        <View style={styles.buttonPlaceholder} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <Ionicons name="filter" size={24} color="#e1e1e1" />
      </View>

      {/* Event List */}
      <FlatList
        data={[1, 2, 3]} // Dummy data for skeleton items
        renderItem={SkeletonEventItem}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={styles.listContent}
      />
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e1e1e1",
  },
  listContent: {
    paddingHorizontal: 16,
  },
  eventItem: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#e1e1e1",
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "space-between",
  },
  textPlaceholder: {
    backgroundColor: "#e1e1e1",
    borderRadius: 4,
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
});
