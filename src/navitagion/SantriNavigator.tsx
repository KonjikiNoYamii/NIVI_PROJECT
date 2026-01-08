import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import DashboardSantri from "../pages/DashboardSantri";
import TaskScreen from "../pages/TaskScreen";
import ProfileScreen from "../pages/ProfileScreen";
import AttendanceSantriScreen from "../pages/santri/AttendanceSantriScreen";

const Tab = createMaterialTopTabNavigator()

export default function SantriNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardSantri} />
      <Tab.Screen name="Tugas" component={TaskScreen} />
      <Tab.Screen name="Absen" component={AttendanceSantriScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}