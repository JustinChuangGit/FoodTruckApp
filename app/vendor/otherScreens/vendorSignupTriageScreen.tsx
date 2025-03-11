import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { munchColors } from "@/constants/Colors";
import { munchStyles } from "@/constants/styles";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "@/redux/authSlice";
import { FontAwesome } from "@expo/vector-icons";
export default function VendorSignupTriageScreen() {
  const router = useRouter();
  const user = useSelector(selectUser);
  const [completedAccountInfo, setCompletedAccountInfo] = useState(false);
  const [completedMenu, setCompletedMenu] = useState(false);
  const [completedTerms, setCompletedTerms] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log("User:", user);
      if (
        user?.image &&
        user?.description &&
        user?.vendorType &&
        user?.price &&
        user?.name &&
        user?.truckImage
      ) {
        setCompletedAccountInfo(true);
        console.log("Completed Account Info");
      }
      if (user?.menu && user.menu.length > 0) {
        setCompletedMenu(true);
        console.log("Completed Menu");
      }
      if (user?.acceptedTerms) {
        setCompletedTerms(true);
        console.log("Completed Terms");
      }
    }, [user])
  );

  const handleSignUp = () => {
    if (completedAccountInfo && completedMenu && completedTerms) {
      router.push("/vendor");
    } else {
      alert("Please complete all steps before signing up.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/mnchLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.triageContainer}>
        <Text style={styles.header}>Easy as 1-2-3!</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            router.push("/vendor/otherScreens/vendorEditAccountScreen")
          }
        >
          <View
            style={[
              styles.rowCompletedBox,
              { backgroundColor: completedAccountInfo ? "#4CAF50" : "white" },
            ]}
          >
            {completedAccountInfo && (
              <FontAwesome name="check" size={24} color="white" />
            )}
          </View>

          <View style={styles.rowTextContainer}>
            <Text style={styles.rowText}>Add Account Details</Text>
            <Text style={styles.rowSubText}>
              Tell your customers more about you! Add your logo, description,
              and more
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            router.push("/vendor/otherScreens/vendorEditMenuScreen")
          }
        >
          <View
            style={[
              styles.rowCompletedBox,
              { backgroundColor: completedMenu ? "#4CAF50" : "white" },
            ]}
          >
            {completedMenu && (
              <FontAwesome name="check" size={24} color="white" />
            )}
          </View>
          <View style={styles.rowTextContainer}>
            <Text style={styles.rowText}>Add Menu Items</Text>
            <Text style={styles.rowSubText}>
              Give your customers a taste of what you have to offer!
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push("/sharedScreens/termsAndServiceScreen")}
        >
          <View
            style={[
              styles.rowCompletedBox,
              { backgroundColor: completedTerms ? "#4CAF50" : "white" },
            ]}
          >
            {completedTerms && (
              <FontAwesome name="check" size={24} color="white" />
            )}
          </View>{" "}
          <View style={styles.rowTextContainer}>
            <Text style={styles.rowText}>Terms and Conditions</Text>
            <Text style={styles.rowSubText}>
              Read our terms and conditions before you start selling
            </Text>
          </View>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.buttonContainer} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: munchColors.primary,
    padding: 16,
    justifyContent: "center",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "white",
  },
  row: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: munchStyles.smallRadius,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 100,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  rowText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  buttonContainer: {
    marginTop: 32,
    alignItems: "center",
    backgroundColor: "white",
    height: 50,
    borderRadius: munchStyles.smallRadius,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: munchColors.primary,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 200,
  },
  triageContainer: {},
  rowSubText: {
    color: "#666",
    fontSize: 12,
  },
  rowCompletedBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: munchColors.primary,
    marginRight: 16,
    borderColor: "black",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  rowTextContainer: {
    flex: 1,
  },
});
