import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Alert, Vibration } from "react-native";
import { useSelector } from "react-redux";
import QRCode from "react-native-qrcode-svg";
import { selectUser } from "@/redux/authSlice";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firestore";
import ConfettiCannon from "react-native-confetti-cannon";
import { Audio } from "expo-av";

export default function UserRewardsScreen() {
  const user = useSelector(selectUser);
  const [rewardPoints, setRewardPoints] = useState<number>(0);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const confettiRef = useRef(null);
  const userUID = user?.uid || "default-uid";

  useEffect(() => {
    if (!userUID) {
      // Prevent Alert when user signs out
      console.warn("No valid user UID. Listener will not be set up.");
      return;
    }

    const userDocRef = doc(db, "users", userUID);
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const points = data.rewardPoints || 0;

        // Trigger confetti, sound, and vibration if reward points increase
        if (points > rewardPoints) {
          setConfettiVisible(true);
          playSound();
          Vibration.vibrate(500); // Vibrate for 500ms
        }

        setRewardPoints(points);
      } else {
        console.warn("User document does not exist in Firestore.");
      }
    });

    // Cleanup the listener when the component unmounts or userUID changes
    return () => unsubscribe();
  }, [userUID, rewardPoints]);

  // Function to play a sound
  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/scanSuccess.mp3") // Replace with the path to your sound file
    );
    await sound.playAsync();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rewards</Text>
      <Text style={styles.subtitle}>
        Show this QR code to earn rewards or access features.
      </Text>
      <QRCode
        value={userUID}
        size={200}
        color="black"
        backgroundColor="white"
      />
      <Text style={styles.rewardPoints}>Reward Points: {rewardPoints}</Text>

      {/* Confetti animation */}
      {confettiVisible && (
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
          onAnimationEnd={() => setConfettiVisible(false)} // Hide confetti after animation
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  rewardPoints: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    color: "#4CAF50",
  },
});
