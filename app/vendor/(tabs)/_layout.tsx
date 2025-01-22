import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { munchColors } from "@/constants/Colors";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: munchColors.primary }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="VendorScanScreen"
        options={{
          title: "Rewards",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="star" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="VendorAccountScreen"
        options={{
          title: "Account",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
