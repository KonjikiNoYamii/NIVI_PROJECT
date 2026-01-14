import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import navigators
import SantriNavigator from './SantriNavigator';
import AdminNavigator from './AdminNavigator';

// Import screens
import TaskScreen from '../pages/TaskScreen';
import AttendanceScreen from '../pages/AttendanceScreen';
import ProfileScreen from '../pages/ProfileScreen';

// Import Auth Context (jika ada)
// import { useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator();

// Custom tab bar button untuk admin (opsional FAB-style)
const AdminTabButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={styles.adminTabButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.adminButtonInner}>
      {children}
    </View>
  </TouchableOpacity>
);

// Custom tab bar dengan badge untuk admin
const CustomTabBarIcon = ({ route, focused, color, size }: any) => {
  let iconName = 'home';
  let badgeCount = 0;
  
  switch (route.name) {
    case 'Dashboard':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Tugas':
      iconName = focused ? 'book' : 'book-outline';
      break;
    case 'Absen':
      iconName = focused ? 'calendar-check' : 'calendar-check-outline';
      break;
    case 'Admin':
      iconName = focused ? 'shield-account' : 'shield-account-outline';
      size = 26;
      badgeCount = 3; // Contoh notifikasi
      break;
    case 'Profil':
      iconName = focused ? 'account' : 'account-outline';
      break;
    default:
      iconName = 'circle';
  }
  
  return (
    <View style={styles.iconContainer}>
      <Icon name={iconName} size={size} color={color} />
      
      {/* Badge untuk Admin */}
      {route.name === 'Admin' && badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const RootNavigator = () => {
  // Ganti dengan logic autentikasi yang sesungguhnya
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Contoh: cek role dari async storage atau context
  useEffect(() => {
    // Simulasi cek role
    // Di production, ambil dari AsyncStorage atau context
    const checkAdminRole = async () => {
      // Contoh: user dengan role 'admin' atau 'guru'
      const userRole = 'admin'; // Ganti dengan data sesungguhnya
      setIsAdmin(userRole === 'admin' || userRole === 'guru');
    };
    
    checkAdminRole();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#3498db',
          tabBarInactiveTintColor: '#7f8c8d',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIcon: ({ focused, color, size }) => (
            <CustomTabBarIcon 
              route={route} 
              focused={focused} 
              color={color} 
              size={size} 
            />
          ),
        })}
      >
        {/* Tab Dashboard - menggunakan SantriNavigator */}
        <Tab.Screen 
          name="Dashboard" 
          component={SantriNavigator}
          options={{ 
            title: 'Beranda',
            tabBarLabel: 'Beranda',
          }}
        />
        
        {/* Tab Tugas */}
        <Tab.Screen 
          name="Tugas" 
          component={TaskScreen}
          options={{ 
            title: 'Tugas',
            tabBarLabel: 'Tugas',
          }}
        />
        
        {/* Tab Absen */}
        <Tab.Screen 
          name="Absen" 
          component={AttendanceScreen}
          options={{ 
            title: 'Absen',
            tabBarLabel: 'Absen',
          }}
        />
        
        {/* Tab Admin - hanya tampil jika user adalah admin */}
        {isAdmin ? (
          <Tab.Screen 
            name="Admin" 
            component={AdminNavigator}
            options={{ 
              title: 'Admin',
              tabBarLabel: 'Admin',
              // Opsional: gunakan custom button untuk FAB-style
              // tabBarButton: (props) => (
              //   <AdminTabButton {...props} />
              // ),
            }}
          />
        ) : (
          // Jika bukan admin, sembunyikan tab atau tampilkan placeholder
          <Tab.Screen 
            name="AdminPlaceholder" 
            component={TaskScreen}
            options={{
              tabBarButton: () => null, // Sembunyikan tab
            }}
          />
        )}
        
        {/* Tab Profil */}
        <Tab.Screen 
          name="Profil" 
          component={ProfileScreen}
          options={{ 
            title: 'Profil',
            tabBarLabel: 'Profil',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

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