import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardSantri from '../pages/santri/DashboardSantri';
import TaskScreen from '../pages/santri/TaskScreen';
import ProfileScreen from '../pages/ProfileScreen';
import AttendanceSantriScreen from '../pages/santri/AttendanceSantriScreen';

const Tab = createBottomTabNavigator();

export default function SantriBottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardSantri}
        options={{ title: 'Home' }}
      />
      <Tab.Screen name="Tugas" component={TaskScreen} />
      <Tab.Screen name="Absen" component={AttendanceSantriScreen} />
    </Tab.Navigator>
  );
}
