import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import DashboardSantri from '../pages/santri/DashboardSantri';
import TaskScreen from '../pages/santri/TaskScreen';
import AttendanceSantriScreen from '../pages/santri/AttendanceSantriScreen';
import { Icon } from 'react-native-elements';

const Tab = createBottomTabNavigator();

export default function SantriBottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 0,
          paddingTop: 10,
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          borderRadius: 20,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          borderWidth: 1,
          borderColor: '#f1f5f9',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 6,
        },
        tabBarItemStyle: {
          height: 70,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardSantri}
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ focused, color, size }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <Icon
                name="home"
                type="font-awesome"
                size={focused ? 20 : 18}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Tugas"
        component={TaskScreen}
        options={{
          tabBarLabel: 'Tugas',
          tabBarIcon: ({ focused, color, size }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <Icon
                name="tasks"
                type="font-awesome"
                size={focused ? 20 : 18}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Absen"
        component={AttendanceSantriScreen}
        options={{
          tabBarLabel: 'Absensi',
          tabBarIcon: ({ focused, color, size }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <Icon
                name="calendar"
                type="font-awesome"
                size={focused ? 20 : 18}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#ebf5fb',
  },
});