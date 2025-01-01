import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import SelectDropdown from "react-native-select-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function VendorEditAccountScreen() {
  const router = useRouter();
  const [price, setPrice] = useState(null);
  const [vendorType, setVendorType] = useState(null);
  const [customVendorType, setCustomVendorType] = useState("");
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [showBadge, setShowBadge] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    console.log({
      price,
      vendorType,
      customVendorType,
      name,
      rating,
      description,
      image,
      showBadge,
    });
    router.back();
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
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.editImageText}>Edit picture or avatar</Text>
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
          onSelect={(selectedItem) => setPrice(selectedItem.title)}
          renderButton={(selectedItem, isOpened) => (
            <View style={styles.dropdownButtonStyle}>
              {selectedItem && (
                <Icon
                  name={selectedItem.icon}
                  style={styles.dropdownButtonIconStyle}
                />
              )}
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
              <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
              <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          dropdownStyle={styles.dropdownMenuStyle}
        />

        <Text style={styles.label}>Vendor Type</Text>
        <SelectDropdown
          data={vendorTypeOptions}
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

        {vendorType === "Other" && (
          <TextInput
            style={styles.input}
            value={customVendorType}
            onChangeText={setCustomVendorType}
            placeholder="Specify vendor type"
          />
        )}

        <Text style={styles.label}>Rating</Text>
        <TextInput
          style={styles.input}
          value={rating.toString()}
          onChangeText={(text) => setRating(Number(text))}
          placeholder="Enter rating"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          multiline
        />

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Show Badge</Text>
          <Switch value={showBadge} onValueChange={setShowBadge} />
        </View>

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
    borderRadius: 8,
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
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
