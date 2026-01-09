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

    if (!token) {
      navigation.replace("Login");
      return;
    }

    if (role === "santri") {
      navigation.replace("SantriApp");
    } else if (role === "pengajar") {
      navigation.replace("PengajarApp");
    } else if (role === "admin") {
      navigation.replace("AdminApp");
    } else {
      navigation.replace("Login");
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
