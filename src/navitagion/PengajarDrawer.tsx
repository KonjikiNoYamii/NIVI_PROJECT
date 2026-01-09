import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import PengajarBottomNavigator from "./PengajarNavigator";

const Drawer = createDrawerNavigator();

export default function PengajarDrawer() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="Dashboard" component={PengajarBottomNavigator} />
    </Drawer.Navigator>
  );
}
