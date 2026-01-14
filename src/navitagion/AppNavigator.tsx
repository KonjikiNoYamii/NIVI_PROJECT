import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import navigator
import SantriNavigator from './SantriNavigator';
import AdminNavigator from './AdminNavigator';

// Import screens
import DashboardSantri from '../pages/DashboardSantri';
import TaskScreen from '../pages/TaskScreen';
import AttendanceScreen from '../pages/AttendanceScreen';
import ProfileScreen from '../pages/ProfileScreen';

// Import custom tab bar
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack untuk user biasa (santri)
const UserStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={SantriNavigator} />
    </Stack.Navigator>
  );
};

// Main App Navigator dengan tabs
const AppNavigator = () => {
  const isAdmin = true; // Ganti dengan logic autentikasi dari context/async storage

  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: 'flex',
          },
        }}
      >
        {/* Tab untuk semua user */}
        <Tab.Screen 
          name="Home" 
          component={UserStack}
          options={{
            tabBarLabel: 'Beranda',
          }}
        />
        
        <Tab.Screen 
          name="Tugas" 
          component={TaskScreen}
          options={{
            tabBarLabel: 'Tugas',
          }}
        />
        
        <Tab.Screen 
          name="Absen" 
          component={AttendanceScreen}
          options={{
            tabBarLabel: 'Absen',
          }}
        />
        
        {/* Tab hanya untuk admin */}
        {isAdmin && (
          <Tab.Screen 
            name="Admin" 
            component={AdminNavigator}
            options={{
              tabBarLabel: 'Admin',
            }}
          />
        )}
        
        <Tab.Screen 
          name="Profil" 
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profil',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;