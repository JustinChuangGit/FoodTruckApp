import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Button, Dimensions } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const cornerRadius = 25; // Corner rounding
const cornerLength = 60; // Corner length
const borderWidth = 10; // Line thickness

export default function VendorScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

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

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (isScanning.current) {
      // Prevent multiple scans
      return;
    }

    isScanning.current = true; // Lock scanning
    console.log("Scanned Data:", data);

    // Redirect to success screen
    router.push("/vendor/otherScreens/vendorScanSuccessScreen");

    // Optional: Unlock scanning after a delay (if needed)
    setTimeout(() => {
      isScanning.current = false;
    }, 3000); // 3 seconds delay
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
