import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Vibration,
  SafeAreaView,
  Image,
} from "react-native";
import { useSelector } from "react-redux";
import QRCode from "react-native-qrcode-svg";
import { selectUser } from "@/redux/authSlice";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firestore";
import ConfettiCannon from "react-native-confetti-cannon";
import { Audio } from "expo-av";
import { munchStyles } from "@/constants/styles";
import { FontAwesome } from "@expo/vector-icons";
import { munchColors } from "@/constants/Colors";

export default function UserRewardsScreen() {
  const user = useSelector(selectUser);
  const [rewardPoints, setRewardPoints] = useState<number>(
    user?.rewardPoints || 0
  );
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
      {/* Header */}

      <SafeAreaView style={styles.qrCodeBackground}>
        <View style={styles.qrCodeContainer}>
          <QRCode
            value={userUID}
            size={200}
            color="black"
            backgroundColor="white"
          />
        </View>
        {/* <Text style={styles.title}>Scan to Earn Rewards</Text> */}
      </SafeAreaView>
      <View style={styles.rewardsPointsContainer}>
        <View style={styles.rewardsPointsSubContainer}>
          <View style={styles.rewardsPointsSubSubContainer}>
            <Text style={styles.rewardPoints}>{rewardPoints}</Text>
            <FontAwesome
              name="star"
              size={35}
              color="#FFD700"
              style={{ marginLeft: 5 }}
            />
          </View>
          <Text style={styles.rewardPointsSubtitle}>Reward Points</Text>
        </View>
        <View>
          <Image
            source={require("@/assets/images/paypal.png")}
            style={styles.paypalImage}
          />
          <View style={styles.paypalInnerContainer}>
            {/* <Text style={styles.rewardPointsSubtitle}>Redeem For Cash</Text> */}
          </View>
        </View>
      </View>

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
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 125,
    marginTop: 30,
    color: "#FFF",
  },
  subtitle: {
    fontSize: 24,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  rewardPoints: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  rewardPointsSubtitle: {
    fontSize: 18,
    color: "#888",
  },
  qrCodeContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    width: 300,
    backgroundColor: "#f0f0f0",
    borderRadius: munchStyles.cardRadius,
    elevation: 10,
    shadowColor: "#000",
    marginHorizontal: "auto",
    marginTop: 20,
    marginBottom: 100,
  },
  rewardsPointsContainer: {
    height: 125,
    width: 360,
    backgroundColor: "#f0f0f0",
    borderRadius: munchStyles.smallRadius,
    elevation: 10,
    shadowColor: "#000",
    marginHorizontal: "auto",
    marginTop: -90,
    display: "flex",
    flexDirection: "row",
  },
  rewardsPointsSubContainer: {
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  rewardsPointsSubSubContainer: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "center",
  },
  qrCodeBackground: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: munchColors.primary,
  },
  paypalContainer: {
    height: 150,
    justifyContent: "center",
    width: "100%",
    flexDirection: "row",
    paddingVertical: 20,
    alignContent: "space-between",
  },
  paypalImage: {
    width: 100,
    height: 100,
    marginHorizontal: 20,
    marginVertical: "auto",
  },
  paypalInnerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
