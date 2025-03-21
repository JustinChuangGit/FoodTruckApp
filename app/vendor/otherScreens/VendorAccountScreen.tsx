import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useDispatch } from "react-redux"; // Import useDispatch
import { signOutUser } from "@/services/auth"; // Import signOutUser
import { munchColors } from "@/constants/Colors";

export default function VendorAccountScreen() {
  const router = useRouter();
  const dispatch = useDispatch(); // Initialize the Redux dispatch
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePressIn = () => {
    timerRef.current = setTimeout(() => {
      router.push("/vendor/otherScreens/AdminApproveEventScreen");
    }, 5000); // 5 seconds hold
  };

  const handlePressOut = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  const handleSignOut = async () => {
    try {
      await signOutUser(dispatch); // Call the signOut function and pass the dispatch
      router.replace("/auth/LoginScreen"); // Navigate to the sign-in screen after signing out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={() => router.back()}>
        <FontAwesome name="chevron-left" size={24} color="black" />
        <Text style={styles.headerText}>Account</Text>
        <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <View style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            router.push("/vendor/otherScreens/vendorEditMenuScreen")
          }
        >
          <Text style={styles.menuText}>Edit Menu/Items</Text>
          <FontAwesome
            name="chevron-right"
            size={16}
            style={styles.rightChevron}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            router.push("/vendor/otherScreens/vendorEditAccountScreen")
          }
        >
          <Text style={styles.menuText}>Account Information</Text>
          <FontAwesome
            name="chevron-right"
            size={16}
            style={styles.rightChevron}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/sharedScreens/signInAndSecurityScreen")}
        >
          <Text style={styles.menuText}>Sign In and Security</Text>
          <FontAwesome
            name="chevron-right"
            size={16}
            style={styles.rightChevron}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/sharedScreens/termsAndServiceScreen")}
        >
          <Text style={styles.menuText}>Terms of Service</Text>
          <FontAwesome
            name="chevron-right"
            size={16}
            style={styles.rightChevron}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/sharedScreens/reportBugScreen")}
        >
          <Text style={styles.menuText}>Report A Bug</Text>
          <FontAwesome
            name="chevron-right"
            size={16}
            style={styles.rightChevron}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/sharedScreens/deleteAccountScreen")}
        >
          <Text style={styles.menuText}>Delete Account</Text>
          <FontAwesome
            name="chevron-right"
            size={16}
            style={styles.rightChevron}
          />
        </TouchableOpacity>
      </View>
      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
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
  headerText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
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
    color: munchColors.primary, // Blue color similar to iOS settings
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
  rightChevron: {
    color: munchColors.primary,
  },
});
