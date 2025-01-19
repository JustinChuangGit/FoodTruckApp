import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signIn } from "../../services/auth"; // Adjust the path if necessary
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { munchColors } from "@/constants/Colors";
import { munchStyles } from "@/constants/styles";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const user = await signIn(dispatch, email, password); // Pass dispatch
      console.log("User signed in:", user);

      // Redirect based on user type
      if (user?.isVendor) {
        router.replace("/vendor");
      } else {
        router.replace("/user");
      }
    } catch (error) {
      console.error("Login Failed:", error);
      Alert.alert("Login Failed", (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/munchLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A9A9A9"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A9A9A9"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.buttonContainer}>
          <Button title="Login" onPress={handleLogin} />
        </View>
        <Button
          title="Sign Up"
          onPress={() => {
            router.push("/auth/SignupScreen");
          }}
          color="gray"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: munchColors.primary, // Orange background
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 75,
  },
  logo: {
    width: 300,
    height: 300,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: munchStyles.borderRadius,
    borderTopRightRadius: munchStyles.borderRadius,
    padding: 24,
    elevation: 4, // Adds shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.1, // Shadow opacity
    shadowRadius: 4, // Shadow radius
  },
  input: {
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  buttonContainer: {
    marginBottom: 12,
  },
});
