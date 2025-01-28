import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import SelectDropdown from "react-native-select-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/authSlice"; // Update the path as needed
import {
  updateVendorAccountData,
  getVendorAccountData,
} from "../../../services/firestore"; // Update the path as needed
import { VendorAccountInfo } from "../../../constants/types"; // Update the path as needed
import { uploadImage } from "../../../services/storage"; // Update the path as needed
import { useDispatch } from "react-redux";
import { setUser } from "../../../redux/authSlice"; // Update the path as needed
import { munchColors } from "@/constants/Colors";
import Carousel from "react-native-reanimated-carousel";
import { Dimensions } from "react-native";
import Pagination from "react-native-reanimated-carousel";
import { munchStyles } from "@/constants/styles";

const screenWidth = Dimensions.get("window").width; // Get the screen width

const priceOptions = [
  { title: "$", icon: "currency-usd" },
  { title: "$$", icon: "currency-usd" },
  { title: "$$$", icon: "currency-usd" },
];

const vendorTypeOptions = [
  { title: "American" },
  { title: "Italian" },
  { title: "Japanese" },
  { title: "Chinese" },
  { title: "Indian" },
  { title: "Mexican" },
  { title: "Thai" },
  { title: "Mediterranean" },
  { title: "Korean" },
  { title: "Vietnamese" },
  { title: "Spanish" },
  { title: "Greek" },
  { title: "Middle Eastern" },
  { title: "Brazilian" },
  { title: "Produce" },
  { title: "Other" },
];

