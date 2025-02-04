import React from "react";
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
} from "react-native";
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
  const [title, setTitle] = React.useState("");
  const [date, setDate] = React.useState("");
  const [locationText, setLocationText] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [region, setRegion] = React.useState<Region | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Create a ref for the autocomplete component (typed as any for convenience)
  const autoCompleteRef = React.useRef<any>(null);

  // Request user's current location on mount
  React.useEffect(() => {
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
    // Capture the event details including the map's center location (region)
    console.log({ title, date, locationText, description, region });
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

          {/* Form */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Event Title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Event Date"
              value={date}
              onChangeText={setDate}
              placeholderTextColor="#999"
            />

            {/* Address Autocomplete */}
            <View style={styles.autocompleteContainer}>
              <GooglePlacesAutocomplete
                ref={autoCompleteRef}
                placeholder="Search for an address"
                minLength={2}
                listViewDisplayed={false}
                fetchDetails={true} // Fetch details to get geometry info
                renderDescription={(row) => row.description}
                onPress={(data, details = null) => {
                  // Update the text input with the selected address
                  setLocationText(data.description);
                  autoCompleteRef.current?.setAddressText(data.description);
                  // If details are available, update the region with the lat/lng
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
                    console.log("Selected lat/lng: ", lat, lng);
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

            {/* Map View */}
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
                showsUserLocation={true}
              />
              {/* Fixed Marker in the Center */}
              <View style={styles.markerFixed}>
                <FontAwesome
                  name="map-marker"
                  size={30}
                  color={munchColors.primary}
                />
              </View>
            </View>

            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Event Description"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateEvent}
            >
              <Text style={styles.submitButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
});
