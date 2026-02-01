import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import DashboardPengajar from '../pages/pengajar/DashboardPengajar';
import TaskPengajar from '../pages/pengajar/Taskpengajar';
import AbsensiSantriPengajarScreen from '../pages/pengajar/AttendanceSantriViewScreen';
import PengajarIzinScreen from '../pages/pengajar/ManageIzinSantri';
import PengumpulanTugasScreen from '../pages/pengajar/PengumpulanTugasSantri';
import NilaiTugasScreen from '../pages/pengajar/NilaiTugasScreen';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RekapBulananScreen } from '../pages/pengajar/RekapBulananScreen';

const Tab = createBottomTabNavigator();

export default function PengajarBottomNavigator() {
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
        name="DashboardPengajar"
        component={DashboardPengajar}
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
                name="chart-simple"
                size={focused ? 22 : 20}
                color={focused ? '#3498db' : '#000000'}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="TaskPengajar"
        component={TaskPengajar}
        options={{
          tabBarLabel: 'Tugas',
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <FontAwesome6
                name="list-check"
                size={focused ? 20 : 18}
                color={focused ? '#3498db' : '#000000'}
                solid={focused}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AbsensiSantriPengajarScreen"
        component={AbsensiSantriPengajarScreen}
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
      <Tab.Screen
        name="ManageIzinSantri"
        component={PengajarIzinScreen}
        options={{
          tabBarLabel: 'Izin',
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <FontAwesome6
                name="file-signature"
                size={focused ? 20 : 18}
                color={focused ? '#3498db' : '#000000'}
                solid={focused}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="KumpulTugas"
        component={PengumpulanTugasScreen}
        options={{
          tabBarLabel: 'Kumpul',
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <FontAwesome6
                name="inbox"
                size={focused ? 20 : 18}
                color={focused ? '#3498db' : '#000000'}
                solid={focused}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Rekap"
        component={RekapBulananScreen}
        options={{
          tabBarLabel: 'Rekap',
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <FontAwesome6
                name={focused ? 'file-lines' : 'file'}
                size={focused ? 18 : 18}
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
