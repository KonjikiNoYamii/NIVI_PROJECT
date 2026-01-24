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
        Alert.alert("Error", "Gagal mengambil data awal!");
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
        Alert.alert("Error", "Gagal mengambil pengajar kelas!");
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
      Alert.alert("Error", "Nama dan email wajib diisi!");
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
      Alert.alert("Sukses", "Pengajar berhasil dibuat!");
    } catch (err: any) {
      console.log(err);
      Alert.alert("Gagal", err.response?.data?.message ?? "Terjadi kesalahan!");
    } finally {
      setCreating(false);
    }
  };

  /* =======================
     ASSIGN PENGAJAR
  ======================= */
  const handleAssignPengajar = async (pengajarId: number) => {
    if (!selectedKelasId) {
      Alert.alert("Error", "Pilih kelas terlebih dahulu!");
      return;
    }
    setLoadingAssign(true);
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `${API}/kelas/${selectedKelasId}/pengajar`,
        { pengajarIds: [pengajarId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit("kelas-pengajar-changed", { kelasId: selectedKelasId });

      const pengajarBaru = allPengajar.find(p => p.id === pengajarId);
      if (pengajarBaru) setPengajarKelas(prev => [...prev, pengajarBaru]);
      Alert.alert("Sukses", "Pengajar berhasil ditambahkan ke kelas!");
    } catch (err) {
      console.log(err);
      Alert.alert("Gagal", "Gagal menambahkan pengajar!");
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
      "Apakah Anda yakin ingin menghapus pengajar dari kelas ini?",
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
              Alert.alert("Sukses", "Pengajar dihapus dari kelas!");
            } catch (err) {
              console.log(err);
              Alert.alert("Gagal", "Gagal menghapus pengajar!");
            }
          }
        }
      ]
    );
  };

  if (fetchingInit) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Manajemen Pengajar</Text>
          <Text style={styles.subtitle}>Kelola data pengajar dan penugasan kelas</Text>
        </View>

        {/* Card Tambah Pengajar */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="user-plus" type="font-awesome" size={20} color="#3498db" />
            <Text style={styles.cardTitle}>Tambah Pengajar Baru</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <View style={styles.inputContainer}>
              <Icon name="user" type="font-awesome" size={16} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                placeholder="Masukkan nama pengajar"
                value={name}
                onChangeText={setName}
                style={styles.input}
                editable={!creating}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Icon name="envelope" type="font-awesome" size={16} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                placeholder="Masukkan email pengajar"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!creating}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, creating && styles.primaryButtonDisabled]}
            onPress={handleCreatePengajar}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="plus" type="font-awesome" size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>Buat Pengajar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Card Pilih Kelas */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="graduation-cap" type="font-awesome" size={20} color="#3498db" />
            <Text style={styles.cardTitle}>Pilih Kelas</Text>
          </View>
          
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
                <Icon 
                  name="school" 
                  type="font-awesome" 
                  size={16} 
                  color={selectedKelasId === k.id ? "#fff" : "#3498db"} 
                />
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
            {/* Card Pengajar di Kelas */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name="users" type="font-awesome" size={20} color="#3498db" />
                <Text style={styles.cardTitle}>Pengajar di Kelas</Text>
                {loadingPengajarKelas && (
                  <ActivityIndicator size="small" color="#3498db" style={styles.headerLoader} />
                )}
              </View>
              
              {pengajarKelas.length > 0 ? (
                pengajarKelas.map(p => (
                  <View key={p.id} style={styles.pengajarItem}>
                    <View style={styles.pengajarInfo}>
                      <Icon name="chalkboard-teacher" type="font-awesome" size={16} color="#3498db" />
                      <View style={styles.pengajarDetails}>
                        <Text style={styles.pengajarName}>{p.profiles?.name ?? p.email}</Text>
                        <Text style={styles.pengajarEmail}>{p.email}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemovePengajar(p.id)}
                      style={styles.removeButton}
                    >
                      <Icon name="trash" type="font-awesome" size={14} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="user-slash" type="font-awesome" size={32} color="#e2e8f0" />
                  <Text style={styles.emptyText}>Belum ada pengajar di kelas ini</Text>
                </View>
              )}
            </View>

            {/* Card Pengajar Tersedia */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name="user-plus" type="font-awesome" size={20} color="#2ecc71" />
                <Text style={styles.cardTitle}>Tambahkan Pengajar</Text>
              </View>
              
              <Text style={styles.sectionDescription}>
                Pilih pengajar yang tersedia untuk ditambahkan ke kelas
              </Text>
              
              {allPengajar
                .filter(p => !pengajarKelas.some(pk => pk.id === p.id))
                .map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.pengajarAvailableItem}
                    onPress={() => handleAssignPengajar(p.id)}
                    disabled={loadingAssign}
                  >
                    <View style={styles.pengajarInfo}>
                      <Icon name="user" type="font-awesome" size={16} color="#2ecc71" />
                      <View style={styles.pengajarDetails}>
                        <Text style={styles.pengajarName}>{p.profiles?.name ?? p.email}</Text>
                        <Text style={styles.pengajarEmail}>{p.email}</Text>
                      </View>
                    </View>
                    {loadingAssign ? (
                      <ActivityIndicator size="small" color="#2ecc71" />
                    ) : (
                      <Icon name="plus-circle" type="font-awesome" size={20} color="#2ecc71" />
                    )}
                  </TouchableOpacity>
                ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  headerLoader: {
    marginLeft: 'auto',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1e293b',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#b0d4f0',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  kelasScroll: {
    marginHorizontal: -4,
  },
  kelasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  kelasButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  kelasButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 6,
  },
  kelasButtonTextActive: {
    color: '#ffffff',
  },
  pengajarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pengajarAvailableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pengajarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pengajarDetails: {
    marginLeft: 12,
    flex: 1,
  },
  pengajarName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  pengajarEmail: {
    fontSize: 12,
    color: '#64748b',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
});

export default ManagePengajarScreen;