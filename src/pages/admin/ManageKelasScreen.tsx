import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Keyboard,
} from "react-native";
import axios from "axios";
import { API } from "../../services/api";
import { SafeAreaView } from "react-native-safe-area-context";

const ManageKelasScreen = () => {
  const [namaKelas, setNamaKelas] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  /* ================= FETCH KELAS ================= */
  const fetchKelas = async () => {
    try {
      setLoadingList(true);
      const res = await axios.get(`${API}/kelas`);
      setKelasList(res.data.data || []);
    } catch (err) {
      Alert.alert("Error", "Gagal mengambil data kelas desuwah!");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchKelas();
  }, []);

  /* ================= CREATE KELAS ================= */
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
      await axios.post(`${API}/kelas`, { namaKelas, deskripsi });
      Alert.alert("Sukses", "Kelas berhasil dibuat desuwah!");
      setNamaKelas("");
      setDeskripsi("");
      fetchKelas();
    } catch (error: any) {
      Alert.alert("Gagal", error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE KELAS ================= */
  const handleDelete = (id: number) => {
    Alert.alert(
      "Hapus Kelas",
      "Apakah Master yakin ingin menghapus kelas ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API}/kelas/${id}`);
              Alert.alert("Sukses", "Kelas berhasil dihapus desuwah!");
              fetchKelas();
            } catch (err) {
              Alert.alert("Gagal", "Tidak bisa menghapus kelas desuwah!");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Manajemen Kelas</Text>

        {/* ===== FORM CREATE ===== */}
        <Text style={styles.label}>Nama Kelas</Text>
        <TextInput
          style={styles.input}
          placeholder="Angkatan 22"
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
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Buat Kelas</Text>}
        </TouchableOpacity>

        {/* ===== LIST KELAS ===== */}
        <Text style={styles.subTitle}>Daftar Kelas</Text>

        {loadingList ? (
          <ActivityIndicator />
        ) : kelasList.length === 0 ? (
          <Text style={styles.empty}>Belum ada kelas desuwah~</Text>
        ) : (
          kelasList.map((kelas) => (
            <View key={kelas.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kelasName}>{kelas.namaKelas}</Text>
                {kelas.deskripsi ? (
                  <Text style={styles.kelasDesc}>{kelas.deskripsi}</Text>
                ) : null}
              </View>

              <TouchableOpacity onPress={() => handleDelete(kelas.id)}>
                <Text style={styles.delete}>Hapus</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageKelasScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  subTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 15 },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  textArea: { height: 80, textAlignVertical: "top" },
  button: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  empty: { textAlign: "center", color: "#777", marginTop: 10 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  kelasName: { fontSize: 16, fontWeight: "bold" },
  kelasDesc: { fontSize: 13, color: "#666", marginTop: 3 },
  delete: { color: "#e74c3c", fontWeight: "bold" },
});
