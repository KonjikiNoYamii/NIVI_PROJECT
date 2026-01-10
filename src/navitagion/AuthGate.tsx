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

      if (!token || !role) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
        return;
      }

      let target = "Login";

      if (role === "santri") target = "SantriApp";
      if (role === "pengajar") target = "PengajarApp";
      if (role === "admin") target = "AdminApp";

      navigation.reset({
        index: 0,
        routes: [{ name: target }],
      });
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
