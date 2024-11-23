// import React from "react";
// import { StyleSheet, View } from "react-native";
// import MapView, { Marker } from "react-native-maps";

// export default function UserHomeScreen() {
//   return (
//     <View className="flex-1">
//       <MapView
//         style={styles.map}
//         initialRegion={{
//           latitude: 37.78825,
//           longitude: -122.4324,
//           latitudeDelta: 0.0922,
//           longitudeDelta: 0.0421,
//         }}
//       >
//         <Marker
//           coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
//           title="My Marker"
//           description="Marker Description"
//         />
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   map: {
//     ...StyleSheet.absoluteFillObject, // Makes the map fill the entire screen
//   },
// });
import React, { useState, useEffect } from "react";
import { View, Alert, Text, StyleSheet } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export default function UserHomeScreen() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location permission is required to use this feature."
          );
          return;
        }

        // Get current location
        const userLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = userLocation.coords;

        // Set region and location
        setLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        console.error("Error fetching location:", error);
        Alert.alert("Error", "Unable to fetch location. Please try again.");
      }
    })();
  }, []);

  return (
    <View className="flex-1">
      {region ? (
        <MapView
          className="absolute inset-0" // Ensures the map fills the entire screen
          region={region} // Center the map on the user's location
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
          style={styles.map}
        >
          {/* Add a marker at the user's location */}
          {location && (
            <Marker
              coordinate={location}
              title="You are here"
              description="Your current location"
            />
          )}
        </MapView>
      ) : (
        <View className="flex-1 items-center justify-center bg-gray-100">
          <Text className="text-gray-500">Loading your location...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject, // Makes the map fill the entire screen
  },
});
