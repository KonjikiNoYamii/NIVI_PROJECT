import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Keyboard,
} from "react-native";
import axios from "axios";
import { API } from "../../services/api";

const CreateKelas = ({ navigation }: any) => {
  const [namaKelas, setNamaKelas] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!namaKelas.trim()) {
      Alert.alert("Error", "Nama kelas wajib diisi desuwah!");
      return;
    }

    if (namaKelas.trim().length < 3) {
      Alert.alert("Error", "Nama kelas minimal 3 karakter desuwah!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/kelas`, { namaKelas, deskripsi });
      Alert.alert("Sukses", "Kelas berhasil dibuat desuwah!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
      setNamaKelas("");
      setDeskripsi("");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Gagal", error.response?.data?.message || error.message);
      } else {
        Alert.alert("Gagal", "Terjadi kesalahan tidak terduga desuwah!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Buat Kelas Baru</Text>

        <Text style={styles.label}>Nama Kelas</Text>
        <TextInput
          style={styles.input}
          placeholder="Kelas 7A"
          value={namaKelas}
          onChangeText={setNamaKelas}
        />

        <Text style={styles.label}>Deskripsi (opsional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Deskripsi kelas..."
          value={deskripsi}
          onChangeText={setDeskripsi}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Buat Kelas</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateKelas;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 16, marginBottom: 5 },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 10, marginBottom: 15, borderWidth: 1, borderColor: "#ccc" },
  textArea: { height: 100, textAlignVertical: "top" },
  button: { backgroundColor: "#4a90e2", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
