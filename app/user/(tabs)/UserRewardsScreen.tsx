import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Vibration,
  SafeAreaView,
  TouchableOpacity,
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
import * as Progress from "react-native-progress";

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

  const handlePaypalPress = () => {
    if ((user?.rewardPoints ?? 0) < 1000) {
      Alert.alert(
        "Not enough points",
        "You need at least 1000 points to redeem."
      );
      return;
    }

    // If the user has 1000+ points, show the "Feature coming soon" message
    Alert.alert(
      "Keep earning points!",
      "This feature is coming soon\ntry again later!"
    );
  };

  console.log("referralCode: ", user?.referralCode);

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
        <TouchableOpacity
          onPress={handlePaypalPress}
          style={styles.paypalContainer}
        >
          {/* <Image
            source={require("@/assets/images/paypal.png")}
            style={styles.paypalImage}
          /> */}
          <View style={styles.paypalInnerContainer}>
            <View style={styles.progressBarTopPointsContainer}>
              <Text style={styles.progressBarTopPointsText}>0</Text>
              <Text style={styles.progressBarTopPointsText}>1k</Text>
            </View>
            <Progress.Bar
              progress={Math.min(rewardPoints / 1000, 1)}
              width={150} // Adjust width as needed
              height={10}
              color={munchColors.primary} // Gold color for rewards
              borderRadius={5}
              unfilledColor="#e0e0e0"
              style={{ marginBottom: 5 }}
            />
            <Text style={styles.rewardPointsSubtitle}>Redeem $10</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.earnRewardsOtherWaysContainer}>
        <Text style={styles.subtitle}>Earn More Rewards</Text>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              `Share your referral code: \n${
                user?.referralCode ||
                "Hmm. Something went wrong. Please contact us"
              }`
            )
          }
          style={styles.earnMoreRewardsItem}
        >
          <View>
            <Text style={styles.earnMoreRewardsItemTitle}>Invite Friends</Text>
            <Text style={styles.earnMoreRewardsItemSubtitle}>
              You get points they get points
            </Text>
          </View>
          <View style={styles.earnMoreRewardsItemRewardContainer}>
            <Text style={styles.earnMoreRewardsItemValue}>50</Text>
            <Text style={styles.earnMoreRewardsItemPointsText}>Points</Text>
          </View>
        </TouchableOpacity>
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
    flexDirection: "row",
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
    alignItems: "center",
  },
  rewardsPointsSubContainer: {
    height: 100,
    justifyContent: "center",
    paddingLeft: 20,
    paddingRight: 20,
    borderRightWidth: 1, // Adjust thickness
    borderRightColor: "#e0e0e0", // Gold color for the border
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
    flexDirection: "row",
    paddingVertical: 20,
    flex: 1,
  },
  paypalImage: {
    width: 80,
    height: 80,
    marginVertical: "auto",
  },
  paypalInnerContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    marginHorizontal: "auto",
  },
  progressBarTopPointsText: {
    color: "#999",
    fontWeight: "bold",
    fontSize: 15,
    paddingBottom: 5,
  },
  progressBarTopPointsContainer: {
    width: 175,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  earnRewardsOtherWaysContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: "center",
  },
  earnMoreRewardsItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    width: "90%",
    borderRadius: munchStyles.smallRadius,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 100,
  },

  earnMoreRewardsItemValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  earnMoreRewardsItemPointsText: {
    fontSize: 20,
    color: "#888",
    justifyContent: "center",
  },
  earnMoreRewardsItemRewardContainer: {
    alignItems: "center",
  },
  earnMoreRewardsItemTitle: {
    fontSize: 25,
    color: "#333",
  },
  earnMoreRewardsItemSubtitle: {
    fontSize: 15,
    color: "#666",
  },
});
