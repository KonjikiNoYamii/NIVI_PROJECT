import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardAdmin from '../pages/admin/AdminDashboard';
import ManageSantriScreen from '../pages/admin/ManageSantriScreen';
import ManagePengajarScreen from '../pages/admin/ManagePengajarScreen';
import ManageKelasScreen from '../pages/admin/ManageKelasScreen';
import CreateMataPelajaranScreen from '../pages/admin/MataPelajaranPage';
import AdminJadwalScreen from '../pages/admin/ManageAbsenScreen';


const Tab = createBottomTabNavigator();

export default function AdminBottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="AdminDashboard" component={DashboardAdmin} />
      <Tab.Screen name='ManageSantriScreen' component={ManageSantriScreen}/>
      <Tab.Screen name='ManagePengajarScreen' component={ManagePengajarScreen}/>
      <Tab.Screen name='ManageKelasScreen' component={ManageKelasScreen}/>
      <Tab.Screen name='ManageMapelScreen' component={CreateMataPelajaranScreen}/>
      <Tab.Screen name='ManageAbsenScreen' component={AdminJadwalScreen}/>
    </Tab.Navigator>
  );
}
    