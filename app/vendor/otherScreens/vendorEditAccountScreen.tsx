import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
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
export default function VendorEditAccountScreen() {
  const router = useRouter();
  const user = useSelector(selectUser);

  // State for vendor account info
  const [price, setPrice] = useState("");
  const [vendorType, setVendorType] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);

  // Fetch vendor account data on component mount
  useEffect(() => {
    const fetchVendorData = async () => {
      if (!user?.uid) {
        console.error("User UID not available.");
        return;
      }

      try {
        const data = await getVendorAccountData(user.uid);
        if (data) {
          setPrice(data.price || "");
          setVendorType(data.vendorType || "");
          setName(data.name || "");
          setDescription(data.description || "");
          setImage(data.image || null); // Set the image URL
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    };

    fetchVendorData();
  }, [user]);

  const pickImage = async () => {
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

      try {
        const imagePath = `vendors/${user?.uid}/logo.jpg`;

        const downloadURL = await uploadImage(localUri, imagePath);

        setImage(downloadURL);

        const vendorData: Partial<VendorAccountInfo> = { image: downloadURL };
        await updateVendorAccountData(user.uid, vendorData);

        console.log("Image URL updated in Firestore!");
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleSave = async () => {
    if (!user?.uid) {
      console.error("User UID not available. Ensure the user is logged in.");
      return;
    }

    const vendorData: VendorAccountInfo = {
      price,
      vendorType,
      name,
      description,
      image, // This will already have the correct download URL
    };

    try {
      await updateVendorAccountData(user.uid, vendorData);
      console.log("Vendor data updated successfully!");
      router.back(); // Navigate back after saving
    } catch (error) {
      console.error("Error updating vendor data:", error);
    }
  };

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

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} />
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
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Please Add Your Logo</Text>
            </View>
          )}
          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.editImageText}>Edit Logo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
        />

        <Text style={styles.label}>Price</Text>
        <SelectDropdown
          data={priceOptions}
          defaultValue={priceOptions.find((option) => option.title === price)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    fontSize: 16,
  },
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
  dropdownButtonArrowStyle: {
    fontSize: 28,
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
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
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  textArea: {
    height: 100,
  },
  saveButton: {
    backgroundColor: "blue",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 225,
    height: 225,
    borderRadius: 120,
  },
  placeholderImage: {
    width: 225,
    height: 225,
    borderRadius: 120,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#888",
  },
  editImageText: {
    color: "blue",
    marginTop: 8,
  },
});
