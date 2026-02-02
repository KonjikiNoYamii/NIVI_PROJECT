import React, { useState, useEffect } from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import ProfileScreen from '../pages/ProfileScreen';
import AdminBottomNavigator from './AdminNavigator';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import UserListScreen from '../pages/admin/ViewAllUser';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import KelasList from '../pages/admin/KelasList';
import { RekapBulananScreen } from '../pages/admin/RekapBulananScreen';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const profileString = await AsyncStorage.getItem('profile');
      if (profileString) {
        const profile = JSON.parse(profileString);
        setUserName(profile.namaLengkap || 'Admin');
      }
    } catch (error) {
      console.log('Error loading user name:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari akun?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove([
              'token',
              'user',
              'profile',
              'kelasId',
              'kelasIds',
              'userName',
              'userEmail',
            ]);

            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' as never }],
            });
          },
        },
      ],
    );
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}
    >
      {/* Drawer Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>NIVI</Text>
          {userName ? (
            <Text style={styles.welcomeText}>Halo, {userName}</Text>
          ) : null}
        </View>
      </View>

      {/* Drawer Items */}
      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>

      {/* Logout Button */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <View style={styles.logoutIconContainer}>
            <Icon
              name="outdent"
              type="font-awesome"
              size={16}
              color="#e74c3c"
            />
          </View>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

export default function AdminDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={({ navigation, route }) => ({
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
          height: 48,
        },
        headerTintColor: '#1e293b',
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: '600',
          color: '#1e293b',
        },
        headerTitleAlign: 'center',
        drawerStyle: {
          backgroundColor: '#ffffff',
          width: 260,
        },
        drawerActiveBackgroundColor: '#ebf5fb',
        drawerActiveTintColor: '#3498db',
        drawerInactiveTintColor: '#64748b',
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: '500',
          marginLeft: -8,
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginHorizontal: 4,
          marginVertical: 1,
          paddingVertical: 6,
        },
      })}
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Dashboard"
        component={AdminBottomNavigator}
        options={{
          title: 'Beranda',
          drawerIcon: ({ focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Icon
                name="dashboard"
                type="font-awesome"
                size={18}
                color={focused ? '#3498db' : '#64748b'}
              />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="UserManagement"
        component={UserListScreen}
        options={{
          title: 'Manage Users',
          drawerIcon: ({ focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <FontAwesome6 name="users-gear" size={18} color="#fff" />
            </View>
          ),
        }}
      />

      <Drawer.Screen
        name="ClassManagement"
        component={KelasList}
        options={{
          title: 'Manage Kelas',
          drawerIcon: ({ focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name={focused ? 'school' : 'school-outline'}
                size={focused ? 20 : 18}
                color={focused ? '#3498db' : '#000000'}
              />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="Rekap"
        component={RekapBulananScreen}
        options={{
          title: 'Rekap',
          drawerIcon: ({ focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <FontAwesome6
                name={focused ? 'file-lines' : 'file'}
                size={focused ? 20 : 18}
                color={focused ? '#3498db' : '#000000'}
              />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil Saya',
          drawerIcon: ({ focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Icon
                name="user"
                type="font-awesome"
                size={18}
                color={focused ? '#3498db' : '#64748b'}
              />
            </View>
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Drawer Header
  drawerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  headerContent: {
    paddingLeft: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3498db',
    marginBottom: 2,
  },
  welcomeText: {
    fontSize: 12,
    color: '#64748b',
  },
  // Drawer Items
  drawerItems: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  // Icon Container
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  iconContainerActive: {
    backgroundColor: '#ebf5fb',
  },
  // Drawer Footer
  drawerFooter: {
    marginTop: 'auto',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    marginBottom: 8,
  },
  logoutIconContainer: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e74c3c',
  },
  versionText: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
