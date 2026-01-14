import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import axios from "axios";
import { API } from "../../services/api";

interface Kelas {
  id: number;
  namaKelas: string;
}

interface Pengajar {
  id: number;
  email: string;
  profiles?: { name?: string } | null;
}

const AssignPengajar = () => {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<number | null>(null);
  const [pengajar, setPengajar] = useState<Pengajar[]>([]);
  const [selectedPengajarIds, setSelectedPengajarIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingKelas, setFetchingKelas] = useState(true);
  const [fetchingPengajar, setFetchingPengajar] = useState(true);

  // Ambil daftar kelas
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await axios.get(`${API}/kelas`);
        const list = Array.isArray(res.data) ? res.data : res.data.data ?? [];
        setKelasList(list);
      } catch (err: any) {
        console.log(err.response || err.message);
        Alert.alert("Error", "Gagal mengambil daftar kelas desuwah!");
      } finally {
        setFetchingKelas(false);
      }
    };
    fetchKelas();
  }, []);

  // Ambil daftar pengajar
  useEffect(() => {
    const fetchPengajar = async () => {
      try {
        const res = await axios.get(`${API}/users/pengajar`);
        const list = Array.isArray(res.data) ? res.data : res.data.data ?? [];
        setPengajar(list);
      } catch (err: any) {
        console.log(err.response || err.message);
        Alert.alert("Error", "Gagal mengambil daftar pengajar desuwah!");
      } finally {
        setFetchingPengajar(false);
      }
    };
    fetchPengajar();
  }, []);

  const togglePengajarSelect = (id: number) => {
    setSelectedPengajarIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!selectedKelasId) {
      Alert.alert("Error", "Pilih kelas desuwah!");
      return;
    }
    if (selectedPengajarIds.length === 0) {
      Alert.alert("Error", "Pilih minimal 1 pengajar desuwah!");
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API}/kelas/${selectedKelasId}/pengajar`, {
        pengajarIds: selectedPengajarIds,
      });
      Alert.alert("Sukses", "Pengajar berhasil ditetapkan desuwah!");
      setSelectedPengajarIds([]);
      setSelectedKelasId(null);
    } catch (err: any) {
      console.log(err.response || err.message);
      Alert.alert("Gagal", "Terjadi kesalahan saat menambahkan pengajar desuwah!");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingKelas || fetchingPengajar)
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Assign Pengajar ke Kelas</Text>

      <Text style={styles.sectionTitle}>Pilih Kelas</Text>
      {kelasList.map((kelas) => (
        <TouchableOpacity
          key={kelas.id}
          style={[styles.item, selectedKelasId === kelas.id && styles.selectedItem]}
          onPress={() => setSelectedKelasId(kelas.id)}
        >
          <Text style={styles.itemText}>{kelas.namaKelas}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Pilih Pengajar</Text>
      {pengajar.map((p) => {
        const selected = selectedPengajarIds.includes(p.id);
        return (
          <TouchableOpacity
            key={p.id}
            style={[styles.item, selected && styles.selectedItem]}
            onPress={() => togglePengajarSelect(p.id)}
          >
            <Text style={styles.itemText}>{p.profiles?.name ?? p.email}</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Simpan</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AssignPengajar;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginVertical: 10 },
  item: { padding: 15, backgroundColor: "#fff", marginBottom: 10, borderRadius: 8 },
  selectedItem: { backgroundColor: "#4a90e2" },
  itemText: { color: "#000", fontWeight: "500" },
  button: { backgroundColor: "#4a90e2", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
