// app/index.tsx
import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./auth/LoginScreen";
import { Auth } from "firebase/auth";
import { onAuthStateChange } from "@/services/auth";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Login" }}
      />
    </Stack.Navigator>
  );
}

function SplashScreen() {
  return (
    <div>
      <h1>Loading...</h1>
    </div>
  );
}
