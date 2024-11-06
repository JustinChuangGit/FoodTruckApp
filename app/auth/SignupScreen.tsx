// app/auth/SignupScreen.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 justify-center px-6 bg-gray-100">
            <Text className="text-3xl font-bold text-center mb-6 text-black">Sign Up</Text>

            {/* Email Input */}
            <TextInput
                className="h-12 border border-gray-400 rounded mb-4 px-3 bg-white"
                placeholder="Email"
                placeholderTextColor="#A9A9A9" // Light gray placeholder color
                autoCapitalize="none"
                keyboardType="email-address"
            />

            {/* Password Input */}
            <TextInput
                className="h-12 border border-gray-400 rounded mb-4 px-3 bg-white"
                placeholder="Password"
                placeholderTextColor="#A9A9A9"
                secureTextEntry
            />

            {/* Confirm Password Input */}
            <TextInput
                className="h-12 border border-gray-400 rounded mb-4 px-3 bg-white"
                placeholder="Confirm Password"
                placeholderTextColor="#A9A9A9"
                secureTextEntry
            />

            {/* Sign Up Button */}
            <View className="mb-3">
                <Button
                    title="Sign Up"
                    onPress={() => {
                        // Uncomment and replace with actual signup function later
                    }}
                />
            </View>

            {/* Back to Login Button */}
            <Button
                title="Back to Login"
                onPress={() => {
                    router.replace('/auth/LoginScreen'); // Use replace to prevent back navigation to signup screen
                }}
                color="gray"
            />
        </SafeAreaView>
    );
}
