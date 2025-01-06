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
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, {
  BottomSheetView,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import Carousel from "react-native-reanimated-carousel";
import haversine from "haversine";
import MyRow from "../components/MyRow";
import HorizontalLine from "@/components/default/HorizontalLine";
import VendorMarker from "../../../components/VendorMarker";
import VendorMapInfoCard from "../../../components/VendorMapInfoCard";
import { SECTIONS } from "../../../constants/UserConstants";
import { Vendor, LocationCoordinates } from "@/constants/types";
import { collection, onSnapshot } from "firebase/firestore";
import { db, getVendorInfo } from "@/services/firestore";
import { Section } from "@/constants/types";

//TODO: Replace with collections from Firestore
import liveVendors from "../../../dummyVendorMapData.json";

const { width } = Dimensions.get("window");

const dummyMenu = [
  {
    id: "1",
    name: "Taco Special",
    description: "Three delicious tacos with your choice of protein.",
    price: "$8.99",
  },
  {
    id: "2",
    name: "Loaded Nachos",
    description: "Crispy tortilla chips topped with cheese and salsa.",
    price: "$6.99",
  },
  {
    id: "3",
    name: "Burrito Bowl",
    description: "A hearty bowl with rice, beans, and toppings.",
    price: "$9.99",
  },
  {
    id: "4",
    name: "Quesadilla",
    description: "Cheesy quesadilla served with sour cream and guacamole.",
    price: "$7.99",
  },
  {
    id: "5",
    name: "Churros",
    description: "Sweet fried dough sprinkled with cinnamon sugar.",
    price: "$4.99",
  },
  {
    id: "6",
    name: "Street Corn",
    description:
      "Grilled corn on the cob coated with butter, cheese, and spices.",
    price: "$3.99",
  },
  {
    id: "7",
    name: "Fish Tacos",
    description: "Fresh fish tacos topped with cabbage and tangy sauce.",
    price: "$10.99",
  },
  {
    id: "8",
    name: "Carne Asada Fries",
    description:
      "Crispy fries topped with grilled steak, cheese, and guacamole.",
    price: "$11.99",
  },
  {
    id: "9",
    name: "Vegetarian Burrito",
    description: "A burrito packed with beans, rice, veggies, and salsa.",
    price: "$8.49",
  },
  {
    id: "10",
    name: "Tostadas",
    description: "Crispy tortillas topped with beans, lettuce, and cheese.",
    price: "$5.99",
  },
  {
    id: "11",
    name: "Chicken Enchiladas",
    description: "Corn tortillas stuffed with chicken and topped with sauce.",
    price: "$12.99",
  },
  {
    id: "12",
    name: "Steak Fajitas",
    description: "Sizzling steak strips served with peppers and onions.",
    price: "$14.99",
  },
  {
    id: "13",
    name: "Tamales",
    description: "Traditional steamed corn masa filled with meat or veggies.",
    price: "$7.99",
  },
  {
    id: "14",
    name: "Guacamole & Chips",
    description: "Fresh guacamole served with crispy tortilla chips.",
    price: "$5.49",
  },
  {
    id: "15",
    name: "Mexican Rice",
    description: "Fluffy rice cooked with tomatoes and spices.",
    price: "$2.99",
  },
];

function getNearbyVendors(
  vendors: Vendor[],
  location: LocationCoordinates | null
): { id: string; title: string; vendors: Vendor[] } {
  if (!location) {
    return {
      id: "nearby",
      title: "Nearby Vendors",
      vendors: [],
    };
  }

  const sortedVendors = vendors
    .map((vendor) => ({
      ...vendor,
      distance: haversine(location, {
        latitude: vendor.latitude,
        longitude: vendor.longitude,
      }),
    }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

  return {
    id: "nearby",
    title: "Nearby Vendors",
    vendors: sortedVendors,
  };
}

function formatSections(
  sections: { id: string; title: string; vendors: Vendor[] }[]
): Section[] {
  return sections.map((section, index) => ({
    id: (index + 1).toString(),
    title: section.title,
    vendors: section.vendors,
  }));
}

export default function Index() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const SECTIONDATA = formatSections([
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
    getNearbyVendors(vendors, location),
  ]);
  const snapPoints = useMemo(() => ["15%", "50%", "60%"], []);

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

  const handleMarkerPress = (vendor: Vendor) => {
    const index = vendors.findIndex((v) => v.uid === vendor.uid);
    setSelectedVendor(vendor);
    setCarouselIndex(index);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: vendor.latitude, // Assuming Vendor type has latitude/longitude
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

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enableOverDrag={false}
        topInset={100}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.dragSectionHeaderContainer}>
            <Text style={styles.dragSectionHeader}>For You</Text>
            <Text style={styles.dragSectionSubheader}>
              Checkout some spots we think you'd like
            </Text>
            <HorizontalLine />
          </View>
          <BottomSheetFlatList
            data={SECTIONDATA}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MyRow section={item} onCardPress={handleCardPress} />
            )}
            contentContainerStyle={{
              paddingHorizontal: 0, // Remove extra padding here
              paddingBottom: 16, // Optional for spacing at the bottom
            }}
          />
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
                <FlatList
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
                />
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
  dragSectionHeaderContainer: {
    paddingHorizontal: 16,
  },
});
