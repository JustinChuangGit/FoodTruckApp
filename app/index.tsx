// app/index.tsx
import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./auth/LoginScreen";
import { Provider } from "react-redux";
import { store } from "../redux/store";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Login" }}
        />
      </Stack.Navigator>
    </Provider>
  );
}

function SplashScreen() {
  return (
    <div>
      <h1>Loading...</h1>
    </div>
  );
}
