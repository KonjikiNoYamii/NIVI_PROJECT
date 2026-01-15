import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { API } from "../services/api";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<any>();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email tidak boleh kosong");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Password tidak boleh kosong");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Error", "Format email tidak valid");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const res = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      // 🔴 USER BELUM AKTIF
     if (res.data.status === "NOT_ACTIVE") {
  Alert.alert(
    "Akun Belum Aktivasi",
    "Silakan buat password Anda",
    [
      {
        text: "Lanjutkan",
        onPress: () =>
          navigation.replace("ActivateAccount", { token: res.data.token }),
      },
    ]
  );
  return;
}


      // ✅ LOGIN OK
      const { token, user } = res.data;

      await AsyncStorage.multiSet([
        ["token", token],
        ["role", user.role],
        ["userId", String(user.id)],
        ["userName", user.name ?? ""],
        ["userEmail", user.email ?? ""],
      ]);

      Alert.alert(
        "Login Berhasil",
        `Selamat datang, ${user.name || user.email}!`,
        [{ text: "OK", onPress: () => navigation.replace("AuthGate") }]
      );
    } catch (err: any) {
      const message = err.response?.data?.message || "Terjadi kesalahan";
      Alert.alert("Login Gagal", message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestActivation = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Masukkan email untuk request aktivasi");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API}/auth/request-activation`, { email });
      Alert.alert("Berhasil", res.data.message, [
        {
          text: "OK",
          onPress: () => navigation.navigate("ActivateAccount", { token: res.data.token }),
        },
      ]);
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal request aktivasi";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/logo.png")}
                style={{ width: 120, height: 120, borderRadius: 60 }}
              />
            </View>
            <Text style={styles.welcomeText}>Selamat Datang!!</Text>
            <Text style={styles.subtitle}>
              Masuk ke akun Anda untuk melanjutkan
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="envelope"
                  type="font-awesome"
                  size={18}
                  color="#95a5a6"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="contoh@santri.dev"
                  placeholderTextColor="#bdc3c7"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="lock"
                  type="font-awesome"
                  size={20}
                  color="#95a5a6"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Masukkan password"
                  placeholderTextColor="#bdc3c7"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Icon
                    name={showPassword ? "eye-slash" : "eye"}
                    type="font-awesome"
                    size={18}
                    color="#95a5a6"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Masuk</Text>
              )}
            </TouchableOpacity>

            {/* 🔹 Tombol request aktivasi */}
            <TouchableOpacity
              style={styles.requestButton}
              onPress={handleRequestActivation}
              disabled={loading}
            >
              <Text style={styles.requestButtonText}>Belum Aktivasi? Request Aktivasi</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffffe8',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2c3e50',
  },
  passwordToggle: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#b0d4f0',
  },
  buttonIcon: {
    marginRight: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dfe6e9',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#95a5a6',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  registerLink: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 18,
  },
    requestButton: { padding: 12, borderRadius: 12, alignItems: "center", backgroundColor: "#95a5a6" },
  requestButtonText: { color: "#fff", fontWeight: "600" },
});

export default LoginScreen;