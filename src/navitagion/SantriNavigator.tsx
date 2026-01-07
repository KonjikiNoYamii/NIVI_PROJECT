import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import DashboardSantri from "../pages/DashboardSantri";
import TaskScreen from "../pages/TaskScreen";
import AttendanceScreen from "../pages/AttendanceScreen";
import ProfileScreen from "../pages/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function SantriBottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardSantri}
        options={{ title: "Home" }}
      />
      <Tab.Screen name="Tugas" component={TaskScreen} />
      <Tab.Screen name="Absen" component={AttendanceScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
