// app/auth/LoginScreen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signIn } from "../../services/auth"; // Adjust the path if necessary
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";

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
        router.replace("/vendor/VendorHomeScreen");
      } else {
        router.replace("/user/UserHomeScreen");
      }
    } catch (error) {
      console.error("Login Failed:", error);
      Alert.alert("Login Failed", (error as Error).message);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center px-6 bg-gray-100">
      <Text className="text-3xl font-bold text-center mb-6 text-black">
        Login
      </Text>

      {/* Username Input */}
      <TextInput
        className="h-12 border border-gray-400 rounded mb-4 px-3 bg-white"
        placeholder="Email"
        placeholderTextColor="#A9A9A9"
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

      {/* Login Button */}
      <View className="mb-3">
        <Button title="Login" onPress={handleLogin} />
      </View>

      {/* Sign Up Button */}
      <Button
        title="Sign Up"
        onPress={() => {
          router.push("/auth/SignupScreen");
        }}
        color="gray"
      />
    </SafeAreaView>
  );
}