export default function VendorEditAccountScreen() {
  const router = useRouter();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  // State for vendor account info
  const [loading, setLoading] = useState(false); // For image upload
  const [images, setImages] = useState<
    { id: "logo" | "truck"; uri: string | null; placeholder: string }[]
  >([
    {
      id: "logo",
      uri: user?.image || null,
      placeholder: "Please Add Your Logo",
    },
    {
      id: "truck",
      uri: user?.truckImage || null, // Use truckImage from Redux state
      placeholder: "Please Add Your Truck Image",
    },
  ]);

  const [price, setPrice] = useState(user?.price || "");
  const [vendorType, setVendorType] = useState(user?.vendorType || "");
  const [vendorName, setVendorName] = useState(user?.vendorName || "");
  const [description, setDescription] = useState(user?.description || "");
  const [activeIndex, setActiveIndex] = useState(0); // Track the current active index

  // Function to pick and upload image
  const pickImage = async (fileName: "logo" | "truck"): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!user?.uid) {
      console.error("User UID not available.");
      return;
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const localUri = result.assets[0].uri;
      setLoading(true);

      try {
        const imagePath = `vendors/${user?.uid}/${fileName}.jpg`; // Dynamically set file name
        const downloadURL = await uploadImage(localUri, imagePath);

        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === fileName ? { ...img, uri: downloadURL } : img
          )
        );

        // Update Redux and Firestore
        const updatedUser = {
          ...user,
          [fileName === "logo" ? "image" : "truckImage"]: downloadURL,
        };
        dispatch(setUser(updatedUser)); // Update Redux state

        const vendorData: Partial<VendorAccountInfo> = {
          [fileName === "logo" ? "image" : "truckImage"]: downloadURL,
        };
        await updateVendorAccountData(user.uid, vendorData); // Update Firestore
      } catch (error) {
        console.error(`Error uploading ${fileName} image:`, error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!user?.uid) {
      console.error("User UID not available. Ensure the user is logged in.");
      return;
    }

    if (
      !vendorName.trim() ||
      !price.trim() ||
      !vendorType.trim() ||
      !description.trim()
    ) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    const vendorData: VendorAccountInfo = {
      price,
      vendorType,
      vendorName,
      description,
      image: images.find((img) => img.id === "logo")?.uri || null, // Save logo image
    };

    try {
      await updateVendorAccountData(user.uid, vendorData);
      dispatch(
        setUser({
          ...user,
          ...vendorData,
          image: vendorData.image || undefined,
        })
      ); // Convert null to undefined
      router.back();
    } catch (error) {
      console.error("Error updating vendor data:", error);
    }
  };

  const renderCarouselItem = ({
    item,
  }: {
    item: { id: "logo" | "truck"; uri: string | null; placeholder: string };
  }) => (
    <View style={styles.imageContainer}>
      {loading ? (
        <View style={styles.placeholderImage}>
          <ActivityIndicator size="large" color="blue" />
        </View>
      ) : item.uri ? (
        <Image source={{ uri: item.uri }} style={styles.profileImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>{item.placeholder}</Text>
        </View>
      )}
      <TouchableOpacity onPress={() => pickImage(item.id)}>
        <Text style={styles.editImageText}>
          {item.id === "logo" ? "Edit Logo" : "Edit Truck Image"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <FontAwesome name="chevron-left" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Edit Profile</Text>
          </View>
          <ScrollView contentContainerStyle={styles.formContainer}>
            <View style={styles.carouselContainer}>
              <Carousel
                data={images}
                renderItem={renderCarouselItem}
                width={screenWidth}
                height={250}
                onSnapToItem={(index) => setActiveIndex(index)} // Update active index
                loop={false}
                style={styles.carouselContainer}
              />
              <View style={styles.paginationContainer}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      activeIndex === index
                        ? styles.activeDot
                        : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            </View>
            {/* Form Inputs */}
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={vendorName}
              onChangeText={setVendorName}
              placeholder="Enter name"
            />
            <Text style={styles.label}>Price</Text>
            <SelectDropdown
              data={priceOptions}
              defaultValue={priceOptions.find(
                (option) => option.title === price
              )}
              onSelect={(selectedItem) => setPrice(selectedItem.title)}
              renderButton={(selectedItem, isOpened) => (
                <View style={styles.dropdownButtonStyle}>
                  <Text style={styles.dropdownButtonTxtStyle}>
                    {(selectedItem && selectedItem.title) || "Select Price"}
                  </Text>
                  <Icon
                    name={isOpened ? "chevron-up" : "chevron-down"}
                    style={styles.dropdownButtonArrowStyle}
                  />
                </View>
              )}
              renderItem={(item, index, isSelected) => (
                <View
                  style={{
                    ...styles.dropdownItemStyle,
                    ...(isSelected && { backgroundColor: "#D2D9DF" }),
                  }}
                >
                  <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              dropdownStyle={styles.dropdownMenuStyle}
            />

            <Text style={styles.label}>Vendor Type</Text>
            <SelectDropdown
              data={vendorTypeOptions}
              defaultValue={vendorTypeOptions.find(
                (option) => option.title === vendorType
              )}
              onSelect={(selectedItem) => setVendorType(selectedItem.title)}
              renderButton={(selectedItem, isOpened) => (
                <View style={styles.dropdownButtonStyle}>
                  <Text style={styles.dropdownButtonTxtStyle}>
                    {selectedItem ? selectedItem.title : "Select Vendor Type"}
                  </Text>
                  <Icon
                    name={isOpened ? "chevron-up" : "chevron-down"}
                    style={styles.dropdownButtonArrowStyle}
                  />
                </View>
              )}
              renderItem={(item, index, isSelected) => (
                <View
                  style={{
                    ...styles.dropdownItemStyle,
                    ...(isSelected && { backgroundColor: "#D2D9DF" }),
                  }}
                >
                  <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              dropdownStyle={styles.dropdownMenuStyle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              multiline
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  backButton: { marginRight: 10 },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  formContainer: { padding: 16 },
  carouselContainer: {
    marginBottom: 16,
    alignItems: "center", // Center horizontally
    justifyContent: "center", // Center vertically
    flex: 1, // Allow the container to take available space
  },
  imageContainer: { alignItems: "center", marginBottom: 16 },
  profileImage: { width: 225, height: 225, borderRadius: 120 },
  placeholderImage: {
    width: 225,
    height: 225,
    borderRadius: 120,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { color: "#888" },
  editImageText: { color: munchColors.primary, marginTop: 8 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: { height: 100 },
  saveButton: {
    backgroundColor: munchColors.primary,
    padding: 16,
    borderRadius: munchStyles.smallRadius,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  dropdownButtonStyle: {
    width: "100%",
    height: 50,
    backgroundColor: "#E9ECEF",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    color: "#151E26",
  },
  dropdownButtonArrowStyle: { fontSize: 28 },
  dropdownMenuStyle: {
    backgroundColor: "#E9ECEF",
    borderRadius: 10,
    height: 200,
  },
  dropdownItemStyle: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    color: "#151E26",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: munchColors.primary, // Active dot color
    marginHorizontal: 5,
  },
  inactiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc", // Inactive dot color
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: munchColors.primary, // Active dot color
  },
});
