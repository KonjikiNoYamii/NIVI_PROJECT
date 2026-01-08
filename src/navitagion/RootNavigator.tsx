import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../pages/LoginScreen';
import AuthGate from './AuthGate';

import AppDrawer from './DrawerNavigator';

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
<NavigationContainer>
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AuthGate" component={AuthGate} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="App" component={AppDrawer} />
  </Stack.Navigator>
</NavigationContainer>

  );
}
