// sharedScreens/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function SharedScreensLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="signInAndSecurityScreen"
        options={{
          title: "Sign In and Security",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="termsAndServiceScreen"
        options={{
          title: "Terms of Service",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reportBugScreen"
        options={{
          title: "Report A Bug",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="userVendorInfo"
        options={{
          title: "User Vendor Info",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="createNewEventScreen"
        options={{
          title: "Create New Event",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="eventDetailsScreen"
        options={{
          title: "Event Details",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
