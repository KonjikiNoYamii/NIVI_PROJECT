import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import AuthGate from "./AuthGate";
import LoginScreen from "../pages/LoginScreen";

import SantriDrawer from "./SantriDrawer";
import PengajarDrawer from "./PengajarDrawer";
import AdminDrawer from "./AdminDrawer";
import ActivateAccountScreen from "../pages/admin/ActivateAccountScreen";

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthGate" component={AuthGate} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SantriApp" component={SantriDrawer} />
        <Stack.Screen name="PengajarApp" component={PengajarDrawer} />
        <Stack.Screen name="AdminApp" component={AdminDrawer} />
        <Stack.Screen name="ActivateAccount" component={ActivateAccountScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
