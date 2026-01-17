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
import { API } from "../services/api";

const ActivateAccountScreen = ({ route, navigation }: any) => {
  const { token } = route.params;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!password || !confirm) {
      Alert.alert("Error", "Password wajib diisi");
      return;
    }
    if (password.length < 6) {``
      Alert.alert("Error", "Password minimal 6 karakter");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Konfirmasi password tidak cocok");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API}/auth/activate`, { token, password });

      Alert.alert("Berhasil", "Akun berhasil diaktivasi", [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ]);
    } catch (err: any) {
      Alert.alert("Gagal", err.response?.data?.message || "Aktivasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buat Password</Text>

      <TextInput
        placeholder="Password baru"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <TextInput
        placeholder="Konfirmasi password"
        style={styles.input}
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleActivate}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Aktivasi</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default ActivateAccountScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f9fafb" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: { backgroundColor: "#fff", padding: 14, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: "#ddd" },
  button: { backgroundColor: "#3498db", padding: 16, borderRadius: 10, alignItems: "center" },
  buttonDisabled: { backgroundColor: "#9ec9ec" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
