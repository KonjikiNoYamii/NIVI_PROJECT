import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function AuthGate() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkAuth = async () => {
      const role = await AsyncStorage.getItem("role");

      if (!role) {
        navigation.replace("Login");
        return;
      }

      if (role === "santri") {
        navigation.replace("DashboardSantri");
      } else if (role === "pengajar") {
        navigation.replace("DashboardPengajar");
      } else {
        navigation.replace("AdminPanel");
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
