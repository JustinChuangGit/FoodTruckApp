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

// Define your API keys for each platform
const googleApiKey =
  Platform.OS === "ios" ? apiKeys.iosPlaces : apiKeys.andoidPlaces;

export default function CreateNewEventScreen() {
  const router = useRouter();

  // Dropdown for event type
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [eventType, setEventType] = React.useState("Farmers Market");
  const [items, setItems] = React.useState([
    { label: "Farmers Market", value: "Farmers Market" },
    { label: "Flea Market", value: "Flea Market" },
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

  // Request user's current location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        setLoading(false);
        return;
      }
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

  const handleCreateEvent = () => {
    const eventTitle = eventType === "Other" ? customEventTitle : eventType;
    console.log({
      eventTitle,
      date: dateValue,
      startTime,
      endTime,
      locationText,
      description,
      region,
    });
    router.back();
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
        keyboardVerticalOffset={100}
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

          <View style={styles.formContainer}>
            {/* Map View */}
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
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
              open={openDropdown}
              value={eventType}
              items={items}
              setOpen={setOpenDropdown}
              setValue={setEventType}
              setItems={setItems}
              containerStyle={styles.dropdownContainer}
              style={styles.dropdown}
              dropDownStyle={styles.dropdownList}
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

            {/* Date Picker */}
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                Select Date: {dateValue.toDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateValue}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDateValue(selectedDate);
                  }
                }}
              />
            )}

            {/* Start Time Picker */}
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {startTime
                  ? `Start Time: ${startTime.toLocaleTimeString()}`
                  : "Add Start Time"}
              </Text>
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowStartTimePicker(false);
                  if (selectedTime) {
                    setStartTime(selectedTime);
                  }
                }}
              />
            )}

            {/* End Time Picker */}
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {endTime
                  ? `End Time: ${endTime.toLocaleTimeString()}`
                  : "Add End Time"}
              </Text>
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={endTime || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowEndTimePicker(false);
                  if (selectedTime) {
                    setEndTime(selectedTime);
                  }
                }}
              />
            )}

            {/* Address Autocomplete */}
            <View style={styles.autocompleteContainer}>
              <GooglePlacesAutocomplete
                ref={autoCompleteRef}
                placeholder="Search for an address"
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
                  onChangeText: setLocationText,
                }}
                styles={{
                  textInput: styles.input,
                  container: { flex: 0 },
                  listView: { backgroundColor: "#fff" },
                }}
              />
            </View>

            {/* Description Toggle */}
            {!showDescription && (
              <TouchableOpacity
                style={styles.addDescriptionButton}
                onPress={() => setShowDescription(true)}
              >
                <Text style={styles.addDescriptionButtonText}>
                  Add Description
                </Text>
              </TouchableOpacity>
            )}
            {showDescription && (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Event Description"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateEvent}
            >
              <Text style={styles.submitButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Full Screen Map Modal */}
      <Modal visible={isMapFullScreen} animationType="slide">
        <SafeAreaView style={styles.fullScreenContainer}>
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
              onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
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
        </SafeAreaView>
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
    fontSize: 40,
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
    marginBottom: 16,
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
    fontSize: 16,
    color: "#333",
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
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
  fullScreenMapContainer: {
    flex: 1,
    position: "relative",
  },
  fullScreenMap: {
    flex: 1,
  },
});
