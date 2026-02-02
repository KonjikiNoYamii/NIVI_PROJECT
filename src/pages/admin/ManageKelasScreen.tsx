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
  SafeAreaView,
  RefreshControl,
  Modal,
  Dimensions,
} from "react-native";
import axios from "axios";
import { API } from "../../services/api";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

/* =======================
   INTERFACE
======================= */
interface Kelas {
  id: number;
  namaKelas: string;
  deskripsi?: string;
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
        return <FontAwesomeIcon name="check-circle" size={64} color="#10b981" />;
      case 'error': 
        return <FontAwesomeIcon name="exclamation-circle" size={64} color="#ef4444" />;
      case 'warning': 
        return <FontAwesomeIcon name="exclamation-triangle" size={64} color="#f59e0b" />;
      case 'info': 
        return <FontAwesomeIcon name="info-circle" size={64} color="#3b82f6" />;
      default: 
        return <FontAwesomeIcon name="info-circle" size={64} color="#3b82f6" />;
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
                  <FontAwesomeIcon name="times" size={16} color="#6b7280" style={customAlertStyles.buttonIcon} />
                  <Text 
                    style={customAlertStyles.cancelButtonText}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[customAlertStyles.button, { backgroundColor: getButtonColor() }]}
                onPress={onConfirm || onClose}
                activeOpacity={0.7}
              >
                {type === 'success' && <FontAwesomeIcon name="check" size={16} color="#ffffff" style={customAlertStyles.buttonIcon} />}
                {type === 'error' && <FontAwesomeIcon name="exclamation-circle" size={16} color="#ffffff" style={customAlertStyles.buttonIcon} />}
                {type === 'warning' && <FontAwesomeIcon name="exclamation-triangle" size={16} color="#ffffff" style={customAlertStyles.buttonIcon} />}
                {type === 'info' && <FontAwesomeIcon name="info-circle" size={16} color="#ffffff" style={customAlertStyles.buttonIcon} />}
                <Text 
                  style={customAlertStyles.buttonText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {confirmText}
                </Text>
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
    overflow: 'hidden',
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
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
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
    paddingHorizontal: 8, // Menambahkan padding horizontal
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
    fontSize: 15, // Mengurangi font size
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
    flexShrink: 1, // Memungkinkan teks menyusut
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 15, // Mengurangi font size
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
    flexShrink: 1, // Memungkinkan teks menyusut
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

  const showAlertHelper = {
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

    confirm: (
      title: string,
      message: string,
      onConfirm: () => void,
      options?: {
        confirmText?: string;
        cancelText?: string;
        type?: 'success' | 'error' | 'info' | 'warning';
      }
    ) => {
      getAlertHook().showAlert(
        title,
        message,
        options?.type || 'info',
        {
          confirmText: options?.confirmText || 'Konfirmasi',
          cancelText: options?.cancelText || 'Batal',
          onConfirm,
          onCancel: () => {},
          showCancel: true,
        }
      );
    },

    info: (title: string, message: string, onPress?: () => void) => {
      getAlertHook().showAlert(
        title,
        message,
        'info',
        { onConfirm: onPress }
      );
    },

    warning: (title: string, message: string, onPress?: () => void) => {
      getAlertHook().showAlert(
        title,
        message,
        'warning',
        { onConfirm: onPress }
      );
    }
  };

  return {
    AlertProvider,
    showAlert: showAlertHelper,
  };
};

const { AlertProvider, showAlert } = createAlertHelper();

