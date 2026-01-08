// screens/AuthGate.tsx
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const AuthGate = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");

      // ⬇️ PENTING: JIKA TIDAK ADA TOKEN → KE LOGIN
      if (!token) {
        navigation.replace("Login");
        return;
      }

      if (role === "santri") {
        navigation.replace("DashboardSantri");
      } else if (role === "pengajar") {
        navigation.replace("DashboardPengajar");
      } else {
        navigation.replace("AdminDashboard");
      }
    };

    init();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default AuthGate;
