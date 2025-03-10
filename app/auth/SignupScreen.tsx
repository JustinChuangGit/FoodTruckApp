import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Switch,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { signUp } from "../../services/auth";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { munchColors } from "@/constants/Colors";
import { munchStyles } from "@/constants/styles";
import HorizontalLine from "@/components/default/HorizontalLine";
import { ScrollView } from "react-native-gesture-handler";
import { ref } from "firebase/storage";

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVendor, setIsVendor] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mailingAddress, setMailingAddress] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match!");
      return;
    }
    try {
      const accountCreated = new Date().toLocaleString();
      const user = await signUp(
        dispatch,
        email,
        password,
        isVendor,
        name,
        phone,
        mailingAddress,
        accountCreated,
        referralCode
      );
      router.replace(
        isVendor ? "/vendor/otherScreens/vendorSignupTriageScreen" : "/user"
      );
    } catch (error) {
      Alert.alert("Sign Up Failed", (error as Error).message);
    }
  };
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
      <ScrollView
        scrollEnabled={isKeyboardVisible}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.inner}>
          <View style={styles.inputContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>Sign Up</Text>
              <HorizontalLine />
            </View>

            {/* Name Input */}
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#A9A9A9"
              value={name}
              onChangeText={setName}
            />

            {/* Email Input */}
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
              placeholder="Phone"
              placeholderTextColor="#A9A9A9"
              autoCapitalize="none"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {/* Password Input */}
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A9A9A9"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Confirm Password Input */}
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#A9A9A9"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="Referral Code (Optional)"
              placeholderTextColor="#A9A9A9"
              value={referralCode}
              onChangeText={setReferralCode}
            />

            {/* Vendor Toggle */}
            <View style={styles.vendorToggle}>
              <Text style={styles.label}>Are you a vendor?</Text>
              <Switch
                value={isVendor}
                onValueChange={setIsVendor}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isVendor ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>

            {isVendor && (
              <TextInput
                style={styles.input}
                placeholder="Mailing Address"
                placeholderTextColor="#A9A9A9"
                value={mailingAddress}
                onChangeText={setMailingAddress}
              />
            )}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.button,
                { marginTop: isVendor ? 26 : 90 }, // Dynamically set marginTop
              ]}
              onPress={handleSignUp}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Back to Login Button */}
            <TouchableOpacity
              onPress={() => {
                router.replace("/auth/LoginScreen");
              }}
              style={styles.backToLoginButton}
            >
              <Text style={styles.linkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: "flex-end",
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
  header: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    paddingTop: 10,
    textAlign: "center",
  },
  input: {
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: munchStyles.smallRadius,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  vendorToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "black",
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
  },
  backToLoginButton: {
    marginBottom: 20,
  },
  headerContainer: {
    marginBottom: 30,
  },
});
