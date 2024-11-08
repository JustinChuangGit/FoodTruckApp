// app/auth/LoginScreen.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const router = useRouter();
  return (
    <SafeAreaView className="flex-1 justify-center px-6 bg-gray-100">
      <Text className="text-3xl font-bold text-center mb-6 text-black">HELLO</Text>

    </SafeAreaView>
  );
}
