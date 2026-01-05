import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import DashboardSantri from "../pages/DashboardSantri";
import TaskScreen from "../pages/TaskScreen";
import AttendanceScreen from "../pages/AttendanceScreen";
import ProfileScreen from "../pages/ProfileScreen";

export default function SantriNavigator() {
    const Tab = createMaterialTopTabNavigator()
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardSantri} />
      <Tab.Screen name="Tugas" component={TaskScreen} />
      <Tab.Screen name="Absen" component={AttendanceScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}