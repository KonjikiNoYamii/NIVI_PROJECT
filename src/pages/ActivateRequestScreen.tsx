import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { API } from "../services/api";

const ActivateRequestScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleRequest = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email wajib diisi");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API}/auth/request-activation`, { email });
      const { token } = res.data.data;

      Alert.alert(
        "Lanjut Aktivasi",
        "Silakan buat password Anda",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.replace("ActivateAccount", { token }),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Gagal", err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aktivasi Akun</Text>
      <TextInput
        placeholder="Masukkan email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        editable={!loading}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRequest}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Lanjutkan</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ActivateRequestScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f9fafb" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: { backgroundColor: "#fff", padding: 14, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: "#ddd" },
  button: { backgroundColor: "#3498db", padding: 16, borderRadius: 10, alignItems: "center" },
  buttonDisabled: { backgroundColor: "#9ec9ec" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
