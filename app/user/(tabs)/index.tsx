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
import { router } from "expo-router";

const { width } = Dimensions.get("window");

function formatMenuWithHeaders(
  menu: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
  }[]
) {
  const grouped = menu.reduce((acc: Record<string, any[]>, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const formatted = [];
  for (const [category, items] of Object.entries(grouped)) {
    formatted.push({ type: "header", title: category }); // Add header
    formatted.push(
      ...items.map((item) => ({
        ...item,
        type: "item",
        price: item.price.toFixed(2), // Convert price to string
      }))
    ); // Add items
  }
  return formatted;
}

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

    const location = JSON.stringify({
      latitude: vendor.latitude,
      longitude: vendor.longitude,
    });
    const menu = JSON.stringify(vendor.menu);

    console.log("Index encoded image", encodeURIComponent(vendor.image));
    console.log("Index original image", vendor.image);

    router.push({
      pathname: "/user/otherScreens/userVendorInfo",
      params: {
        uid: vendor.uid,
        location: encodeURIComponent(location),
        menu: encodeURIComponent(menu),
        name: vendor.name,
        vendorType: vendor.vendorType,
        price: vendor.price,
        description: vendor.description,
        image: encodeURIComponent(vendor.image), // Encode the image URL
        rating: vendor.rating,
      },
    });
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
                onPress={(vendor) => handleCardPress(vendor)} // Pass the vendor to handleCardPress
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
        index={2}
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

      {isModalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            {selectedVendor && (
              <View style={styles.modalContent}>
                <SafeAreaView style={styles.logoContainer}>
                  <Image
                    source={{ uri: selectedVendor.image }}
                    style={styles.logo}
                  />
                </SafeAreaView>
                <View style={styles.modalInformationContainer}>
                  {/* Vendor Name */}
                  <Text style={styles.name}>{selectedVendor.name}</Text>

                  {/* Vendor Description */}
                  <Text style={styles.description}>
                    {selectedVendor.description}
                  </Text>

                  {/* Vendor Price Range */}
                  <Text style={styles.price}>
                    Price: {selectedVendor.price}
                  </Text>

                  {/* Vendor Rating */}
                  <Text style={styles.rating}>
                    Rating: {selectedVendor.rating}/5
                  </Text>

                  {/* Close Button */}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeModal}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>

                  {/* Horizontal Line */}
                  <HorizontalLine />

                  {/* Vendor Menu */}
                  <Text style={styles.menuHeader}>Menu</Text>
                  {selectedVendor.menu && selectedVendor.menu.length > 0 ? (
                    <FlatList
                      data={formatMenuWithHeaders(selectedVendor.menu)} // Add headers to menu data
                      keyExtractor={(item, index) =>
                        item.id || `header-${index}`
                      } // Handle both menu items and headers
                      renderItem={({ item }) =>
                        item.type === "header" ? (
                          <Text style={styles.categoryHeader}>
                            {item.title}
                          </Text> // Render category header
                        ) : (
                          <View style={styles.menuItem}>
                            <View style={styles.menuItemTextContainer}>
                              <Text style={styles.menuItemName}>
                                {item.name}
                              </Text>
                              <Text style={styles.menuItemDescription}>
                                {item.description}
                              </Text>
                            </View>
                            <View style={styles.menuItemPriceContainer}>
                              <Text style={styles.menuItemPrice}>
                                ${item.price}
                              </Text>
                            </View>
                          </View>
                        )
                      }
                      contentContainerStyle={styles.menuList}
                    />
                  ) : (
                    <Text style={styles.emptyMenuText}>
                      No menu items available
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </Modal>
      )}
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
    fontSize: 28,
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
    paddingBottom: 32, // Extra padding to account for the safe area
  },
  logo: {
    width: "100%", // Fill the container's width
    height: "100%", // Fill the container's height
    resizeMode: "cover", // Scale the image to cover the container
    zIndex: 1, // Place the image above other content
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
    fontSize: 30,
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
    flexDirection: "row",
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
  emptyMenuText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 16,
  },
  categoryHeader: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 20,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemPriceContainer: {
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "red",
    height: 300,
  },
  modalInformationContainer: {
    paddingHorizontal: 16,
  },
});
