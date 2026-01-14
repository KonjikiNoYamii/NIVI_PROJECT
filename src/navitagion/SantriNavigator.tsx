import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import DashboardSantri from '../pages/DashboardSantri';
import TaskScreen from '../pages/TaskScreen';
import AttendanceScreen from '../pages/AttendanceScreen';
import ProfileScreen from '../pages/ProfileScreen';
import AdminNavigator from './AdminNavigator';

const Tab = createBottomTabNavigator();

const SantriNavigator = () => {
  const isAdmin = true; // Ganti dengan logic autentikasi

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#ecf0f1',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tugas') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Absen') {
            iconName = focused ? 'calendar-check' : 'calendar-check-outline';
          } else if (route.name === 'AdminPanel') {
            iconName = focused ? 'shield-account' : 'shield-account-outline';
            size = 26;
          } else if (route.name === 'Profil') {
            iconName = focused ? 'account' : 'account-outline';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardSantri}
        options={{ title: 'Beranda' }}
      />
      
      <Tab.Screen 
        name="Tugas" 
        component={TaskScreen}
        options={{ title: 'Tugas' }}
      />
      
      <Tab.Screen 
        name="Absen" 
        component={AttendanceScreen}
        options={{ title: 'Absen' }}
      />
      
      {/* Hanya tampilkan jika user adalah admin */}
      {isAdmin && (
        <Tab.Screen 
          name="AdminPanel" 
          component={AdminNavigator}
          options={{ 
            title: 'Admin',
            tabBarBadge: '⚙️', // Emoji badge
          }}
        />
      )}
      
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

export default SantriNavigator;