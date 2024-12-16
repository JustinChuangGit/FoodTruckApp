import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Alert,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  FlatList,
  GestureResponderEvent,
  NativeTouchEvent,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";

const SECTIONS = [
  { id: "1", title: "Recommended for You", data: Array(10).fill("Card") },
  { id: "2", title: "Trending Now", data: Array(8).fill("Card") },
  { id: "3", title: "New Releases", data: Array(12).fill("Card") },
  { id: "4", title: "Top Picks for You", data: Array(15).fill("Card") },
  { id: "5", title: "Popular in Your Area", data: Array(10).fill("Card") },
  { id: "6", title: "Recently Watched", data: Array(6).fill("Card") },
  { id: "7", title: "Action-Packed Favorites", data: Array(8).fill("Card") },
  { id: "8", title: "Romantic Comedies", data: Array(9).fill("Card") },
  { id: "9", title: "Family-Friendly Picks", data: Array(7).fill("Card") },
  { id: "10", title: "Highly Rated Movies", data: Array(10).fill("Card") },
  { id: "11", title: "Documentaries You’ll Love", data: Array(8).fill("Card") },
  { id: "12", title: "Hidden Gems", data: Array(12).fill("Card") },
  { id: "13", title: "Award-Winning Films", data: Array(10).fill("Card") },
  { id: "14", title: "Comedy Specials", data: Array(9).fill("Card") },
  { id: "15", title: "International Hits", data: Array(8).fill("Card") },
  { id: "16", title: "Classic Favorites", data: Array(6).fill("Card") },
  { id: "17", title: "Top 10 in the U.S. Today", data: Array(10).fill("Card") },
  { id: "18", title: "Sci-Fi & Fantasy", data: Array(8).fill("Card") },
  { id: "19", title: "Crime Thrillers", data: Array(9).fill("Card") },
  { id: "20", title: "Kids’ Movies", data: Array(7).fill("Card") },
  { id: "21", title: "Horror Classics", data: Array(6).fill("Card") },
  { id: "22", title: "Feel-Good Movies", data: Array(8).fill("Card") },
  { id: "23", title: "Action Blockbusters", data: Array(9).fill("Card") },
  { id: "24", title: "Drama Favorites", data: Array(10).fill("Card") },
  { id: "25", title: "Based on True Stories", data: Array(7).fill("Card") },
];

const CardItem = ({ item, index }: { item: string; index: number }) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <View style={styles.cardItem} className="bg-slate-600">
      <Text>Card {index + 1}</Text>
    </View>
    {/* Spacer between cards */}
    <View style={styles.cardSpacer} />
  </View>
);

// Component to render rows with a title and a horizontal list of cards
const MyRow = ({ section }: { section: { title: string; data: string[] } }) => (
  <View style={styles.mainSection}>
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
    <FlatList
      data={section.data}
      keyExtractor={(_, index) => `${section.title}-${index}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item, index }) => <CardItem item={item} index={index} />}
    />
  </View>
);

export default function index() {
  return (
    <SafeAreaView style={styles.container}>
      <View
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
        }}
      >
        <FlatList
          data={SECTIONS}
          keyExtractor={(section) => section.id}
          renderItem={({ item }) => <MyRow section={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 16,
  },
  dragHandle: {
    width: 40,
    height: 6,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    width: 120,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  cardSpacer: {
    width: 100, // Adjust the width to define the space between cards
    height: "100%",
    backgroundColor: "red",
    // backgroundColor: "transparent", // Keeps it invisible
  },
  sectionTitleContainer: {
    height: 40,
    width: "100%",
    backgroundColor: "#f0f0f0",
  },
  mainSection: {},
});
