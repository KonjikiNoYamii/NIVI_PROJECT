import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import SantriBottomNavigator from "./SantriNavigator";
import DashboardPengajar from "../pages/DashboardPengajar";
import AdminPanel from "../pages/AdminPanel";

const Drawer = createDrawerNavigator();

export default function AppDrawer({ route }: any) {
  const initialRoute = route.params?.initialRoute || "Santri";

  return (
    <Drawer.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Santri" component={SantriBottomNavigator} />
      <Drawer.Screen name="Pengajar" component={DashboardPengajar} />
      <Drawer.Screen name="Admin" component={AdminPanel} />
    </Drawer.Navigator>
  );
}

