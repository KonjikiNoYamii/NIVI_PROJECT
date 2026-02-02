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
import Icon from 'react-native-vector-icons/FontAwesome';

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

// ================ CUSTOM ALERT MODAL ================
interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

const CustomAlertModal: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type,
  confirmText = "OK",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  onClose
}) => {
  const getIcon = () => {
    switch(type) {
      case 'success': 
        return <Icon name="check-circle" size={64} color="#10b981" />;
      case 'error': 
        return <Icon name="exclamation-circle" size={64} color="#ef4444" />;
      case 'warning': 
        return <Icon name="exclamation-triangle" size={64} color="#f59e0b" />;
      case 'info': 
        return <Icon name="info-circle" size={64} color="#3b82f6" />;
      default: 
        return <Icon name="info-circle" size={64} color="#3b82f6" />;
    }
  };

  const getTitleColor = () => {
    switch(type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#111827';
    }
  };

  const getButtonColor = () => {
    switch(type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#2563eb';
    }
  };

  const getIconContainerStyle = () => {
    switch(type) {
      case 'success': return customAlertStyles.iconContainerSuccess;
      case 'error': return customAlertStyles.iconContainerError;
      case 'warning': return customAlertStyles.iconContainerWarning;
      case 'info': return customAlertStyles.iconContainerInfo;
      default: return customAlertStyles.iconContainerInfo;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={customAlertStyles.overlay}>
        <View style={customAlertStyles.container}>
          <View style={customAlertStyles.content}>
            <View style={[customAlertStyles.iconContainer, getIconContainerStyle()]}>
              {getIcon()}
            </View>
            
            <Text style={[customAlertStyles.title, { color: getTitleColor() }]}>
              {title}
            </Text>
            
            <Text style={customAlertStyles.message}>
              {message}
            </Text>
            
            <View style={customAlertStyles.buttonContainer}>
              {onCancel && (
                <TouchableOpacity 
                  style={[customAlertStyles.button, customAlertStyles.cancelButton]}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <Icon name="times" size={16} color="#6b7280" style={customAlertStyles.buttonIcon} />
                  <Text style={customAlertStyles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[customAlertStyles.button, { backgroundColor: getButtonColor() }]}
                onPress={onConfirm || onClose}
                activeOpacity={0.7}
              >
                {type === 'success' && <Icon name="check" size={16} color="#ffffff" style={customAlertStyles.buttonIcon} />}
                {type === 'error' && <Icon name="exclamation-circle" size={16} color="#ffffff" style={customAlertStyles.buttonIcon} />}
                {type === 'warning' && <Icon name="exclamation-triangle" size={16} color="#ffffff" style={customAlertStyles.buttonIcon} />}
                {type === 'info' && <Icon name="info-circle" size={16} color="#ffffff" style={customAlertStyles.buttonIcon} />}
                <Text style={customAlertStyles.buttonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const customAlertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  content: {
    padding: 28,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
  },
  iconContainerSuccess: {
    backgroundColor: '#d1fae5',
    borderColor: '#a7f3d0',
  },
  iconContainerError: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  iconContainerWarning: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  iconContainerInfo: {
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    letterSpacing: 0.2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginRight: 4,
  },
});

// ================ CUSTOM ALERT HELPER ================
const useCustomAlert = () => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning',
    confirmText: 'OK',
    cancelText: 'Batal',
    onConfirm: undefined as (() => void) | undefined,
    onCancel: undefined as (() => void) | undefined,
    showCancel: false,
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    options?: {
      confirmText?: string;
      cancelText?: string;
      onConfirm?: () => void;
      onCancel?: () => void;
      showCancel?: boolean;
    }
  ) => {
    setAlertConfig({
      title,
      message,
      type,
      confirmText: options?.confirmText || 'OK',
      cancelText: options?.cancelText || 'Batal',
      onConfirm: options?.onConfirm,
      onCancel: options?.onCancel,
      showCancel: options?.showCancel || false,
    });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const AlertComponent = () => (
    <CustomAlertModal
      visible={alertVisible}
      title={alertConfig.title}
      message={alertConfig.message}
      type={alertConfig.type}
      confirmText={alertConfig.confirmText}
      cancelText={alertConfig.cancelText}
      onConfirm={() => {
        alertConfig.onConfirm?.();
        hideAlert();
      }}
      onCancel={() => {
        alertConfig.onCancel?.();
        hideAlert();
      }}
      onClose={hideAlert}
    />
  );

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
};

// ================ MODIFIED ALERT HELPER ================
const createAlertHelper = () => {
  // Inisialisasi custom alert hook
  let alertHook: ReturnType<typeof useCustomAlert> | null = null;
  
  const AlertProvider = () => {
    alertHook = useCustomAlert();
    return alertHook.AlertComponent();
  };

  const getAlertHook = () => {
    if (!alertHook) {
      throw new Error('AlertProvider must be rendered before using alert helpers');
    }
    return alertHook;
  };

  return {
    AlertProvider,
    showAlert: {
      success: (title: string, message: string, onPress?: () => void) => {
        getAlertHook().showAlert(
          title,
          message,
          'success',
          { onConfirm: onPress }
        );
      },

      error: (title: string, message: string) => {
        getAlertHook().showAlert(
          title,
          message,
          'error'
        );
      },

      validation: (message: string) => {
        getAlertHook().showAlert(
          "Validasi",
          message,
          'info'
        );
      },

      confirmDeactivate: (onConfirm: () => void) => {
        getAlertHook().showAlert(
          "Konfirmasi",
          "Apakah Anda yakin ingin menonaktifkan santri ini? Santri yang dinonaktifkan tidak dapat mengakses aplikasi.",
          'warning',
          {
            confirmText: 'Nonaktifkan',
            cancelText: 'Batal',
            onConfirm,
            onCancel: () => {},
            showCancel: true,
          }
        );
      },

      confirmActivate: (onConfirm: () => void) => {
        getAlertHook().showAlert(
          "Konfirmasi",
          "Aktifkan kembali santri ini? Santri akan dapat mengakses aplikasi kembali.",
          'info',
          {
            confirmText: 'Aktifkan',
            cancelText: 'Batal',
            onConfirm,
            onCancel: () => {},
            showCancel: true,
          }
        );
      }
    }
  };
};

const { AlertProvider, showAlert } = createAlertHelper();

// ================ MAIN COMPONENT ================
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
      const res = await axios.get(`${API}/kelas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKelasList(res.data.data ?? []);
    } catch (err: any) {
      console.log(err.response || err.message);
      showAlert.error(
        "Gagal Memuat Data", 
        "Terjadi kesalahan saat mengambil daftar kelas. Silakan coba lagi."
      );
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
      showAlert.validation("Semua field wajib diisi untuk menambahkan santri baru.");
      return;
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert.validation("Format email tidak valid. Harap masukkan email yang benar.");
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
      
      showAlert.success(
        "Berhasil", 
        `${editingSantri ? 'Data santri berhasil diperbarui' : 'Santri baru berhasil ditambahkan'}`,
        () => {
          setName(""); 
          setEmail(""); 
          setKelasId(null);
          setEditingSantri(null);
          fetchKelas();
        }
      );
    } catch (err: any) {
      console.log(err.response || err.message);
      const errorMessage = err.response?.data?.message || "Terjadi kesalahan server. Silakan coba lagi.";
      
      if (err.response?.status === 409) {
        showAlert.error("Email Sudah Terdaftar", "Email ini sudah digunakan oleh santri lain.");
      } else {
        showAlert.error("Gagal Menyimpan", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Edit santri
  const handleEdit = (santri: Santri) => {
    setEditingSantri(santri);
    setName(santri.name || "");
    setEmail(santri.email);
    
    // Cari kelas dari santri
    for (const kelas of kelasList) {
      if (kelas.santri.some(s => s.id === santri.id)) {
        setKelasId(kelas.id);
        break;
      }
    }
  };

  // Nonaktifkan santri
  const handleDeactivate = async (id: number) => {
    showAlert.confirmDeactivate(async () => {
      try {
        const token = await getToken();
        await axios.delete(`${API}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showAlert.success(
          "Berhasil Dinonaktifkan", 
          "Santri telah berhasil dinonaktifkan dan tidak dapat mengakses aplikasi."
        );
        fetchKelas();
      } catch (err: any) {
        console.log(err.response || err.message);
        showAlert.error(
          "Gagal Menonaktifkan", 
          "Terjadi kesalahan saat menonaktifkan santri. Silakan coba lagi."
        );
      }
    });
  };

  // Aktifkan kembali santri
  const handleActivate = async (id: number) => {
    showAlert.confirmActivate(async () => {
      try {
        const token = await getToken();
        await axios.put(
          `${API}/users/${id}/activate`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showAlert.success(
          "Berhasil Diaktifkan", 
          "Santri telah berhasil diaktifkan dan dapat mengakses aplikasi kembali."
        );
        fetchKelas();
      } catch (err: any) {
        console.log(err.response || err.message);
        showAlert.error(
          "Gagal Mengaktifkan", 
          "Terjadi kesalahan saat mengaktifkan santri. Silakan coba lagi."
        );
      }
    });
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
          <Text style={styles.loadingText}>Memuat data santri...</Text>
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
            {editingSantri ? "Perbarui data santri yang ada" : "Tambahkan santri baru ke sistem"}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nama Lengkap <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="Masukkan nama lengkap santri"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Email <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="contoh: santri@pesantren.com"
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
          <Text style={styles.label}>
            Pilih Kelas <Text style={styles.required}>*</Text>
          </Text>
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
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name={editingSantri ? "user-edit" : "user-plus"} size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>
                {editingSantri ? "UPDATE SANTRI" : "TAMBAH SANTRI"}
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
            activeOpacity={0.85}
          >
            <Icon name="times-circle" size={16} color="#6b7280" style={styles.cancelButtonIcon} />
            <Text style={styles.cancelButtonText}>Batalkan Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* KELAS LIST CARD */}
      <View style={styles.listCard}>
        <View style={styles.listCardHeader}>
          <View style={styles.listHeaderTitleContainer}>
            <Icon name="users" size={22} color="#2563eb" style={styles.listHeaderIcon} />
            <Text style={styles.listTitle}>Daftar Kelas</Text>
          </View>
          <Text style={styles.listSubtitle}>
            {kelasList.length} kelas • {getTotalSantri()} santri ({getActiveSantri()} aktif)
          </Text>
        </View>
        
        {kelasList.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="folder-open" size={44} color="#9ca3af" />
            <Text style={styles.emptyStateText}>Belum ada kelas tersedia</Text>
            <Text style={styles.emptyStateSubtext}>Tambahkan kelas terlebih dahulu</Text>
          </View>
        ) : (
          <View style={styles.classesGrid}>
            {kelasList.map(kelas => (
              <TouchableOpacity
                key={kelas.id}
                style={styles.classCard}
                onPress={() => {
                  setSelectedKelasId(kelas.id);
                  setModalVisible(true);
                  setSearchQuery(""); // Reset search saat modal dibuka
                }}
                activeOpacity={0.85}
              >
                <View style={[
                  styles.classIconContainer,
                  { backgroundColor: `#${((kelas.id * 30) % 255).toString(16).padStart(2, '0')}${((kelas.id * 60) % 255).toString(16).padStart(2, '0')}${((kelas.id * 90) % 255).toString(16).padStart(2, '0')}20` }
                ]}>
                  <Icon name="graduation-cap" size={26} color="#2563eb" />
                </View>
                <Text style={styles.className}>{kelas.namaKelas}</Text>
                <View style={styles.classCountContainer}>
                  <Icon name="user" size={12} color="#6b7280" style={styles.classCountIcon} />
                  <Text style={styles.classCount}>
                    {kelas.santri.length} Santri
                  </Text>
                </View>
                <Text style={[
                  styles.classActiveCount,
                  { color: kelas.santri.filter(s => s.isActive).length === 0 ? "#ef4444" : "#10b981" }
                ]}>
                  {kelas.santri.filter(s => s.isActive).length} aktif
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* SPACER UNTUK NAVIGATOR */}
      <View style={styles.spacer} />
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* Render Alert Provider */}
      <AlertProvider />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
            title="Menyegarkan..."
            titleColor="#2563eb"
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
              <View>
                <View style={styles.modalTitleContainer}>
                  <Icon name="users" size={22} color="#2563eb" style={styles.modalTitleIcon} />
                  <Text style={styles.modalTitle}>
                    {kelasList.find(k => k.id === selectedKelasId)?.namaKelas}
                  </Text>
                </View>
                <Text style={styles.modalSubtitle}>
                  Daftar Santri ({filteredSantri().length} orang)
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.85}
              >
                <Icon name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* SEARCH INPUT */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={18} color="#9ca3af" style={styles.searchIcon} />
              <TextInput
                placeholder="Cari santri (nama atau email)..."
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
              contentContainerStyle={styles.modalListContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="user-times" size={60} color="#d1d5db" />
                  <Text style={styles.emptyText}>Tidak ada santri ditemukan</Text>
                  <Text style={styles.emptySubtext}>
                    {searchQuery ? 'Coba kata kunci lain' : 'Kelas ini belum memiliki santri'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={[
                  styles.santriItem,
                  !item.isActive && styles.inactiveSantriItem
                ]}>
                  <View style={[
                    styles.santriAvatar,
                    !item.isActive && styles.inactiveSantriAvatar
                  ]}>
                    <Icon 
                      name={item.isActive ? "user" : "user-o"} 
                      size={22} 
                      color={item.isActive ? "#2563eb" : "#9ca3af"} 
                    />
                  </View>
                  <View style={styles.santriInfo}>
                    <View style={styles.santriHeader}>
                      <Text style={styles.santriName}>
                        {item.name || item.email}
                        {!item.isActive && (
                          <Text style={styles.inactiveBadge}> • Nonaktif</Text>
                        )}
                      </Text>
                    </View>
                    <View style={styles.santriEmailContainer}>
                      <Icon name="envelope" size={12} color="#6b7280" style={styles.santriEmailIcon} />
                      <Text style={styles.santriEmail}>{item.email}</Text>
                    </View>
                    {item.createdAt && (
                      <View style={styles.santriDateContainer}>
                        <Icon name="calendar" size={11} color="#9ca3af" style={styles.santriDateIcon} />
                        <Text style={styles.santriDate}>
                          Bergabung: {new Date(item.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.santriActions}>
                    {item.isActive ? (
                      <>
                        <TouchableOpacity 
                          style={styles.editButton}
                          onPress={() => {
                            setModalVisible(false);
                            setTimeout(() => handleEdit(item), 300); // Delay untuk animasi modal
                          }}
                          activeOpacity={0.85}
                        >
                          <Icon name="pencil" size={14} color="#2563eb" style={styles.actionIcon} />
                          <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.deactivateButton}
                          onPress={() => handleDeactivate(item.id)}
                          activeOpacity={0.85}
                        >
                          <Icon name="user-times" size={14} color="#ef4444" style={styles.actionIcon} />
                          <Text style={styles.deactivateButtonText}>Nonaktifkan</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity 
                        style={styles.activateButton}
                        onPress={() => handleActivate(item.id)}
                        activeOpacity={0.85}
                      >
                        <Icon name="user-plus" size={14} color="#10b981" style={styles.actionIcon} />
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
              <Icon name="times" size={18} color="#fff" style={styles.modalCloseIcon} />
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
    paddingBottom: 100,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 20,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },

  /* HEADER */
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
    letterSpacing: 0.5,
  },
  
  headerSubtitle: {
    marginTop: 6,
    color: "#c7d2fe",
    fontSize: 14,
    fontWeight: "400",
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
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  
  cardHeader: {
    marginBottom: 24,
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  
  cardSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
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
    letterSpacing: 0.2,
  },

  required: {
    color: "#ef4444",
    fontWeight: "700",
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
    fontWeight: "500",
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  
  kelasButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOpacity: 0.2,
  },
  
  kelasButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    letterSpacing: 0.2,
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
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#2563eb",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    flexDirection: "row",
    gap: 8,
  },
  
  buttonIcon: {
    marginRight: 4,
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
    justifyContent: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    gap: 6,
  },
  
  cancelButtonIcon: {
    marginRight: 2,
  },
  
  cancelButtonText: {
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
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
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  
  listCardHeader: {
    marginBottom: 24,
  },
  
  listHeaderTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  
  listHeaderIcon: {
    marginRight: 8,
  },
  
  listTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.3,
  },
  
  listSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
    marginTop: 12,
  },

  emptyStateSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "400",
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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  
  classIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  
  className: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2933",
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  
  classCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  
  classCountIcon: {
    marginRight: 4,
  },
  
  classCount: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  
  classActiveCount: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
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
    marginBottom: 20,
    paddingRight: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  
  modalTitleIcon: {
    marginRight: 8,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 0.3,
  },
  
  modalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
  },
  
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  
  searchContainer: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  
  searchIcon: {
    marginRight: 8,
  },
  
  searchInput: {
    flex: 1,
    padding: 14,
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  
  modalList: {
    maxHeight: 400,
  },

  modalListContent: {
    paddingBottom: 10,
  },

  /* SANTRI ITEM STYLES */
  santriItem: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  
  inactiveSantriItem: {
    backgroundColor: "#f3f4f6",
    opacity: 0.9,
  },
  
  santriAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#bfdbfe",
  },

  inactiveSantriAvatar: {
    backgroundColor: "#e5e7eb",
    borderColor: "#d1d5db",
  },
  
  santriInfo: {
    flex: 1,
    marginRight: 12,
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
    letterSpacing: 0.2,
  },
  
  santriEmailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  
  santriEmailIcon: {
    marginRight: 4,
  },
  
  santriEmail: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "400",
  },
  
  santriDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  santriDateIcon: {
    marginRight: 4,
  },
  
  santriDate: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "400",
    fontStyle: "italic",
  },
  
  inactiveBadge: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  
  santriActions: {
    flexDirection: "column",
    gap: 8,
    minWidth: 100,
  },
  
  editButton: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  
  actionIcon: {
    marginRight: 2,
  },
  
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
    letterSpacing: 0.2,
  },
  
  deactivateButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  
  deactivateButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
    letterSpacing: 0.2,
  },
  
  activateButton: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  
  activateButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
    letterSpacing: 0.2,
  },

  /* EMPTY STATES */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    color: "#9ca3af",
  },
  
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 16,
  },

  emptySubtext: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "400",
  },

  /* MODAL CLOSE BUTTON */
  modalCloseButtonLarge: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#2563eb",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    flexDirection: "row",
    gap: 8,
  },
  
  modalCloseIcon: {
    marginRight: 4,
  },
  
  modalCloseText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.5,
    fontSize: 14,
  },

  /* SPACER UNTUK NAVIGATOR */
  spacer: {
    height: 100,
  },
});

export default ManageSantriScreen;