import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Alert,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Modal,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Carousel from "react-native-reanimated-carousel";
import haversine from "haversine";
import HorizontalLine from "@/components/default/HorizontalLine";
import VendorMarker from "../../../components/VendorMarker";
import VendorMapInfoCard from "../../../components/VendorMapInfoCard";
import { Vendor, LocationCoordinates } from "@/constants/types";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/authSlice"; // Update the path as needed
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../services/firestore"; // Adjust the path to your Firestore utility file

//TODO: Replace with collections from Firestore
import liveVendors from "../../../dummyVendorMapData.json";

const { width } = Dimensions.get("window");

export default function Index() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isVendorActive, setVendorActive] = useState(false);
  const [buttonColorAnim] = useState(new Animated.Value(0));

  const snapPoints = useMemo(() => ["15%", "50%", "90%"], []);
  const user = useSelector(selectUser);
  const userName = user?.name || "Vendor Name";

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location permission is required.");
          return;
        }
        const { coords } = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = coords;
        setLocation({ latitude, longitude });

        const sortedVendors = liveVendors
          .map((vendor) => {
            const distance = haversine(
              { latitude, longitude },
              { latitude: vendor.latitude, longitude: vendor.longitude },
              { unit: "km" }
            );
            return { ...vendor, distance };
          })
          .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

        setVendors(sortedVendors);
      } catch (error) {
        Alert.alert("Error", "Unable to fetch location.");
      }
    })();
  }, []);

  const handleMarkerPress = (vendor: Vendor) => {
    const index = vendors.findIndex((v) => v.uid === vendor.uid);
    setSelectedVendor(vendor);
    setCarouselIndex(index);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: vendor.latitude,
          longitude: vendor.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  const handleCardClose = () => {
    setSelectedVendor(null);
  };

  const handleCardPress = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedVendor(null);
  };

  const toggleVendorActive = async (uid: string | undefined) => {
    if (!uid) {
      console.error("User UID is not available");
      return;
    }

    try {
      Animated.timing(buttonColorAnim, {
        toValue: isVendorActive ? 0 : 1,
        duration: 500,
        useNativeDriver: false,
      }).start();

      if (!isVendorActive) {
        // Add the UID to the "activeVendors" collection
        await setDoc(doc(db, "activeVendors", uid), {
          uid,
          timestamp: new Date().toISOString(),
        });
        console.log("User added to activeVendors collection");
      } else {
        // Remove the UID from the "activeVendors" collection
        await deleteDoc(doc(db, "activeVendors", uid));
        console.log("User removed from activeVendors collection");
      }

      setVendorActive((prev) => !prev);
    } catch (error) {
      console.error("Error toggling vendor active status:", error);
    }
  };

  const buttonBackgroundColor = buttonColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#90EE90", "#FF7F7F"], // Blue to light green
  });

  return (
    <SafeAreaView style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          showsUserLocation={true}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {vendors.map((vendor) => (
            <VendorMarker
              key={vendor.uid}
              vendor={vendor}
              onPress={() => handleMarkerPress(vendor)}
            />
          ))}
        </MapView>
      )}

      {selectedVendor && (
        <View style={styles.carouselContainer}>
          <Carousel
            width={width * 0.9}
            height={250}
            data={vendors}
            renderItem={({ index }) => (
              <VendorMapInfoCard
                vendor={vendors[index]}
                userLocation={location}
                onClose={handleCardClose}
              />
            )}
            onSnapToItem={(index) => {
              setCarouselIndex(index);
              handleMarkerPress(vendors[index]);
            }}
            defaultIndex={carouselIndex}
          />
        </View>
      )}

      <BottomSheet ref={bottomSheetRef} index={1} snapPoints={snapPoints}>
        <BottomSheetView style={styles.bottomSheetContent}>
          <Text style={styles.dragSectionHeader}>{userName}</Text>
          <Text style={styles.dragSectionSubheader}>Manage your store</Text>
          <HorizontalLine />
          <TouchableOpacity
            onPress={() => user && toggleVendorActive(user.uid)}
          >
            <Animated.View
              style={[
                styles.toggleButton,
                { backgroundColor: buttonBackgroundColor },
              ]}
            >
              <Text style={styles.toggleButtonText}>
                {isVendorActive ? "Close Up Shop" : "Go Live"}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedVendor && (
              <>
                <Image
                  source={{ uri: selectedVendor.image }}
                  style={styles.logo}
                />
                <Text style={styles.name}>{selectedVendor.name}</Text>
                <Text style={styles.description}>
                  {selectedVendor.description}
                </Text>
                <Text style={styles.price}>Price: {selectedVendor.price}</Text>
                <Text style={styles.rating}>
                  Rating: {selectedVendor.rating}/5
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                <HorizontalLine />

                {/* Dummy Menu */}
                <Text style={styles.menuHeader}>Menu</Text>
                {/* <FlatList
                  data={dummyMenu}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.menuItem}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      <Text style={styles.menuItemDescription}>
                        {item.description}
                      </Text>
                      <Text style={styles.menuItemPrice}>{item.price}</Text>
                    </View>
                  )}
                  contentContainerStyle={styles.menuList}
                /> */}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  carouselContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  dragSectionHeader: {
    fontSize: 24,
    fontWeight: "bold",
  },
  dragSectionSubheader: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Align modal to the bottom
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
  },
  modalContent: {
    ...StyleSheet.absoluteFillObject, // Extend modal to fill the bottom area
    backgroundColor: "#fff", // Modal background
    borderTopLeftRadius: 20, // Rounded corners at the top
    borderTopRightRadius: 20,
    padding: 16, // Add padding for content
    paddingBottom: 32, // Extra padding to account for the safe area
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  menuHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  menuList: {
    paddingBottom: 16, // Adds spacing below the last item
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#555",
  },
  menuItemPrice: {
    fontSize: 14,
    color: "#007bff",
    marginTop: 4,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    height: 65,
    justifyContent: "center",
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
