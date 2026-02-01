import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import DashboardAdmin from '../pages/admin/AdminDashboard';
import ManageSantriScreen from '../pages/admin/ManageSantriScreen';
import ManagePengajarScreen from '../pages/admin/ManagePengajarScreen';
import ManageKelasScreen from '../pages/admin/ManageKelasScreen';
import CreateMataPelajaranScreen from '../pages/admin/MataPelajaranPage';
import AdminJadwalScreen from '../pages/admin/ManageAbsenScreen';
import Ionicons from '@react-native-vector-icons/ionicons';

const Tab = createBottomTabNavigator();

export default function AdminBottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3498db',
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
        name="AdminDashboard"
        component={DashboardAdmin}
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <FontAwesome6
                name={focused ? 'chart-simple' : 'chart-simple'}
                size={focused ? 22 : 20}
                color={focused ? '#3498db' : '#000000'}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ManageSantriScreen"
        component={ManageSantriScreen}
        options={{
          tabBarLabel: 'Santri',
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name="person"
                size={focused ? 20 : 18}
                color={focused ? '#3498db' : '#000000'}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ManagePengajarScreen"
        component={ManagePengajarScreen}
        options={{
          tabBarLabel: 'Pengajar',
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <FontAwesome6
                name="chalkboard-user"
                size={focused ? 20 : 18}
                color={focused ? '#3498db' : '#000000'}
                solid={focused}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ManageKelasScreen"
        component={ManageKelasScreen}
        options={{
          tabBarLabel: 'Kelas',
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <FontAwesome6
                name="door-open"
                size={focused ? 20 : 18}
                color={focused ? '#3498db' : '#000000'}
                solid={focused}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ManageMapelScreen"
        component={CreateMataPelajaranScreen}
        options={{
          tabBarLabel: 'Mapel',
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <FontAwesome6
                name="book-open"
                size={focused ? 20 : 18}
                color={focused ? '#3498db' : '#000000'}
                solid={focused}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ManageAbsenScreen"
        component={AdminJadwalScreen}
        options={{
          tabBarLabel: 'Absensi',
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <FontAwesome6
                name="calendar-check"
                size={focused ? 20 : 18}
                color={focused ? '#3498db' : '#000000'}
                solid={focused}
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
