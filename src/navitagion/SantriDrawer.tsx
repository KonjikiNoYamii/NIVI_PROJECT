import React, { useState, useEffect } from "react";
import { 
  createDrawerNavigator, 
  DrawerContentScrollView, 
  DrawerItemList 
} from "@react-navigation/drawer";
import SantriBottomNavigator from "./SantriNavigator";
import ProfileScreen from "../pages/ProfileScreen";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from "react-native";
import { Icon } from 'react-native-elements';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const Drawer = createDrawerNavigator();

// Custom Drawer Content Component
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
        setUserName(profile.namaLengkap || 'Santri');
      }
    } catch (error) {
      console.log('Error loading user name:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari akun?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('profile');
            navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
          }
        }
      ]
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
            <Icon name="outdent" type="font-awesome" size={16} color="#e74c3c" />
          </View>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

export default function SantriDrawer() {
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
          height: 48, // Diperkecil dari 60px
        },
        headerTintColor: '#1e293b',
        headerTitleStyle: {
          fontSize: 16, // Diperkecil dari 18px
          fontWeight: '600',
          color: '#1e293b',
        },
        headerTitleAlign: 'center',
        headerRight: () => {
          if (route.name === 'Profil') {
            return (
              <TouchableOpacity
                style={styles.headerRightButton}
                onPress={() => {
                  // Handle edit profile or other actions
                }}
              >
                <Icon 
                  name="edit" 
                  type="font-awesome" 
                  size={16} // Diperkecil dari 18px
                  color="#3498db" 
                />
              </TouchableOpacity>
            );
          }
          return null;
        },
        drawerStyle: {
          backgroundColor: '#ffffff',
          width: 260, // Diperkecil dari 280px
        },
        drawerActiveBackgroundColor: '#ebf5fb',
        drawerActiveTintColor: '#3498db',
        drawerInactiveTintColor: '#64748b',
        drawerLabelStyle: {
          fontSize: 14, // Diperkecil dari 15px
          fontWeight: '500',
          marginLeft: -8, // Diperkecil jarak
        },
        drawerItemStyle: {
          borderRadius: 8, // Diperkecil dari 10px
          marginHorizontal: 4, // Diperkecil dari 8px
          marginVertical: 1, // Diperkecil dari 2px
          paddingVertical: 6, // Diperkecil spacing
        },
      })}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen 
        name="Beranda" 
        component={SantriBottomNavigator}
        options={{
          title: 'Beranda',
          drawerIcon: ({ focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <Icon
                name="home"
                type="font-awesome"
                size={18} // Diperkecil dari 20px
                color={focused ? "#3498db" : "#64748b"}
              />
            </View>
          ),
        }}
      />
      <Drawer.Screen 
        name="Profil" 
        component={ProfileScreen}
        options={{
          title: 'Profil Saya',
          drawerIcon: ({ focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <Icon
                name="user"
                type="font-awesome"
                size={18} // Diperkecil dari 20px
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
    padding: 16, // Diperkecil dari 24px
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  headerContent: {
    paddingLeft: 4, // Diperkecil dari 8px
  },
  headerTitle: {
    fontSize: 20, // Diperkecil dari 24px
    fontWeight: '700',
    color: '#3498db',
    marginBottom: 2, // Diperkecil dari 4px
  },
  welcomeText: {
    fontSize: 12, // Diperkecil dari 14px
    color: '#64748b',
  },
  // Drawer Items
  drawerItems: {
    paddingHorizontal: 4, // Diperkecil dari 8px
    paddingVertical: 4, // Diperkecil dari 8px
  },
  // Icon Container
  iconContainer: {
    width: 36, // Diperkecil dari 40px
    height: 36, // Diperkecil dari 40px
    borderRadius: 18, // Diperkecil dari 20px
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6, // Diperkecil dari 8px
  },
  iconContainerActive: {
    backgroundColor: '#ebf5fb',
  },
  // Drawer Footer
  drawerFooter: {
    marginTop: 'auto',
    padding: 12, // Diperkecil dari 16px
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Diperkecil dari 12px
    paddingHorizontal: 12, // Diperkecil dari 16px
    borderRadius: 8, // Diperkecil dari 10px
    backgroundColor: '#fef2f2',
    marginBottom: 8, // Diperkecil dari 12px
  },
  logoutIconContainer: {
    marginRight: 8, // Diperkecil dari 12px
  },
  logoutText: {
    fontSize: 14, // Diperkecil dari 15px
    fontWeight: '500',
    color: '#e74c3c',
  },
  versionText: {
    fontSize: 10, // Diperkecil dari 12px
    color: '#94a3b8',
    textAlign: 'center',
  },
  // Screen Header Styles
  headerLeftButton: {
    marginLeft: 12, // Diperkecil dari 16px
    padding: 6, // Diperkecil dari 8px
  },
  headerRightButton: {
    marginRight: 12, // Diperkecil dari 16px
    padding: 6, // Diperkecil dari 8px
  },
});