import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardPengajar from '../pages/pengajar/DashboardPengajar';
import TaskPengajar from '../pages/pengajar/Taskpengajar';
import AbsensiSantriPengajarScreen from '../pages/pengajar/AttendanceSantriViewScreen';
import PengajarIzinScreen from '../pages/pengajar/ManageIzinSantri';
import PengumpulanTugasScreen from '../pages/pengajar/PengumpulanTugasSantri';

const Tab = createBottomTabNavigator();

export default function PengajarBottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="DashboardPengajar" component={DashboardPengajar} />
      <Tab.Screen name="TaskPengajar" component={TaskPengajar} />
      <Tab.Screen
        name="AbsensiSantriPengajarScreen"
        component={AbsensiSantriPengajarScreen}
      />
      <Tab.Screen name='ManageIzinSantri' component={PengajarIzinScreen}/>
      <Tab.Screen name='NilaiTugas' component={PengumpulanTugasScreen}/>
    </Tab.Navigator>
  );
}
