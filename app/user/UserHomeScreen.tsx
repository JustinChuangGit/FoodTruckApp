// import React, { useState } from "react";
// import { View, ScrollView, Text, StyleSheet, Dimensions } from "react-native";
// import MapView, { Marker } from "react-native-maps";

// const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// export default function UserHomeScreen() {
//   const [region, setRegion] = useState({
//     latitude: 37.78825,
//     longitude: -122.4324,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   });

//   return (
//     <View style={styles.container}>
//       {/* Map View */}
//       <MapView
//         style={styles.map}
//         initialRegion={region}
//         onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
//         provider="google" // Ensure Google Maps is used
//       >
//         {/* Example Marker */}
//         <Marker
//           coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
//           title="Marker Title"
//           description="Marker Description"
//         />
//       </MapView>

//       {/* Scrollable Card */}
//       <ScrollView
//         style={[styles.scrollContainer, { top: SCREEN_HEIGHT / 2 }]}
//         contentContainerStyle={styles.scrollContent}
//       >
//         <View style={styles.card}>
//           <Text style={styles.title}>For You</Text>
//           <Text style={styles.description}>
//             What's impacting the market and stocks you follow
//           </Text>
//           {/* Add scrollable content */}
//           {[...Array(10).keys()].map((i) => (
//             <Text key={i} style={styles.listItem}>
//               Item {i + 1}
//             </Text>
//           ))}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject, // Makes the map fill the entire screen
//   },
//   scrollContainer: {
//     position: "absolute",
//     width: "100%",
//     backgroundColor: "transparent",
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 5, // For Android shadow
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   description: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 20,
//   },
//   listItem: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
// });

import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function UserHomeScreen() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
          title="My Marker"
          description="Marker Description"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Makes the map fill the entire screen
  },
});