/* =======================
   COMPONENT
======================= */
const ManageKelasScreen = () => {
  const [namaKelas, setNamaKelas] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ================= FETCH KELAS ================= */
  const fetchKelas = async () => {
    try {
      setLoadingList(true);
      const res = await axios.get(`${API}/kelas`);
      setKelasList(res.data.data || []);
    } catch (err: any) {
      console.log(err.response || err.message);
      showAlert.error(
        "Gagal Memuat Data", 
        "Tidak dapat mengambil data kelas. Periksa koneksi internet Anda."
      );
    } finally {
      setLoadingList(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKelas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchKelas();
  };

  /* ================= CREATE KELAS ================= */
  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!namaKelas.trim()) {
      showAlert.validation("Nama kelas wajib diisi.");
      return;
    }

    if (namaKelas.trim().length < 3) {
      showAlert.validation("Nama kelas minimal 3 karakter.");
      return;
    }

    showAlert.confirm(
      "Buat Kelas Baru",
      "Anda akan membuat kelas baru. Pastikan data sudah benar.",
      async () => {
        setLoading(true);
        try {
          await axios.post(`${API}/kelas`, { namaKelas, deskripsi });
          showAlert.success(
            "Berhasil Dibuat",
            `Kelas "${namaKelas}" berhasil ditambahkan.`,
            () => {
              setNamaKelas("");
              setDeskripsi("");
              fetchKelas();
            }
          );
        } catch (error: any) {
          console.log(error.response || error.message);
          const errorMessage = error.response?.data?.message ?? "Terjadi kesalahan server. Silakan coba lagi.";
          
          if (error.response?.status === 409) {
            showAlert.error(
              "Nama Kelas Sudah Ada",
              "Nama kelas ini sudah digunakan. Silakan gunakan nama yang berbeda."
            );
          } else if (error.response?.status === 400) {
            showAlert.error(
              "Data Tidak Valid",
              errorMessage
            );
          } else {
            showAlert.error(
              "Gagal Membuat Kelas",
              errorMessage
            );
          }
        } finally {
          setLoading(false);
        }
      },
      {
        confirmText: "Buat Sekarang",
        cancelText: "Periksa Kembali",
        type: "info"
      }
    );
  };

  /* ================= DELETE KELAS ================= */
  const handleDelete = (id: number, namaKelas: string) => {
    showAlert.confirm(
      "Konfirmasi Penghapusan",
      `Apakah Anda yakin ingin menghapus kelas "${namaKelas}"?`,
      async () => {
        try {
          await axios.delete(`${API}/kelas/${id}`);
          showAlert.success(
            "Berhasil Dihapus",
            `Kelas "${namaKelas}" telah dihapus dari sistem.`,
            () => fetchKelas()
          );
        } catch (err: any) {
          console.log(err.response || err.message);
          const errorMessage = err.response?.data?.message ?? "Tidak bisa menghapus kelas.";
          showAlert.error(
            "Gagal Menghapus",
            errorMessage
          );
        }
      },
      {
        confirmText: "Hapus",
        cancelText: "Batal",
        type: "warning"
      }
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Manajemen Kelas</Text>
      <Text style={styles.headerSubtitle}>
        Kelola data kelas desa belajar
      </Text>
    </View>
  );

  const renderContent = () => (
    <>
      {/* FORM CARD */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <FontAwesomeIcon
              name="plus-circle"
              size={16}
              color="#2563eb"
              style={styles.cardTitleIcon}
            />
            <Text style={styles.cardTitle}>Buat Kelas Baru</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Tambahkan kelas baru ke sistem
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nama Kelas <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="Contoh: Angkatan 22"
            placeholderTextColor="#9ca3af"
            value={namaKelas}
            onChangeText={setNamaKelas}
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
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
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.disabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <View style={styles.buttonLoading}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.buttonLoadingText}>Membuat...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <FontAwesomeIcon
                name="save"
                size={14}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>BUAT KELAS</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* LIST KELAS CARD */}
      <View style={styles.listCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <FontAwesomeIcon
              name="list-alt"
              size={16}
              color="#059669"
              style={styles.cardTitleIcon}
            />
            <Text style={styles.cardTitle}>Daftar Kelas</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            {kelasList.length} kelas tersedia
          </Text>
        </View>

        {loadingList ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#2563eb" size="small" />
            <Text style={styles.loadingText}>Memuat data kelas...</Text>
          </View>
        ) : kelasList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesomeIcon
              name="school"
              size={24}
              color="#d1d5db"
            />
            <Text style={styles.emptyText}>Belum ada kelas</Text>
            <Text style={styles.emptySubtext}>Mulai dengan membuat kelas pertama</Text>
          </View>
        ) : (
          <View style={styles.kelasList}>
            {kelasList.map((kelas) => (
              <View key={kelas.id} style={styles.kelasItem}>
                <View style={styles.kelasContent}>
                  <View style={styles.kelasIcon}>
                    <FontAwesomeIcon
                      name="users"
                      size={16}
                      color="#2563eb"
                    />
                  </View>
                  <View style={styles.kelasInfo}>
                    <Text style={styles.kelasNama}>{kelas.namaKelas}</Text>
                    {kelas.deskripsi ? (
                      <Text style={styles.kelasDeskripsi}>{kelas.deskripsi}</Text>
                    ) : null}
                    <Text style={styles.kelasId}>ID: {kelas.id}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDelete(kelas.id, kelas.namaKelas)}
                  activeOpacity={0.85}
                >
                  <FontAwesomeIcon
                    name="trash"
                    size={14}
                    color="#ef4444"
                  />
                  <Text style={styles.deleteText}>Hapus</Text>
                </TouchableOpacity>
              </View>
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
            title="Menyegarkan data..."
            titleColor="#2563eb"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

/* ================== STYLE ================== */

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  scrollView: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  scrollContent: {
    paddingBottom: 100,
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

  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    color: "#c7d2fe",
    fontSize: 14,
    fontWeight: "500",
  },

  /* MAIN CARD */
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  listCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  /* CARD HEADER */
  cardHeader: {
    marginBottom: 20,
  },
  
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  
  cardTitleIcon: {
    marginRight: 10,
  },
  
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: 0.3,
  },
  
  cardSubtitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },

  /* FORM STYLES */
  formGroup: {
    marginBottom: 18,
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
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },

  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  /* BUTTON STYLES */
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: "#2563eb",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  
  disabled: {
    opacity: 0.7,
  },
  
  buttonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  
  buttonLoading: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  
  buttonIcon: {
    marginRight: 10,
  },
  
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  
  buttonLoadingText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },

  /* LOADING CONTAINER */
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  
  loadingText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginLeft: 12,
  },

  /* KELAS LIST STYLES */
  kelasList: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  
  kelasItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  
  kelasContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  
  kelasIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#bfdbfe",
  },
  
  kelasInfo: {
    flex: 1,
  },
  
  kelasNama: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  
  kelasDeskripsi: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 2,
  },

  kelasId: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  
  deleteText: {
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "700",
    marginLeft: 6,
    letterSpacing: 0.2,
  },

  /* EMPTY STATES */
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },

  emptySubtext: {
    fontSize: 13,
    color: "#cbd5e1",
    fontWeight: "400",
    marginTop: 4,
    textAlign: "center",
  },

  /* SPACER UNTUK NAVIGATOR */
  spacer: {
    height: 100,
  },
});

export default ManageKelasScreen;