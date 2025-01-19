import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { signIn } from "../../services/auth";
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
      const user = await signIn(dispatch, email, password);
      console.log("User signed in:", user);

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/munchLogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.header}>Login</Text>
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
            <View style={styles.subInputContainer}>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  router.push("/auth/SignupScreen");
                }}
              >
                <Text style={styles.linkText}>Create an Account</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: munchColors.primary,
  },
  inner: {
    flex: 1,
  },
  logoContainer: {
    flexGrow: 1, // Push the inputContainer to the bottom
    alignItems: "center",
    marginBottom: 20,
    marginTop: 100,
  },
  logo: {
    width: 300,
    height: 300,
  },
  inputContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: munchStyles.cardRadius,
    borderTopRightRadius: munchStyles.cardRadius,
    padding: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: munchStyles.smallRadius,
    marginTop: 20,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 15,
    paddingTop: 10,
    textAlign: "center",
  },
  subInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 50,
  },
  button: {
    backgroundColor: munchColors.primary,
    paddingVertical: 15,
    borderRadius: munchStyles.smallRadius,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: "gray",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
});
