// app/auth/LoginScreen.tsx
import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function LoginScreen() {
  return (
    <View className="flex-1 justify-center px-6 bg-gray-100">
      <Text className="text-3xl font-bold text-center mb-6 text-black">Login</Text>

      {/* Username Input */}
      <TextInput
        className="h-12 border border-gray-400 rounded mb-4 px-3 bg-white"
        placeholder="Username"
        placeholderTextColor="#A9A9A9" // Light gray placeholder color
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        className="h-12 border border-gray-400 rounded mb-4 px-3 bg-white"
        placeholder="Password"
        placeholderTextColor="#A9A9A9"
        secureTextEntry
      />

      {/* Login Button */}
      <View className="mb-3">
        <Button
          title="Login"
          onPress={() => {
            // Uncomment and replace with actual login function later
          }}
        />
      </View>

      {/* Sign Up Button */}
      <Button
        title="Sign Up"
        onPress={() => {
          // Uncomment and replace with actual sign-up function later
          // navigateToSignUp();
        }}
        color="gray"
      />
    </View>
  );
}
