import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { auth } from "@/services/auth";
import { db } from "@/services/firestore";
import { selectUser, clearUser } from "@/redux/authSlice";
import { FontAwesome } from "@expo/vector-icons";

export default function DeleteAccountScreen() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const router = useRouter();

  // Pre-fill email with the current user's email, if available
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");

  const reauthenticateUser = async (email: string, password: string) => {
    if (!auth.currentUser)
      throw new Error("No authenticated user to reauthenticate.");
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
  };

  const handleDeleteAccount = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "No user is currently logged in.");
      return;
    }

    // Optional: If you only want to handle blank passwords upfront:
    if (!inputPassword.trim()) {
      Alert.alert("Error", "Please enter your password.");
      return;
    }

    try {
      // 1. Reauthenticate the user
      await reauthenticateUser(inputEmail, inputPassword);
      console.log("User reauthenticated successfully.");

      // 2. Delete the Firestore document
      if (user.isVendor) {
        await deleteDoc(doc(db, "vendors", user.uid));
      } else {
        await deleteDoc(doc(db, "users", user.uid));
      }
      console.log("Firestore document deleted successfully.");

      // 3. Delete the Auth account
      if (auth.currentUser) {
        await auth.currentUser.delete();
        console.log("Auth record deleted successfully.");
      }

      // 4. Clear Redux state and navigate
      dispatch(clearUser());
      Alert.alert(
        "Account Deleted",
        "Your account has been deleted successfully."
      );
      router.replace("/auth/LoginScreen"); // Or whichever route you prefer
    } catch (error: any) {
      // Log the full error to see what's actually happening
      console.error("Error deleting account:", error);
      console.log("Error code:", error.code);
      console.log("Error message:", error.message);

      if (error.code === "auth/wrong-password") {
        Alert.alert(
          "Invalid Password",
          "Please check your password and try again."
        );
      } else if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Reauthentication Required",
          "Please sign in again to delete your account."
        );
      } else if (error.code === "auth/invalid-credential") {
        Alert.alert(
          "Error",
          "Invalid credentials provided. Please check your email and password."
        );
      } else {
        Alert.alert(
          "Error",
          "Could not delete your account. Please try again later."
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome
            name="chevron-left"
            size={30}
            style={styles.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Delete Account</Text>
      </View>

      {/* Explanation */}
      <View style={styles.explanationContainer}>
        <Text style={styles.explanationText}>
          Deleting your account is permanent and will remove all associated
          data. Please re-enter your email and password to confirm.
        </Text>
      </View>

      {/* Email + Password Inputs */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={inputEmail}
          autoCapitalize="none"
          onChangeText={(text) => setInputEmail(text)}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={inputPassword}
          secureTextEntry
          onChangeText={(text) => setInputPassword(text)}
          placeholderTextColor="#999"
        />
      </View>

      <Button
        title="Delete My Account"
        color="red"
        onPress={handleDeleteAccount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: { marginRight: 10 },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  explanationContainer: {
    padding: 20,
  },
  explanationText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
});
