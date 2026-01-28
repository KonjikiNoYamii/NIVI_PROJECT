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
  StatusBar,
  Platform,
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
      Alert.alert("Error", "Gagal mengambil data kelas");
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
      Alert.alert("Error", "Nama kelas wajib diisi");
      return;
    }

    if (namaKelas.trim().length < 3) {
      Alert.alert("Error", "Nama kelas minimal 3 karakter");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/kelas`, { namaKelas, deskripsi });
      Alert.alert("Berhasil", "Kelas berhasil dibuat");
      setNamaKelas("");
      setDeskripsi("");
      fetchKelas();
    } catch (error: any) {
      Alert.alert(
        "Gagal",
        error.response?.data?.message || "Terjadi kesalahan server"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE KELAS ================= */
  const handleDelete = (id: number) => {
    Alert.alert(
      "Hapus Kelas",
      "Apakah yakin ingin menghapus kelas ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API}/kelas/${id}`);
              Alert.alert("Berhasil", "Kelas berhasil dihapus");
              fetchKelas();
            } catch (err) {
              Alert.alert("Gagal", "Tidak bisa menghapus kelas");
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manajemen Kelas</Text>
        <Text style={styles.headerSubtitle}>
          Kelola data kelas desa belajar
        </Text>
      </View>

      {/* FORM CARD */}
      <View style={styles.card}>
        <Text style={styles.label}>Nama Kelas</Text>
        <TextInput
          placeholder="Contoh: Angkatan 22"
          placeholderTextColor="#9ca3af"
          value={namaKelas}
          onChangeText={setNamaKelas}
          style={styles.input}
        />

        <Text style={styles.label}>Deskripsi (opsional)</Text>
        <TextInput
          placeholder="Deskripsi kelas..."
          placeholderTextColor="#9ca3af"
          value={deskripsi}
          onChangeText={setDeskripsi}
          style={[styles.input, styles.textArea]}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.disabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>BUAT KELAS</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* LIST KELAS CARD */}
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Daftar Kelas</Text>

        {loadingList ? (
          <ActivityIndicator color="#2563eb" />
        ) : kelasList.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada kelas</Text>
        ) : (
          kelasList.map((kelas) => (
            <View key={kelas.id} style={styles.listItem}>
              <View style={styles.listItemContent}>
                <Text style={styles.kelasNama}>{kelas.namaKelas}</Text>
                {kelas.deskripsi ? (
                  <Text style={styles.kelasDeskripsi}>{kelas.deskripsi}</Text>
                ) : null}
              </View>

              <TouchableOpacity 
                onPress={() => handleDelete(kelas.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "android" ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },

  headerSubtitle: {
    marginTop: 6,
    color: "#c7d2fe",
    fontSize: 14,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -28,
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 14,
    color: "#111827",
  },

  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },

  disabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  listCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  listTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111827",
  },

  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  listItemContent: {
    flex: 1,
  },

  kelasNama: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2933",
  },

  kelasDeskripsi: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  deleteText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ef4444",
  },

  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
    paddingVertical: 12,
  },
});

export default ManageKelasScreen;