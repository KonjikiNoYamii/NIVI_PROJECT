import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import SantriBottomNavigator from "./SantriNavigator";
import ProfileScreen from "../pages/ProfileScreen";

const Drawer = createDrawerNavigator();

export default function SantriDrawer() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="Beranda" component={SantriBottomNavigator} />
      <Drawer.Screen name="Profil" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}
