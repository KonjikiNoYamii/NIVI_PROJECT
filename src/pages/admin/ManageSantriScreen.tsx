import React, { useEffect, useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  StyleSheet, ActivityIndicator, FlatList, ScrollView, Modal,
  SafeAreaView,
  Platform
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../../services/api";
import { Icon } from 'react-native-elements';

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
    if (!token) throw new Error("Token tidak ditemukan!");
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
      Alert.alert("Error", "Gagal mengambil daftar kelas!");
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
      Alert.alert("Error", "Semua field wajib diisi!");
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
      Alert.alert("Sukses", "Santri berhasil dibuat!");
      setName(""); 
      setEmail(""); 
      setKelasId(null);
      setEditingSantri(null);
      fetchKelas();
    } catch (err: any) {
      console.log(err.response || err.message);
      Alert.alert("Gagal", err.response?.data?.message || "Terjadi kesalahan!");
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
      "Apakah Anda yakin ingin menonaktifkan santri ini?",
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
              Alert.alert("Sukses", "Santri berhasil dinonaktifkan!");
              fetchKelas();
            } catch (err: any) {
              console.log(err.response || err.message);
              Alert.alert("Gagal", "Gagal menonaktifkan santri!");
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
      Alert.alert("Sukses", "Santri berhasil diaktifkan!");
      fetchKelas();
    } catch (err: any) {
      console.log(err.response || err.message);
      Alert.alert("Gagal", "Gagal mengaktifkan santri!");
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
          <View>
            <Text style={styles.title}>Manajemen Santri</Text>
            <Text style={styles.subtitle}>Kelola data santri dengan mudah</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Icon name="users" type="font-awesome" size={20} color="#3498db" />
              <Text style={styles.statNumber}>{getTotalSantri()}</Text>
              <Text style={styles.statLabel}>Total Santri</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="user-check" type="font-awesome" size={20} color="#2ecc71" />
              <Text style={styles.statNumber}>{getActiveSantri()}</Text>
              <Text style={styles.statLabel}>Aktif</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'form' && styles.activeTab]}
            onPress={() => setActiveTab('form')}
          >
            <Icon 
              name={editingSantri ? "edit" : "user-plus"} 
              type="font-awesome" 
              size={16} 
              color={activeTab === 'form' ? '#fff' : '#64748b'} 
            />
            <Text style={[styles.tabText, activeTab === 'form' && styles.activeTabText]}>
              {editingSantri ? "Edit Santri" : "Tambah Santri"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'list' && styles.activeTab]}
            onPress={() => setActiveTab('list')}
          >
            <Icon 
              name="list" 
              type="font-awesome" 
              size={16} 
              color={activeTab === 'list' ? '#fff' : '#64748b'} 
            />
            <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>
              Daftar Kelas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Tambah/Edit Santri */}
        {activeTab === 'form' && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Icon name={editingSantri ? "edit" : "user-plus"} type="font-awesome" size={20} color="#3498db" />
              <Text style={styles.formTitle}>
                {editingSantri ? "Edit Data Santri" : "Tambah Santri Baru"}
              </Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <View style={styles.inputContainer}>
                <Icon name="user" type="font-awesome" size={16} color="#94a3b8" style={styles.inputIcon} />
                <TextInput 
                  placeholder="Masukkan nama santri"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Icon name="envelope" type="font-awesome" size={16} color="#94a3b8" style={styles.inputIcon} />
                <TextInput 
                  placeholder="Masukkan email santri"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pilih Kelas</Text>
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
                      kelasId === k.id && styles.selectedKelasButton
                    ]}
                  >
                    <Icon 
                      name="graduation-cap" 
                      type="font-awesome" 
                      size={14} 
                      color={kelasId === k.id ? "#fff" : "#64748b"} 
                    />
                    <Text style={[
                      styles.kelasButtonText,
                      kelasId === k.id && styles.selectedKelasButtonText
                    ]}>
                      {k.namaKelas}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleCreate} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon 
                    name={editingSantri ? "check" : "plus"} 
                    type="font-awesome" 
                    size={16} 
                    color="#fff" 
                  />
                  <Text style={styles.submitButtonText}>
                    {editingSantri ? "Update Santri" : "Tambah Santri"}
                  </Text>
                </>
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
              >
                <Icon name="times" type="font-awesome" size={16} color="#64748b" />
                <Text style={styles.cancelButtonText}>Batal Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Daftar Kelas */}
        {activeTab === 'list' && (
          <View style={styles.classesCard}>
            <View style={styles.formHeader}>
              <Icon name="graduation-cap" type="font-awesome" size={20} color="#3498db" />
              <Text style={styles.formTitle}>Daftar Kelas</Text>
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
                >
                  <View style={styles.classIconContainer}>
                    <Icon name="users" type="font-awesome" size={24} color="#3498db" />
                  </View>
                  <Text style={styles.className}>{kelas.namaKelas}</Text>
                  <Text style={styles.classCount}>
                    {kelas.santri.length} Santri
                  </Text>
                  <View style={styles.classActiveCount}>
                    <Icon name="user-check" type="font-awesome" size={12} color="#2ecc71" />
                    <Text style={styles.classActiveText}>
                      {kelas.santri.filter(s => s.isActive).length} aktif
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Modal Detail Santri per Kelas */}
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
                >
                  <Icon name="times" type="font-awesome" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Icon name="search" type="font-awesome" size={16} color="#94a3b8" />
                <TextInput
                  placeholder="Cari santri..."
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Icon name="times-circle" type="font-awesome" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Santri List */}
              <FlatList
                data={filteredSantri()}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                style={styles.modalList}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon name="users-slash" type="font-awesome" size={40} color="#e2e8f0" />
                    <Text style={styles.emptyText}>Tidak ada santri ditemukan</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <View style={[
                    styles.santriItem,
                    !item.isActive && styles.inactiveSantriItem
                  ]}>
                    <View style={styles.santriAvatar}>
                      <Icon 
                        name="user" 
                        type="font-awesome" 
                        size={20} 
                        color={item.isActive ? "#3498db" : "#94a3b8"} 
                      />
                    </View>
                    <View style={styles.santriInfo}>
                      <Text style={styles.santriName}>
                        {item.name || item.email}
                        {!item.isActive && (
                          <Text style={styles.inactiveBadge}> (Nonaktif)</Text>
                        )}
                      </Text>
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
                          >
                            <Icon name="edit" type="font-awesome" size={14} color="#3498db" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.deactivateButton}
                            onPress={() => handleDeactivate(item.id)}
                          >
                            <Icon name="ban" type="font-awesome" size={14} color="#e74c3c" />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity 
                          style={styles.activateButton}
                          onPress={() => handleActivate(item.id)}
                        >
                          <Icon name="check-circle" type="font-awesome" size={14} color="#2ecc71" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              />

              <TouchableOpacity 
                style={styles.modalCloseButtonLarge}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#ffffff',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
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
  selectedKelasButton: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  kelasButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 6,
  },
  selectedKelasButtonText: {
    color: '#ffffff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#b0d4f0',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  classesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  classesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  classCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  classIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f4fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  classCount: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  classActiveCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classActiveText: {
    fontSize: 12,
    color: '#2ecc71',
    marginLeft: 4,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    marginBottom: 16,
    paddingRight: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 8,
  },
  modalList: {
    maxHeight: 400,
  },
  santriItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inactiveSantriItem: {
    backgroundColor: '#f1f5f9',
    opacity: 0.8,
  },
  santriAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f4fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  santriInfo: {
    flex: 1,
  },
  santriName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  santriEmail: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  santriDate: {
    fontSize: 10,
    color: '#94a3b8',
  },
  inactiveBadge: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: '600',
  },
  santriActions: {
    flexDirection: 'row',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8f4fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  deactivateButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activateButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 16,
  },
  modalCloseButtonLarge: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManageSantriScreen;