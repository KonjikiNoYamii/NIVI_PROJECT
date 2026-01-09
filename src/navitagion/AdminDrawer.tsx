import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AdminPanel from "../pages/AdminPanel";

const Drawer = createDrawerNavigator();

export default function AdminDrawer() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="Admin Panel" component={AdminPanel} />
    </Drawer.Navigator>
  );
}
