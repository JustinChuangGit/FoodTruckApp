import React, { useState, useEffect, useRef, useMemo } from "react";
import { Alert, StyleSheet, Dimensions, Animated } from "react-native";
import * as Location from "expo-location";
import haversine from "haversine";
import { Vendor, LocationCoordinates } from "@/constants/types";
import { collection, onSnapshot } from "firebase/firestore";
import { db, getVendorInfo } from "@/services/firestore";
import MainMapAndBottomSheet from "@/components/MainMapAndBottomSheet";
import { getNearbyVendors, formatSections } from "@/functions/sectionFunctions";

export default function Index() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const SECTIONDATA = formatSections([
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
  ]);
  const scaleAnim = useRef(new Animated.Value(0)).current; // Initial scale value

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation(coords);
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "activeVendors"),
      (snapshot) => {
        const updatedVendors = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            latitude: data.location?.latitude,
            longitude: data.location?.longitude,
            price: data.price || "$$", // Default price if not provided
            name: data.name || "Unknown Vendor",
            rating: data.rating || 0, // Default rating if not provided
            description: data.description || "No description available",
            image: data.image || "https://via.placeholder.com/150", // Default image
            menu: data.menu || [], // Include menu field, default to an empty array
            vendorType: data.vendorType || "Other", // Default vendor type
          };
        });
        setVendors(updatedVendors);
      },
      (error) => {
        console.error("Error fetching active vendors:", error); // Log errors
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <MainMapAndBottomSheet
      sections={SECTIONDATA}
      location={location}
      vendors={vendors}
    />
  );
}

const styles = StyleSheet.create({});
