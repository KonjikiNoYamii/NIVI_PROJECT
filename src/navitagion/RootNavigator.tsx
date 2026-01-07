import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../pages/LoginScreen';
import AuthGate from './AuthGate';
import DashboardPengajar from '../pages/DashboardPengajar';
import AdminPanel from '../pages/AdminPanel';
import SantriBottomNavigator from './SantriNavigator';

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AuthGate" component={AuthGate} />
        <Stack.Screen name="DashboardSantri" component={SantriBottomNavigator} />
        <Stack.Screen name="DashboardPengajar" component={DashboardPengajar} />
        <Stack.Screen name="AdminPanel" component={AdminPanel} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
