import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SantriListScreen from '../pages/admin/SantriListScreen';
import SantriDetailScreen from '../pages/admin/SantriDetailScreen';
import SantriFormScreen from '../pages/admin/SantriFormScreen';

export type AdminStackParamList = {
  SantriList: undefined;
  SantriDetail: { santriId: string };
  AddSantri: undefined;
  EditSantri: { santriId: string };
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="SantriList"
        component={SantriListScreen}
        options={{ title: 'Data Santri' }}
      />
      <Stack.Screen
        name="SantriDetail"
        component={SantriDetailScreen}
        options={{ title: 'Detail Santri' }}
      />
      <Stack.Screen
        name="AddSantri"
        component={SantriFormScreen}
        options={{ title: 'Tambah Santri' }}
      />
      <Stack.Screen
        name="EditSantri"
        component={SantriFormScreen}
        options={{ title: 'Edit Santri' }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;