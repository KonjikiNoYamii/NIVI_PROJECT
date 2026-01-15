import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import AuthGate from "./AuthGate";
import LoginScreen from "../pages/LoginScreen";

import SantriDrawer from "./SantriDrawer";
import PengajarDrawer from "./PengajarDrawer";
import AdminDrawer from "./AdminDrawer";
import ActivateAccountScreen from "../pages/ActivateAccountScreen";
import ActivateRequestScreen from "../pages/ActivateRequestScreen";
import { StyleSheet } from "react-native";

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthGate" component={AuthGate} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ActivateRequest" component={ActivateRequestScreen}/>
        <Stack.Screen name="ActivateAccount" component={ActivateAccountScreen}/>
        <Stack.Screen name="SantriApp" component={SantriDrawer} />
        <Stack.Screen name="PengajarApp" component={PengajarDrawer} />
        <Stack.Screen name="AdminApp" component={AdminDrawer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    paddingBottom: 10,
    paddingTop: 5,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  adminTabButton: {
    top: -15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
  },
  adminButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});