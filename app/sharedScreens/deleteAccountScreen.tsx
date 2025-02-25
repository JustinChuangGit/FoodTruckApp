import React from "react";
import { View, Text, Button, Alert } from "react-native";
import { deleteDoc, doc } from "firebase/firestore";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { auth } from "@/services/auth";
import { db } from "@/services/firestore";
import { selectUser, clearUser } from "@/redux/authSlice";

const DeleteAccountScreen: React.FC = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const router = useRouter();

  const confirmDelete = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: handleDeleteAccount,
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "No user is currently logged in.");
      return;
    }

    try {
      // 1. Delete the Firestore document
      if (user.isVendor) {
        await deleteDoc(doc(db, "vendors", user.uid));
      } else {
        await deleteDoc(doc(db, "users", user.uid));
      }
      console.log("Firestore document deleted successfully.");

      // 2. Delete the Auth account
      if (auth.currentUser) {
        await auth.currentUser.delete();
        console.log("Auth record deleted successfully.");
      }

      // 3. Clear Redux state and navigate to login or home
      dispatch(clearUser());
      Alert.alert(
        "Account Deleted",
        "Your account has been deleted successfully."
      );
      router.replace("/auth/LoginScreen");
      // or router.push("/SignInScreen");
      // depending on your routing setup
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Reauthentication Required",
          "Please log in again to delete your account."
        );
      } else {
        Alert.alert(
          "Error",
          "There was an error deleting your account. Please try again later."
        );
      }
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ marginBottom: 20 }}>Delete Account Screen</Text>
      <Button title="Delete My Account" color="red" onPress={confirmDelete} />
    </View>
  );
};

export default DeleteAccountScreen;
