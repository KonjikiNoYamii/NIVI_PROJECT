import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardAdmin from '../pages/admin/AdminDashboard';
import CreateSantriScreen from '../pages/admin/CreateSantri';

const Tab = createBottomTabNavigator();

export default function AdminBottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="AdminDashboard" component={DashboardAdmin} />
      <Tab.Screen name='CreateSantriScreen' component={CreateSantriScreen}/>
    </Tab.Navigator>
  );
}
