import React, { useEffect, useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  StyleSheet, ActivityIndicator, FlatList, ScrollView, Modal,
  SafeAreaView,
  Platform,
  StatusBar
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../../services/api";

interface Santri {
  id: number;
  name?: string;
  email: string;
  isActive: boolean;
  createdAt?: string;
}

interface Kelas {
  id: number;
  namaKelas: string;
  santri: Santri[];
}

const ManageSantriScreen = () => {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kelasId, setKelasId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);

  const getToken = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Token tidak ditemukan");
    return token;
  };

  // Fetch semua kelas + santri
  const fetchKelas = async () => {
    try {
      setFetching(true);
      const token = await getToken();
      const res = await axios.get(`${API}/kelas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKelasList(res.data.data ?? []);
    } catch (err: any) {
      console.log(err.response || err.message);
      Alert.alert("Error", "Gagal mengambil daftar kelas");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchKelas();
  }, []);

  // Tambah santri
  const handleCreate = async () => {
    if (!name || !email || !kelasId) {
      Alert.alert("Validasi", "Semua field wajib diisi");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      await axios.post(
        `${API}/admin/santri`,
        { name, email, kelasId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Berhasil", "Santri berhasil dibuat");
      setName(""); 
      setEmail(""); 
      setKelasId(null);
      setEditingSantri(null);
      fetchKelas();
    } catch (err: any) {
      console.log(err.response || err.message);
      Alert.alert("Gagal", err.response?.data?.message || "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  // Edit santri
  const handleEdit = (santri: Santri) => {
    setEditingSantri(santri);
    setName(santri.name || "");
    setEmail(santri.email);
    // Set kelasId if available
    setActiveTab('form');
  };

  // Nonaktifkan santri
  const handleDeactivate = async (id: number) => {
    Alert.alert(
      "Konfirmasi",
      "Apakah yakin ingin menonaktifkan santri ini?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Nonaktifkan", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.delete(`${API}/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert("Berhasil", "Santri berhasil dinonaktifkan");
              fetchKelas();
            } catch (err: any) {
              console.log(err.response || err.message);
              Alert.alert("Gagal", "Gagal menonaktifkan santri");
            }
          }
        }
      ]
    );
  };

  // Aktifkan kembali santri
  const handleActivate = async (id: number) => {
    try {
      const token = await getToken();
      await axios.put(
        `${API}/users/${id}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Berhasil", "Santri berhasil diaktifkan");
      fetchKelas();
    } catch (err: any) {
      console.log(err.response || err.message);
      Alert.alert("Gagal", "Gagal mengaktifkan santri");
    }
  };

  // Filter santri berdasarkan search query
  const filteredSantri = () => {
    if (!selectedKelasId) return [];
    const kelas = kelasList.find(k => k.id === selectedKelasId);
    if (!kelas) return [];
    
    return kelas.santri.filter(santri => 
      santri.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      santri.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getTotalSantri = () => {
    return kelasList.reduce((total, kelas) => total + kelas.santri.length, 0);
  };

  const getActiveSantri = () => {
    return kelasList.reduce((total, kelas) => 
      total + kelas.santri.filter(s => s.isActive).length, 0
    );
  };

  if (fetching) {
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
        <Text style={styles.headerTitle}>Manajemen Santri</Text>
        <Text style={styles.headerSubtitle}>
          Kelola data santri dengan mudah
        </Text>
      </View>

      {/* FORM CARD */}
      <View style={styles.card}>
        <Text style={styles.label}>Nama Lengkap</Text>
        <TextInput
          placeholder="Masukkan nama santri"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
          style={styles.input}
          editable={!loading}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Masukkan email santri"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          editable={!loading}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Pilih Kelas</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.kelasScroll}
        >
          {kelasList.map(k => (
            <TouchableOpacity
              key={k.id}
              onPress={() => setKelasId(k.id)}
              style={[
                styles.kelasButton,
                kelasId === k.id && styles.kelasButtonActive
              ]}
            >
              <Text style={[
                styles.kelasButtonText,
                kelasId === k.id && styles.kelasButtonTextActive
              ]}>
                {k.namaKelas}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.button, loading && styles.disabled]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {editingSantri ? "UPDATE SANTRI" : "TAMBAH SANTRI"}
            </Text>
          )}
        </TouchableOpacity>

        {editingSantri && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => {
              setEditingSantri(null);
              setName("");
              setEmail("");
              setKelasId(null);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelButtonText}>Batal Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* KELAS LIST CARD */}
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Daftar Kelas</Text>
        
        <View style={styles.classesGrid}>
          {kelasList.map(kelas => (
            <TouchableOpacity
              key={kelas.id}
              style={styles.classCard}
              onPress={() => {
                setSelectedKelasId(kelas.id);
                setModalVisible(true);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.classIconContainer}>
                <Text style={styles.classIconText}>
                  {kelas.namaKelas.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.className}>{kelas.namaKelas}</Text>
              <Text style={styles.classCount}>
                {kelas.santri.length} Santri
              </Text>
              <Text style={styles.classActiveCount}>
                {kelas.santri.filter(s => s.isActive).length} aktif
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* MODAL DETAIL SANTRI */}
      <Modal 
        visible={modalVisible} 
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {kelasList.find(k => k.id === selectedKelasId)?.namaKelas}
              </Text>
              <Text style={styles.modalSubtitle}>
                Daftar Santri ({filteredSantri().length} orang)
              </Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* SEARCH INPUT */}
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Cari santri..."
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* SANTRI LIST */}
            <FlatList
              data={filteredSantri()}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              style={styles.modalList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Tidak ada santri ditemukan</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={[
                  styles.santriItem,
                  !item.isActive && styles.inactiveSantriItem
                ]}>
                  <View style={styles.santriInfo}>
                    <View style={styles.santriHeader}>
                      <Text style={styles.santriName}>
                        {item.name || item.email}
                        {!item.isActive && (
                          <Text style={styles.inactiveBadge}> (Nonaktif)</Text>
                        )}
                      </Text>
                    </View>
                    <Text style={styles.santriEmail}>{item.email}</Text>
                    {item.createdAt && (
                      <Text style={styles.santriDate}>
                        Bergabung: {new Date(item.createdAt).toLocaleDateString('id-ID')}
                      </Text>
                    )}
                  </View>
                  <View style={styles.santriActions}>
                    {item.isActive ? (
                      <>
                        <TouchableOpacity 
                          style={styles.editButton}
                          onPress={() => {
                            setModalVisible(false);
                            handleEdit(item);
                          }}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.deactivateButton}
                          onPress={() => handleDeactivate(item.id)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.deactivateButtonText}>Nonaktifkan</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity 
                        style={styles.activateButton}
                        onPress={() => handleActivate(item.id)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.activateButtonText}>Aktifkan</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />

            <TouchableOpacity 
              style={styles.modalCloseButtonLarge}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCloseText}>TUTUP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  kelasScroll: {
    marginHorizontal: -4,
    marginBottom: 16,
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

  cancelButton: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cancelButtonText: {
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "600",
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

  classesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  classCard: {
    width: "48%",
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  classIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  classIconText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2563eb",
  },

  className: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2933",
    marginBottom: 4,
    textAlign: "center",
  },

  classCount: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
  },

  classActiveCount: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },

  modalHeader: {
    marginBottom: 16,
    paddingRight: 40,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },

  modalCloseButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  modalCloseButtonText: {
    fontSize: 24,
    color: "#6b7280",
    fontWeight: "700",
  },

  searchContainer: {
    marginBottom: 16,
  },

  searchInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#111827",
  },

  modalList: {
    maxHeight: 400,
  },

  santriItem: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  inactiveSantriItem: {
    backgroundColor: "#f3f4f6",
    opacity: 0.8,
  },

  santriInfo: {
    marginBottom: 12,
  },

  santriHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  santriName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2933",
  },

  santriEmail: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
  },

  santriDate: {
    fontSize: 12,
    color: "#9ca3af",
  },

  inactiveBadge: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },

  santriActions: {
    flexDirection: "row",
    gap: 8,
  },

  editButton: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  editButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563eb",
  },

  deactivateButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  deactivateButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ef4444",
  },

  activateButton: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  activateButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10b981",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
  },

  modalCloseButtonLarge: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },

  modalCloseText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});

export default ManageSantriScreen;