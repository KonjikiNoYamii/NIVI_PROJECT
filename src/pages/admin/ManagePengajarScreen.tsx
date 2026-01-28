import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API, SOCKET_URL } from "../../services/api";
import { Icon } from "react-native-elements";
import io from "socket.io-client";

/* =======================
   INTERFACE
======================= */
interface Kelas {
  id: number;
  namaKelas: string;
}

interface Pengajar {
  id: number;
  email: string;
  profiles?: {
    name?: string;
  } | null;
}

/* =======================
   SOCKET
======================= */
const socket = io(SOCKET_URL, { transports: ["websocket"] });

/* =======================
   COMPONENT
======================= */
const ManagePengajarScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);

  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<number | null>(null);

  const [allPengajar, setAllPengajar] = useState<Pengajar[]>([]);
  const [pengajarKelas, setPengajarKelas] = useState<Pengajar[]>([]);

  const [loadingAssign, setLoadingAssign] = useState(false);
  const [loadingPengajarKelas, setLoadingPengajarKelas] = useState(false);
  const [fetchingInit, setFetchingInit] = useState(true);

  /* =======================
     FETCH INITIAL DATA
  ======================= */
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [kelasRes, pengajarRes] = await Promise.all([
          axios.get(`${API}/kelas`),
          axios.get(`${API}/users/pengajar`),
        ]);
        setKelasList(kelasRes.data.data ?? kelasRes.data ?? []);
        setAllPengajar(pengajarRes.data.data ?? pengajarRes.data ?? []);
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Gagal mengambil data awal");
      } finally {
        setFetchingInit(false);
      }
    };
    fetchInit();
  }, []);

  /* =======================
     FETCH PENGAJAR BY KELAS
  ======================= */
  useEffect(() => {
    if (!selectedKelasId) {
      setPengajarKelas([]);
      return;
    }
    const fetchPengajarByKelas = async () => {
      setLoadingPengajarKelas(true);
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API}/admin/kelas/${selectedKelasId}/pengajar`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = res.data?.data ?? res.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.pengajar)
          ? raw.pengajar
          : [];
        setPengajarKelas(list);
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Gagal mengambil pengajar kelas");
      } finally {
        setLoadingPengajarKelas(false);
      }
    };
    fetchPengajarByKelas();
  }, [selectedKelasId]);

  /* =======================
     SOCKET LISTENERS
  ======================= */
  useEffect(() => {
    socket.on("kelas-created", (kelas: Kelas) => {
      setKelasList(prev => [...prev, kelas]);
    });

    socket.on("kelas-updated", (kelas: Kelas) => {
      setKelasList(prev => prev.map(k => k.id === kelas.id ? kelas : k));
    });

    socket.on("kelas-deleted", ({ id }: { id: number }) => {
      setKelasList(prev => prev.filter(k => k.id !== id));
      if (selectedKelasId === id) setSelectedKelasId(null);
    });

    socket.on("kelas-pengajar-updated", (updatedKelas: { id: number; pengajar: Pengajar[] }) => {
      if (selectedKelasId === updatedKelas.id) {
        setPengajarKelas(updatedKelas.pengajar ?? []);
      }
    });

    return () => {
      socket.off("kelas-created");
      socket.off("kelas-updated");
      socket.off("kelas-deleted");
      socket.off("kelas-pengajar-updated");
    };
  }, [selectedKelasId]);

  /* =======================
     CREATE PENGAJAR
  ======================= */
  const handleCreatePengajar = async () => {
    if (!name || !email) {
      Alert.alert("Validasi", "Nama dan email wajib diisi");
      return;
    }
    setCreating(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(`${API}/admin/pengajar`, 
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newPengajar = res.data.data ?? res.data;
      setAllPengajar(prev => [...prev, newPengajar]);
      setName("");
      setEmail("");
      Alert.alert("Berhasil", "Pengajar berhasil dibuat");
    } catch (err: any) {
      console.log(err);
      Alert.alert("Gagal", err.response?.data?.message ?? "Terjadi kesalahan server");
    } finally {
      setCreating(false);
    }
  };

  /* =======================
     ASSIGN PENGAJAR
  ======================= */
const handleAssignPengajar = async (pengajarIds: number | number[]) => {
  if (!selectedKelasId) return;
  setLoadingAssign(true);
  try {
    const token = await AsyncStorage.getItem("token");
    await axios.post(
      `${API}/kelas/${selectedKelasId}/pengajar`,
      { pengajarIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Update state frontend secara manual
    const newPengajar = allPengajar.filter(p => 
      (Array.isArray(pengajarIds) ? pengajarIds : [pengajarIds]).includes(p.id)
    );
    setPengajarKelas(prev => [...prev, ...newPengajar]);

    Alert.alert("Berhasil", "Pengajar berhasil ditambahkan ke kelas");
  } catch (err) {
    console.log(err);
    Alert.alert("Gagal", "Gagal menambahkan pengajar");
  } finally {
    setLoadingAssign(false);
  }
};

  /* =======================
     REMOVE PENGAJAR
  ======================= */
  const handleRemovePengajar = async (pengajarId: number) => {
    if (!selectedKelasId) return;
    Alert.alert(
      "Konfirmasi",
      "Apakah yakin ingin menghapus pengajar dari kelas ini?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.delete(`${API}/admin/kelas/pengajar`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { kelasId: selectedKelasId, pengajarId },
              });

              socket.emit("kelas-pengajar-changed", { kelasId: selectedKelasId });

              setPengajarKelas(prev => prev.filter(p => p.id !== pengajarId));
              Alert.alert("Berhasil", "Pengajar dihapus dari kelas");
            } catch (err) {
              console.log(err);
              Alert.alert("Gagal", "Gagal menghapus pengajar");
            }
          }
        }
      ]
    );
  };

  if (fetchingInit) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manajemen Pengajar</Text>
        <Text style={styles.headerSubtitle}>
          Kelola data pengajar dan penugasan kelas
        </Text>
      </View>

      {/* FORM CARD */}
      <View style={styles.card}>
        <Text style={styles.label}>Nama Lengkap</Text>
        <TextInput
          placeholder="Masukkan nama pengajar"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
          style={styles.input}
          editable={!creating}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Masukkan email pengajar"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!creating}
        />

        <TouchableOpacity
          style={[styles.button, creating && styles.disabled]}
          onPress={handleCreatePengajar}
          disabled={creating}
          activeOpacity={0.85}
        >
          {creating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>BUAT PENGAJAR</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* KELAS CARD */}
      <View style={styles.card}>
        <Text style={styles.listTitle}>Pilih Kelas</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.kelasScroll}
        >
          {kelasList.map(k => (
            <TouchableOpacity
              key={k.id}
              style={[
                styles.kelasButton,
                selectedKelasId === k.id && styles.kelasButtonActive
              ]}
              onPress={() => setSelectedKelasId(k.id)}
            >
              <Text style={[
                styles.kelasButtonText,
                selectedKelasId === k.id && styles.kelasButtonTextActive
              ]}>
                {k.namaKelas}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Jika kelas dipilih, tampilkan pengajar */}
      {selectedKelasId && (
        <>
          {/* LIST PENGAJAR DI KELAS CARD */}
          <View style={styles.listCard}>
            <Text style={styles.listTitle}>Pengajar di Kelas</Text>
            {loadingPengajarKelas && (
              <ActivityIndicator color="#2563eb" />
            )}
            
            {pengajarKelas.length > 0 ? (
              pengajarKelas.map(p => (
                <View key={p.id} style={styles.listItem}>
                  <View style={styles.listItemContent}>
                    <Text style={styles.pengajarNama}>{p.profiles?.name ?? p.email}</Text>
                    <Text style={styles.pengajarEmail}>{p.email}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemovePengajar(p.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.deleteText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Belum ada pengajar di kelas ini</Text>
            )}
          </View>

          {/* LIST PENGAJAR TERSEDIA CARD */}
          <View style={styles.listCard}>
            <Text style={styles.listTitle}>Tambahkan Pengajar</Text>
            <Text style={styles.listSubtitle}>
              Pilih pengajar yang tersedia untuk ditambahkan ke kelas
            </Text>
            
            {allPengajar
              .filter(p => !pengajarKelas.some(pk => pk.id === p.id))
              .map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.listItem}
                  onPress={() => handleAssignPengajar(p.id)}
                  disabled={loadingAssign}
                  activeOpacity={0.85}
                >
                  <View style={styles.listItemContent}>
                    <Text style={styles.pengajarNama}>{p.profiles?.name ?? p.email}</Text>
                    <Text style={styles.pengajarEmail}>{p.email}</Text>
                  </View>
                  {loadingAssign ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                  ) : (
                    <Text style={styles.addText}>+ Tambah</Text>
                  )}
                </TouchableOpacity>
              ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

  kelasScroll: {
    marginHorizontal: -4,
  },

  kelasButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  kelasButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  kelasButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },

  kelasButtonTextActive: {
    color: "#fff",
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

  listSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
    fontWeight: "500",
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

  pengajarNama: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2933",
  },

  pengajarEmail: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  deleteText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ef4444",
  },

  addText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },

  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
    paddingVertical: 12,
  },
});

export default ManagePengajarScreen;