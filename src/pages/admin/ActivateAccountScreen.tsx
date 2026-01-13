import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { API } from "../../services/api";

const ActivateAccountScreen = ({ route, navigation }: any) => {
  const { email } = route.params;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!password || !confirm) {
      Alert.alert("Error", "Password wajib diisi");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Error", "Konfirmasi password tidak cocok");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API}/admin/activate`, {
        email,
        password,
      });

      Alert.alert(
        "Berhasil",
        "Akun berhasil diaktivasi. Silakan login.",
        [{ text: "OK", onPress: () => navigation.replace("Login") }]
      );
    } catch (err: any) {
      Alert.alert(
        "Gagal",
        err.response?.data?.message || "Aktivasi gagal"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aktivasi Akun</Text>
      <Text style={styles.subtitle}>
        Buat password untuk akun:
      </Text>
      <Text style={styles.email}>{email}</Text>

      <TextInput
        placeholder="Password baru"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder="Konfirmasi password"
        secureTextEntry
        style={styles.input}
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleActivate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Aktivasi Akun</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ActivateAccountScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
  email: {
    fontWeight: "600",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#3498db",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
