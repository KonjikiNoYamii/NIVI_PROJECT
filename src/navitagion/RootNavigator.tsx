import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import AuthGate from "./AuthGate";
import LoginScreen from "../pages/LoginScreen";

import SantriDrawer from "./SantriDrawer";
import PengajarDrawer from "./PengajarDrawer";
import AdminDrawer from "./AdminDrawer";
import ActivateAccountScreen from "../pages/ActivateAccountScreen";
import ForgotPasswordScreen from "../pages/ForgotPassword";
import ResetPasswordScreen from "../pages/ResetPassword";
import NilaiTugasScreen from "../pages/pengajar/NilaiTugasScreen";
import TugasArsipScreen from "../pages/santri/TugasArsipScreen";

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthGate" component={AuthGate} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ActivateAccount" component={ActivateAccountScreen}/>
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen}/>
        <Stack.Screen name="SantriApp" component={SantriDrawer} />
        <Stack.Screen name="PengajarApp" component={PengajarDrawer} />
        <Stack.Screen name="AdminApp" component={AdminDrawer} />
        <Stack.Screen name="Nilai" component={NilaiTugasScreen}/>
        <Stack.Screen name="ArsipTugas" component={TugasArsipScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
