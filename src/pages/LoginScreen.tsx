import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "https://nivi-production.up.railway.app/api/auth/login",
        { email, password }
      );

      const token = res.data.data.token;
      const user = res.data.data.user;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", user.role);
      await AsyncStorage.setItem("userId", String(user.id));

      navigation.replace('AuthGate')
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      Alert.alert(
        "Login gagal",
        err.response?.data?.message || "Email atau password salah"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 6,
  },
  registerLink: {
    marginTop: 15,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#555",
  },
  bold: {
    fontWeight: "bold",
    color: "#1976D2",
  },
});

export default LoginScreen;
