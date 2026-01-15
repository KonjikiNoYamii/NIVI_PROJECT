import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  StyleSheet, ActivityIndicator, ScrollView
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

const ManagePengajarScreen = () => {
  // State Tambah Pengajar
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);

  // State Assign Pengajar
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [pengajar, setPengajar] = useState<Pengajar[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<number | null>(null);
  const [selectedPengajarIds, setSelectedPengajarIds] = useState<number[]>([]);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [fetchingKelas, setFetchingKelas] = useState(true);
  const [fetchingPengajar, setFetchingPengajar] = useState(true);

  // Fetch kelas
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

  // Fetch pengajar
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

  // Toggle select pengajar
  const togglePengajarSelect = (id: number) => {
    setSelectedPengajarIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Handle create pengajar
  const handleCreatePengajar = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Nama dan Email wajib diisi desuwah!");
      return;
    }
    setCreating(true);
    try {
      const res = await axios.post(`${API}/admin/pengajar`, { name, email });
      const newPengajar: Pengajar = res.data.data ?? res.data;
      // Tambahkan ke list pengajar lokal supaya bisa langsung diassign
      setPengajar(prev => [...prev, newPengajar]);
      Alert.alert("Sukses", "Pengajar berhasil dibuat desuwah!");
      setName(""); setEmail("");
    } catch (err: any) {
      console.log(err.response || err.message);
      Alert.alert("Gagal", err.response?.data?.message || "Terjadi kesalahan desuwah!");
    } finally {
      setCreating(false);
    }
  };

  // Handle assign pengajar ke kelas
  const handleAssignPengajar = async () => {
    if (!selectedKelasId) {
      Alert.alert("Error", "Pilih kelas desuwah!");
      return;
    }
    if (selectedPengajarIds.length === 0) {
      Alert.alert("Error", "Pilih minimal 1 pengajar desuwah!");
      return;
    }

    setLoadingAssign(true);
    try {
      await axios.put(`${API}/kelas/${selectedKelasId}/pengajar`, {
        pengajarIds: selectedPengajarIds
      });
      Alert.alert("Sukses", "Pengajar berhasil ditetapkan ke kelas desuwah!");
      setSelectedPengajarIds([]);
      setSelectedKelasId(null);
    } catch (err: any) {
      console.log(err.response || err.message);
      Alert.alert("Gagal", "Terjadi kesalahan saat assign desuwah!");
    } finally {
      setLoadingAssign(false);
    }
  };

  if (fetchingKelas || fetchingPengajar) return (
    <ActivityIndicator style={{ flex: 1 }} size="large" />
  );

  return (
    <ScrollView style={styles.container}>
      {/* Tambah Pengajar */}
      <Text style={styles.title}>Tambah Pengajar</Text>
      <TextInput
        placeholder="Nama"
        style={styles.input}
        value={name}
        onChangeText={setName}
        editable={!creating}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        editable={!creating}
        keyboardType="email-address"
      />
      <TouchableOpacity
        style={[styles.button, creating && { opacity: 0.7 }]}
        onPress={handleCreatePengajar}
        disabled={creating}
      >
        {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Buat Pengajar</Text>}
      </TouchableOpacity>

      {/* Assign Pengajar ke Kelas */}
      <Text style={[styles.title, { marginTop: 30 }]}>Assign Pengajar ke Kelas</Text>
      <Text style={styles.sectionTitle}>Pilih Kelas</Text>
      {kelasList.map(k => (
        <TouchableOpacity
          key={k.id}
          style={[styles.item, selectedKelasId === k.id && styles.selectedItem]}
          onPress={() => setSelectedKelasId(k.id)}
        >
          <Text style={styles.itemText}>{k.namaKelas}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Pilih Pengajar</Text>
      {pengajar.map(p => {
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
        style={[styles.button, loadingAssign && { opacity: 0.7 }]}
        onPress={handleAssignPengajar}
        disabled={loadingAssign}
      >
        {loadingAssign ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Simpan Assign</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ManagePengajarScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9fafb" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginVertical: 10 },
  input: { backgroundColor:"#fff", padding:12, borderRadius:8, marginBottom:12, borderWidth:1, borderColor:"#ddd" },
  button: { backgroundColor:"#3498db", padding:16, borderRadius:8, alignItems:"center", marginTop:10 },
  buttonText: { color:"#fff", fontWeight:"bold", fontSize:16 },
  item: { padding: 15, backgroundColor: "#fff", marginBottom: 10, borderRadius: 8 },
  selectedItem: { backgroundColor: "#4a90e2" },
  itemText: { color: "#000", fontWeight: "500" }
});
