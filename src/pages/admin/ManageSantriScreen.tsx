import React, { useEffect, useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  StyleSheet, ActivityIndicator, FlatList, ScrollView, Modal,
  SafeAreaView,
  Platform,
  StatusBar,
  RefreshControl
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../../services/api";
import Ionicons from "@react-native-vector-icons/ionicons";

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
  const [refreshing, setRefreshing] = useState(false);

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
      const token = await getToken();
      const res = await axios.get(`${API}/kelas/all/santri`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKelasList(res.data.data ?? []);
    } catch (err: any) {
      console.log(err.response || err.message);
      Alert.alert("Error", "Gagal mengambil daftar kelas");
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  };

  const loadData = () => {
    fetchKelas();
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

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

  

  const handleUpdate = async () => {
  if (!editingSantri) return;

  if (!name || !email || !kelasId) {
    Alert.alert("Validasi", "Semua field wajib diisi");
    return;
  }

  try {
    setLoading(true);
    const token = await getToken();

    await axios.put(
      `${API}/users/${editingSantri.id}`,
      {
        name,
        email,
        kelasId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    Alert.alert("Berhasil", "Santri berhasil diperbarui");

    setName("");
    setEmail("");
    setKelasId(null);
    setEditingSantri(null);
    fetchKelas();
  } catch (err: any) {
    console.log(err.response || err.message);
    Alert.alert(
      "Gagal",
      err.response?.data?.message || "Gagal memperbarui santri"
    );
  } finally {
    setLoading(false);
  }
};

  // Edit santri
  const handleEdit = (santri: Santri) => {
  setEditingSantri(santri);
  setName(santri.name || "");
  setEmail(santri.email);
  setKelasId(selectedKelasId); // 🔥 WAJIB
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
        `${API}/users/${id}/activate/santri`,
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

  if (fetching && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Manajemen Santri</Text>
        <Text style={styles.headerSubtitle}>
          Kelola data santri dengan mudah
        </Text>
      </View>
    </View>
  );

  const renderContent = () => (
    <>
      {/* FORM CARD */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {editingSantri ? "Edit Santri" : "Tambah Santri Baru"}
          </Text>
          <Text style={styles.cardSubtitle}>
            {editingSantri ? "Perbarui data santri" : "Tambahkan santri baru ke sistem"}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput
            placeholder="Masukkan nama santri"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
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
        </View>

        <View style={styles.formGroup}>
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
                activeOpacity={0.85}
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
        </View>

        <TouchableOpacity
  style={[styles.button, loading && styles.disabled]}
  onPress={editingSantri ? handleUpdate : handleCreate}
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
        <View style={styles.listCardHeader}>
          <Text style={styles.listTitle}>Daftar Kelas</Text>
          <Text style={styles.listSubtitle}>
            {kelasList.length} kelas • {getTotalSantri()} santri ({getActiveSantri()} aktif)
          </Text>
        </View>
        
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
              <View style={[
                styles.classIconContainer,
                { backgroundColor: `#${((kelas.id * 30) % 255).toString(16).padStart(2, '0')}${((kelas.id * 60) % 255).toString(16).padStart(2, '0')}${((kelas.id * 90) % 255).toString(16).padStart(2, '0')}20` }
              ]}>
<Ionicons name="school-outline" size={20} />
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

      {/* SPACER UNTUK NAVIGATOR */}
      <View style={styles.spacer} />
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderContent()}
      </ScrollView>

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
    </SafeAreaView>
  );
};

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  
  scrollView: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  
  scrollContent: {
    paddingBottom: 10, // Spacer untuk navigator
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },

  /* HEADER - SEKARANG DALAM SCROLLVIEW */
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "android" ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
  },
  
  headerContent: {
    flex: 1,
  },
  
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  
  headerSubtitle: {
    marginTop: 6,
    color: "#c7d2fe",
    fontSize: 14,
  },

  /* FORM CARD */
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  
  cardHeader: {
    marginBottom: 20,
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  
  cardSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },

  /* FORM ELEMENTS */
  formGroup: {
    marginBottom: 20,
  },
  
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
  },
  
  kelasScroll: {
    marginHorizontal: -4,
  },
  
  kelasButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  
  kelasButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  
  kelasButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },
  
  kelasButtonTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  /* BUTTONS */
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  
  disabled: {
    opacity: 0.7,
  },
  
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  
  cancelButton: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  
  cancelButtonText: {
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "600",
  },

  /* KELAS LIST CARD */
  listCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  
  listCardHeader: {
    marginBottom: 20,
  },
  
  listTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  
  listSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },

  /* CLASS GRID */
  classesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  
  classCard: {
    width: "48%",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  
  classIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  
  classIconText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2563eb",
  },
  
  className: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2933",
    marginBottom: 6,
    textAlign: "center",
  },
  
  classCount: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  
  classActiveCount: {
    fontSize: 13,
    color: "#10b981",
    fontWeight: "600",
  },

  /* MODAL STYLES */
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

  /* SANTRI ITEM STYLES */
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

  /* EMPTY STATES */
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

  /* MODAL CLOSE BUTTON */
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

  /* SPACER UNTUK NAVIGATOR */
  spacer: {
    height: 100,
  },
});

export default ManageSantriScreen;