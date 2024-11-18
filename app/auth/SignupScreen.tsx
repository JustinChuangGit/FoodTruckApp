// app/auth/SignupScreen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signUp } from "../../services/auth.js"; // Adjust the path if necessary

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match!");
      return;
    }
    try {
      const user = await signUp(email, password);
      console.log("User signed up:", user);
      router.replace("../user"); // Correctly navigates to the /user route
    } catch (error) {
      Alert.alert("Sign Up Failed", (error as Error).message);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center px-6 bg-gray-100">
      <Text className="text-3xl font-bold text-center mb-6 text-black">
        Sign Up
      </Text>

      {/* Email Input */}
      <TextInput
        className="h-12 border border-gray-400 rounded mb-4 px-3 bg-white"
        placeholder="Email"
        placeholderTextColor="#A9A9A9" // Light gray placeholder color
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <TextInput
        className="h-12 border border-gray-400 rounded mb-4 px-3 bg-white"
        placeholder="Password"
        placeholderTextColor="#A9A9A9"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Confirm Password Input */}
      <TextInput
        className="h-12 border border-gray-400 rounded mb-4 px-3 bg-white"
        placeholder="Confirm Password"
        placeholderTextColor="#A9A9A9"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Sign Up Button */}
      <View className="mb-3">
        <Button title="Sign Up" onPress={handleSignUp} />
      </View>

      {/* Back to Login Button */}
      <Button
        title="Back to Login"
        onPress={() => {
          router.replace("/auth/LoginScreen"); // Use replace to prevent back navigation to signup screen
        }}
        color="gray"
      />
    </SafeAreaView>
  );
}
