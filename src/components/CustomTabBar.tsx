import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const isAdmin = false; // Ganti dengan logic autentikasi admin

  // Filter tab yang ditampilkan berdasarkan role
  const filteredRoutes = state.routes.filter((route, index) => {
    // Jika bukan admin, sembunyikan tab Admin
    if (route.name === 'Admin' && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <View style={styles.tabBar}>
      {filteredRoutes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Icon untuk setiap tab
        let iconName = 'home';
        let iconSize = 24;
        
        switch (route.name) {
          case 'Home':
            iconName = 'home';
            break;
          case 'Santri':
            iconName = 'account-group';
            break;
          case 'Tugas':
            iconName = 'book';
            break;
          case 'Absen':
            iconName = 'calendar-check';
            break;
          case 'Profil':
            iconName = 'account';
            break;
          case 'Admin':
            iconName = 'shield-account';
            iconSize = 28;
            break;
          default:
            iconName = 'circle';
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            // testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              styles.tabItem,
              route.name === 'Admin' && styles.adminTab,
              isFocused && styles.activeTab,
            ]}
          >
            <View style={styles.iconContainer}>
              <Icon
                name={iconName}
                size={iconSize}
                color={isFocused ? '#3498db' : '#7f8c8d'}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  adminTab: {
    backgroundColor: '#f8f9fa',
    borderTopWidth: 3,
    borderTopColor: '#3498db',
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomTabBar;