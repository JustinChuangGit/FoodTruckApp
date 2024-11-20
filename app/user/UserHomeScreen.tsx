import React, { useState } from "react";
import { View, ScrollView, Text, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function UserHomeScreen() {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  return (
    <View className="flex-1">
      {/* Map as the background */}
      <MapView
        className="absolute inset-0"
        initialRegion={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
      >
        <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }} />
      </MapView>

      {/* Scrollable Card */}
      <ScrollView
        className={`absolute top-[${
          SCREEN_HEIGHT / 2
        }px] w-full bg-transparent`}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="bg-white rounded-t-2xl shadow-lg p-5">
          <Text className="text-lg font-bold mb-3">For You</Text>
          <Text className="text-sm text-gray-600 mb-5">
            What's impacting the market and stocks you follow
          </Text>
          {/* Add your scrollable content here */}
          {[...Array(10).keys()].map((i) => (
            <Text key={i} className="text-base mb-3">
              Item {i + 1}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
