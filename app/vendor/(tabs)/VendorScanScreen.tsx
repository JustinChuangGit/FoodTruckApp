import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Dimensions,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { db } from "@/services/firestore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { selectUser } from "@/redux/authSlice"; // Update the path as needed
import { useSelector } from "react-redux";
const { width } = Dimensions.get("window");

const cornerRadius = 25;
const cornerLength = 60;
const borderWidth = 10;

export default function VendorScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const vendorUid = user?.uid;
  const vendorType = user?.vendorType;
  const latitude = user?.latitude;
  const longitude = user?.longitude;

  // Lock to prevent multiple scans
  const isScanning = useRef(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to access the camera.
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (isScanning.current) {
      return; // Prevent multiple scans
    }

    isScanning.current = true;

    try {
      console.log("Scanned Data:", data);

      if (!vendorUid) {
        Alert.alert(
          "Error",
          "Your vendor UID is missing. Please log out and log back in."
        );
        isScanning.current = false;
        return;
      }

      // Check if the UID exists in the users collection
      const userDocRef = doc(db, "users", data);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        Alert.alert("Error", "User not found. Please try again.");
        isScanning.current = false;
        return;
      }

      // Log transaction in the user's collection
      const timestamp = new Date().toISOString();
      const transactionID = `${vendorUid}_${timestamp}`;
      const transactionData = {
        vendorType: vendorType || "Unknown Vendor Type", // Default fallback
        latitude: latitude || "Unknown Latitude", // Replace with vendor's location dynamically
        longitude: longitude || "Unknown Longitude", // Replace with vendor's location dynamically
        date: timestamp,
      };

      await setDoc(
        doc(db, "users", data, "transactions", transactionID),
        transactionData
      );

      // Log transaction in the vendor's collection
      const vendorTransactionID = `${data}_${timestamp}`;
      const vendorTransactionData = {
        latitude: latitude || "Unknown Latitude", // Replace with vendor's location dynamically
        longitude: longitude || "Unknown Longitude", // Replace with vendor's location dynamically
        date: timestamp,
      };

      await setDoc(
        doc(db, "vendors", vendorUid, "transactions", vendorTransactionID),
        vendorTransactionData
      );

      // Redirect to the success screen
      router.push("/vendor/otherScreens/vendorScanSuccessScreen");
    } catch (error) {
      console.error("Error processing scan:", error);
      Alert.alert(
        "Error",
        "An error occurred while processing the scan. Please try again."
      );
    } finally {
      // Release the scanning lock after a delay
      setTimeout(() => {
        isScanning.current = false;
      }, 3000); // 3-second delay
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Scan Customer QR Code</Text>
        <View style={styles.boundingBox}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    textAlign: "center",
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom: 350,
  },
  boundingBox: {
    width: width * 0.6,
    height: width * 0.6,
    position: "absolute",
  },
  corner: {
    position: "absolute",
    width: cornerLength,
    height: cornerLength,
    borderColor: "white",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderLeftWidth: borderWidth,
    borderTopWidth: borderWidth,
    borderTopLeftRadius: cornerRadius,
  },
  topRight: {
    top: 0,
    right: 0,
    borderRightWidth: borderWidth,
    borderTopWidth: borderWidth,
    borderTopRightRadius: cornerRadius,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderLeftWidth: borderWidth,
    borderBottomWidth: borderWidth,
    borderBottomLeftRadius: cornerRadius,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderRightWidth: borderWidth,
    borderBottomWidth: borderWidth,
    borderBottomRightRadius: cornerRadius,
  },
});
