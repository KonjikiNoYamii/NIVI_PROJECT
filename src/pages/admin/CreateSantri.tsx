import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { adminSantriService } from "../../services/adminSantri";

const CreateSantriScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !kelasId) {
      Alert.alert("Validasi", "Semua field wajib diisi");
      return;
    }

    try {
      setLoading(true);

      await adminSantriService.createSantri({
        name,
        email,
        kelasId: Number(kelasId),
      });

      Alert.alert(
        "Berhasil",
        "Santri berhasil dibuat.\nSantri harus aktivasi akun terlebih dahulu."
      );

      setName("");
      setEmail("");
      setKelasId("");
    } catch (error: any) {
      Alert.alert(
        "Gagal",
        error?.response?.data?.message || "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tambah Santri</Text>

      <TextInput
        placeholder="Nama Santri"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email Santri"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="ID Kelas"
        value={kelasId}
        onChangeText={setKelasId}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Simpan Santri</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CreateSantriScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
