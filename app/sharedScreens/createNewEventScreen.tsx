import React, { useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Alert,
  Linking,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { munchColors } from "@/constants/Colors";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Region } from "react-native-maps";
import * as Location from "expo-location";
import { apiKeys } from "@/constants/apiKeys";
import { munchStyles } from "@/constants/styles";
import { saveEvent } from "@/services/firestore";
import { Event } from "@/constants/types";
import { selectUser } from "@/redux/authSlice";
import { useSelector } from "react-redux";

// Define your API keys for each platform
const googleApiKey =
  Platform.OS === "ios" ? apiKeys.iosPlaces : apiKeys.andoidPlaces;

export default function CreateNewEventScreen() {
  const router = useRouter();
  const user = useSelector(selectUser);
  // Dropdown for event type
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [eventType, setEventType] = React.useState("");
  const [items, setItems] = React.useState([
    { label: "Select From Dropdown", value: "" },
    { label: "Farmers Market", value: "Farmers Market" },
    { label: "Food Truck Rally", value: "Food Truck Rally" },
    { label: "Small Business Vendors", value: "Small Business Vendors" },
    { label: "Other", value: "Other" },
  ]);
  const [customEventTitle, setCustomEventTitle] = React.useState("");

  const [dateValue, setDateValue] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [startTime, setStartTime] = React.useState<Date | null>(null);
  const [showStartTimePicker, setShowStartTimePicker] = React.useState(false);
  const [endTime, setEndTime] = React.useState<Date | null>(null);
  const [showEndTimePicker, setShowEndTimePicker] = React.useState(false);

  const [locationText, setLocationText] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [showDescription, setShowDescription] = React.useState(false);
  const [region, setRegion] = React.useState<Region | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isMapFullScreen, setIsMapFullScreen] = React.useState(false);

  // Create a ref for the autocomplete component (typed as any for convenience)
  const autoCompleteRef = React.useRef<any>(null);

  useEffect(() => {
    if (!showStartTimePicker) {
      setStartTime(null);
    }
  }, [showStartTimePicker]);

  useEffect(() => {
    if (!showEndTimePicker) {
      setEndTime(null);
    }
  }, [showEndTimePicker]);

  useEffect(() => {
    if (!showDescription) {
      setDescription("");
    }
  }, [showDescription]);

  // Request user's current location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // Display alert with option to open settings
        Alert.alert(
          "Location Permission Denied",
          "Please enable location permissions in your device settings.",
          [
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openSettings();
                } else {
                  Linking.openURL("app-settings:");
                }
              },
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
        setRegion({
          latitude: 36.7378,
          longitude: -119.7871,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
        setLoading(false);
        return; // Stop here if permission isn't granted
      }
      // If granted, fetch current position
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLoading(false);
    })();
  }, []);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKeys.iosPlaces}`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address; // Get the first result
      } else {
        console.warn("No address found for the given coordinates.");
        return "Unknown Location";
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
      return "Unknown Location";
    }
  };

  const handleCreateEvent = async () => {
    const eventTitle =
      eventType === "Other" ? customEventTitle.trim() : eventType; // Trim spaces

    // Validation checks
    if (eventTitle === "") {
      Alert.alert("Validation Error", "Please enter an event title.");
      return;
    }

    if (locationText === "") {
      Alert.alert("Validation Error", "Please select a valid location.");
      return;
    }

    if (!dateValue || isNaN(new Date(dateValue).getTime())) {
      Alert.alert("Validation Error", "Please select a valid date.");
      return;
    }

    if (showStartTimePicker && !startTime) {
      Alert.alert("Validation Error", "Please select a start time.");
      return;
    }

    if (showEndTimePicker && !endTime) {
      Alert.alert("Validation Error", "Please select an end time.");
      return;
    }

    console.log("Validation Passed! Proceeding to save event...");

    const newEvent: Event = {
      eventTitle,
      date: dateValue,
      startTime,
      endTime,
      locationText: locationText.trim(),
      description: description.trim(),
      region: {
        latitude: region?.latitude ?? 0,
        longitude: region?.longitude ?? 0,
        latitudeDelta: region?.latitudeDelta ?? 0.01,
        longitudeDelta: region?.longitudeDelta ?? 0.01,
      },
      createdBy: user?.uid || "unknown-user",
    };

    try {
      const eventId = await saveEvent(newEvent);
      console.log("Event successfully created with ID:", eventId);
      Alert.alert("Success", "Your Event Has Been Sent For Approval");
      router.back();
    } catch (error) {
      console.error("Failed to create event:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  if (loading || !region) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={munchColors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={10}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="always"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <FontAwesome
                name="arrow-left"
                size={24}
                color={munchColors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>Create Event</Text>
          </View>
          <View style={{ justifyContent: "space-between", flex: 1 }}>
            <View style={styles.formContainer}>
              {/* Map View */}
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  region={region}
                  onRegionChangeComplete={async (newRegion) => {
                    setRegion(newRegion); // Update region state

                    // Call Reverse Geocoding when the user drags the map
                    const derivedAddress = await reverseGeocode(
                      newRegion.latitude,
                      newRegion.longitude
                    );
                    setLocationText(derivedAddress); // Update the address text field
                    autoCompleteRef.current?.setAddressText(derivedAddress); // Sync with GooglePlacesAutocomplete
                  }}
                  showsUserLocation={true}
                />
                <View style={styles.markerFixed}>
                  <FontAwesome
                    name="map-marker"
                    size={30}
                    color={munchColors.primary}
                  />
                </View>
                <TouchableOpacity
                  style={styles.fullScreenButton}
                  onPress={() => setIsMapFullScreen(true)}
                >
                  <FontAwesome name="arrows-alt" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Event Type Dropdown */}
              <Text style={styles.label}>Event Type</Text>
              <DropDownPicker
                listMode="FLATLIST"
                open={openDropdown}
                value={eventType}
                items={items}
                setOpen={setOpenDropdown}
                setValue={setEventType}
                setItems={setItems}
                containerStyle={styles.dropdownContainer}
                style={styles.dropdown}
              />
              {eventType === "Other" && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter Event Title"
                  value={customEventTitle}
                  onChangeText={setCustomEventTitle}
                  placeholderTextColor="#999"
                />
              )}

              <View style={styles.autocompleteContainer}>
                <Text style={styles.label}>Address</Text>

                <GooglePlacesAutocomplete
                  ref={autoCompleteRef}
                  placeholder="Search for an address or place in the map"
                  minLength={2}
                  listViewDisplayed={false}
                  fetchDetails={true}
                  renderDescription={(row) => row.description}
                  onPress={(data, details = null) => {
                    setLocationText(data.description);
                    autoCompleteRef.current?.setAddressText(data.description);
                    if (
                      details &&
                      details.geometry &&
                      details.geometry.location
                    ) {
                      const { lat, lng } = details.geometry.location;
                      setRegion({
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      });
                    }
                  }}
                  query={{
                    key: googleApiKey,
                    language: "en",
                  }}
                  textInputProps={{
                    value: locationText,
                    onChangeText: (text) => setLocationText(text),
                  }}
                  styles={{
                    textInput: styles.input,
                    container: { flex: 0 },
                    listView: { backgroundColor: "#fff" },
                  }}
                />
              </View>
              <View style={styles.dateContainer}>
                <View style={styles.dateSubcontainer}>
                  <Text style={styles.dateButtonText}>Select Date:</Text>
                  <DateTimePicker
                    value={dateValue}
                    style={styles.datePicker}
                    mode="date"
                    display="default"
                    accentColor={munchColors.primary}
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setDateValue(selectedDate);
                      }
                    }}
                  />
                </View>
                {showStartTimePicker && (
                  <View style={styles.dateSubcontainer}>
                    <Text style={styles.dateButtonText}>Start Time:</Text>

                    <DateTimePicker
                      value={startTime || new Date()}
                      mode="time"
                      display="default"
                      accentColor={munchColors.primary}
                      onChange={(event, selectedTime) => {
                        if (selectedTime) {
                          setStartTime(selectedTime);
                        }
                      }}
                    />
                  </View>
                )}
                {/* End Time Picker */}
                {showEndTimePicker && (
                  <View style={styles.dateSubcontainer}>
                    <Text style={styles.dateButtonText}>End Time:</Text>

                    <DateTimePicker
                      value={endTime || new Date()}
                      mode="time"
                      display="default"
                      accentColor={munchColors.primary}
                      onChange={(event, selectedTime) => {
                        if (selectedTime) {
                          setEndTime(selectedTime);
                        }
                      }}
                    />
                  </View>
                )}
              </View>

              {/* Description */}
              {showDescription && (
                <View>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Event Description"
                    value={description}
                    onChangeText={setDescription}
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                  />
                </View>
              )}
            </View>
            <View>
              {/* Add Buttons at the Bottom */}
              <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    {
                      backgroundColor: showStartTimePicker
                        ? "grey"
                        : munchColors.primary,
                    },
                  ]}
                  onPress={() => setShowStartTimePicker((prev) => !prev)}
                >
                  {showStartTimePicker ? (
                    <FontAwesome name="minus" size={16} color="#fff" />
                  ) : (
                    <FontAwesome name="plus" size={16} color="#fff" />
                  )}

                  <Text style={styles.addButtonText}>Start Time</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    {
                      backgroundColor: showEndTimePicker
                        ? "grey"
                        : munchColors.primary,
                    },
                  ]}
                  onPress={() => setShowEndTimePicker((prev) => !prev)}
                >
                  {showEndTimePicker ? (
                    <FontAwesome name="minus" size={16} color="#fff" />
                  ) : (
                    <FontAwesome name="plus" size={16} color="#fff" />
                  )}

                  <Text style={styles.addButtonText}>End Time</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    {
                      backgroundColor: showDescription
                        ? "grey"
                        : munchColors.primary,
                    },
                  ]}
                  onPress={() => setShowDescription((prev) => !prev)}
                >
                  {showDescription ? (
                    <FontAwesome name="minus" size={16} color="#fff" />
                  ) : (
                    <FontAwesome name="plus" size={16} color="#fff" />
                  )}
                  <Text style={styles.addButtonText}>Description</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateEvent}
              >
                <Text style={styles.submitButtonText}>Create Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Full Screen Map Modal */}
      <Modal visible={isMapFullScreen} animationType="slide">
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.fullScreenCloseButton}
            onPress={() => setIsMapFullScreen(false)}
          >
            <FontAwesome name="times" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.fullScreenMapContainer}>
            <MapView
              style={styles.fullScreenMap}
              region={region!}
              onRegionChangeComplete={async (newRegion) => {
                setRegion(newRegion); // Update region state

                // Call Reverse Geocoding when the user drags the map
                const derivedAddress = await reverseGeocode(
                  newRegion.latitude,
                  newRegion.longitude
                );
                setLocationText(derivedAddress); // Update the address text field
                autoCompleteRef.current?.setAddressText(derivedAddress); // Sync with GooglePlacesAutocomplete
              }}
              showsUserLocation={true}
            />
            <View style={styles.markerFixed}>
              <FontAwesome
                name="map-marker"
                size={30}
                color={munchColors.primary}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 100,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 20,
  },
  formContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "bold",
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdown: {
    borderColor: "#ddd",
  },
  dropdownList: {
    borderColor: "#ddd",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: "#000",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  autocompleteContainer: {
    marginBottom: 8,
  },
  mapContainer: {
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  markerFixed: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -30,
  },
  fullScreenButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: munchColors.primary,
    padding: 8,
    borderRadius: 4,
  },
  dateButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  dateButtonText: {
    marginBottom: 4,
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  addDescriptionButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  addDescriptionButtonText: {
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: munchColors.primary,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    width: "90%",
    marginHorizontal: "auto",
  },
  submitButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullScreenCloseButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenMapContainer: {
    flex: 1,
    position: "relative",
  },
  fullScreenMap: {
    flex: 1,
  },
  bottomButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: munchColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: munchStyles.smallRadius,
    flexDirection: "row",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 10,
  },
  dateContainer: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  dateSubcontainer: {
    alignItems: "center",
  },
  datePicker: {},
});
