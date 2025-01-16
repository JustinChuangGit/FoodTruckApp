import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function VendorAccountScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Account</Text>
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            router.push("/vendor/otherScreens/vendorEditMenuScreen")
          }
        >
          <Text style={styles.menuText}>Edit Menu</Text>
          <FontAwesome name="chevron-right" size={16} color="#007aff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            router.push("/vendor/otherScreens/vendorEditAccountScreen")
          } // Correct path
        >
          <Text style={styles.menuText}>Account Information</Text>
          <FontAwesome name="chevron-right" size={16} color="#007aff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Sign In and Security</Text>
          <FontAwesome name="chevron-right" size={16} color="#007aff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Terms of service</Text>
          <FontAwesome name="chevron-right" size={16} color="#007aff" />
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
    height: 100,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    fontSize: 18,
    color: "#000",
    marginRight: 10,
  },
  headerText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#000",
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuText: {
    fontSize: 18,
    color: "#007aff", // Blue color similar to iOS settings
  },
  signOutButton: {
    marginTop: "auto",
    marginBottom: 30,
    alignSelf: "center",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#000",
  },
  signOutText: {
    fontSize: 16,
    color: "#000",
  },
});
