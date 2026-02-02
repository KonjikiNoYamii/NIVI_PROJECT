import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Modal,
  Dimensions,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../../services/api";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

/* ================== TYPE ================== */

interface CreateMapelPayload {
  nama: string;
  kode: string;
}

interface MataPelajaran {
  id: number;
  nama: string;
  kode: string;
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
                  <FontAwesomeIcon 
                    name="times" 
                    size={14}
                    color="#6b7280" 
                    style={customAlertStyles.buttonIcon} 
                  />
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
                {type === 'success' && (
                  <FontAwesomeIcon 
                    name="check" 
                    size={14}
                    color="#ffffff" 
                    style={customAlertStyles.buttonIcon} 
                  />
                )}
                {type === 'error' && (
                  <FontAwesomeIcon 
                    name="exclamation-circle" 
                    size={14}
                    color="#ffffff" 
                    style={customAlertStyles.buttonIcon} 
                  />
                )}
                {type === 'warning' && (
                  <FontAwesomeIcon 
                    name="exclamation-triangle" 
                    size={14}
                    color="#ffffff" 
                    style={customAlertStyles.buttonIcon} 
                  />
                )}
                {type === 'info' && (
                  <FontAwesomeIcon 
                    name="info-circle" 
                    size={14}
                    color="#ffffff" 
                    style={customAlertStyles.buttonIcon} 
                  />
                )}
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
    paddingHorizontal: 20,
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
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.3,
    paddingHorizontal: 8,
  },
  message: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    letterSpacing: 0.2,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 130,
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
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    flexShrink: 1,
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

/* ================== COMPONENT ================== */

const CreateMataPelajaranScreen: React.FC = () => {
  const [form, setForm] = useState<CreateMapelPayload>({
    nama: "",
    kode: "",
  });

  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [listLoading, setListLoading] = useState(false);

  /* ================== LOAD AUTH ================== */

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const [[, storedToken], [, storedRole]] =
          await AsyncStorage.multiGet(["token", "role"]);

        setToken(storedToken);
        setRole(storedRole);
      } catch (err: any) {
        console.log(err.response || err.message);
        showAlert.error(
          "Gagal Memuat Data",
          "Tidak dapat mengambil data autentikasi. Silakan login kembali."
        );
      } finally {
        setInitLoading(false);
      }
    };

    loadAuth();
  }, []);

  /* ================== FETCH MAPEL ================== */

  const fetchMapel = async () => {
    if (!token) return;

    try {
      setListLoading(true);
      const res = await axios.get(`${API}/mapel`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMapelList(res.data.data || res.data);
    } catch (err: any) {
      console.log(err.response || err.message);
      showAlert.error(
        "Gagal Memuat Data",
        "Tidak dapat mengambil data mata pelajaran. Periksa koneksi internet Anda."
      );
    } finally {
      setListLoading(false);
      setRefreshing(false);
    }
  };

  const loadData = () => {
    if (token) {
      fetchMapel();
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  /* ================== FORM HANDLER ================== */

  const handleChange = (key: keyof CreateMapelPayload, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === "kode" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.nama || !form.kode) {
      showAlert.validation("Nama dan kode mata pelajaran wajib diisi.");
      return;
    }

    if (form.nama.trim().length < 3) {
      showAlert.validation("Nama mata pelajaran minimal 3 karakter.");
      return;
    }

    if (form.kode.trim().length < 2) {
      showAlert.validation("Kode mata pelajaran minimal 2 karakter.");
      return;
    }

    if (!token) {
      showAlert.error(
        "Autentikasi Gagal",
        "Sesi Anda telah berakhir. Silakan login kembali."
      );
      return;
    }

    showAlert.confirm(
      "Buat Mata Pelajaran Baru",
      "Anda akan menambahkan mata pelajaran baru. Pastikan data sudah benar.",
      async () => {
        try {
          setLoading(true);

          await axios.post(`${API}/mapel`, form, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          showAlert.success(
            "Berhasil Dibuat",
            `Mata pelajaran "${form.nama}" berhasil ditambahkan.`,
            () => {
              setForm({ nama: "", kode: "" });
              fetchMapel();
            }
          );
        } catch (error: any) {
          console.log(error.response || error.message);
          const errorMessage = error?.response?.data?.message ?? "Terjadi kesalahan server. Silakan coba lagi.";
          
          if (error.response?.status === 409) {
            showAlert.error(
              "Kode Sudah Digunakan",
              "Kode mata pelajaran ini sudah digunakan. Silakan gunakan kode yang berbeda."
            );
          } else if (error.response?.status === 400) {
            showAlert.error(
              "Data Tidak Valid",
              errorMessage
            );
          } else {
            showAlert.error(
              "Gagal Membuat Mata Pelajaran",
              errorMessage
            );
          }
        } finally {
          setLoading(false);
        }
      },
      {
        confirmText: "Buat Sekarang",  // Tombol KANAN (warna biru)
        cancelText: "Periksa Kembali", // Tombol KIRI (warna abu-abu)
        type: "info"
      }
    );
  };

  /* ================== STATE HANDLING ================== */

  if (initLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.centerLoadingText}>Menyiapkan aplikasi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (role !== "admin") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <FontAwesomeIcon
            name="lock"
            size={32}
            color="#ef4444"
            style={styles.errorIcon}
          />
          <Text style={styles.errorTitle}>Akses Ditolak</Text>
          <Text style={styles.errorText}>
            Hanya admin yang dapat mengakses halaman ini
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Mata Pelajaran</Text>
      <Text style={styles.headerSubtitle}>
        Kelola data mata pelajaran desa belajar
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
              name="book"
              size={16}
              color="#2563eb"
              style={styles.cardTitleIcon}
            />
            <Text style={styles.cardTitle}>Tambah Mata Pelajaran</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Buat mata pelajaran baru untuk sistem
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nama Mata Pelajaran <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="Masukan nama mata pelajaran"
            placeholderTextColor="#9ca3af"
            value={form.nama}
            onChangeText={(v) => handleChange("nama", v)}
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Kode Mata Pelajaran <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="Contoh: MTK-01"
            placeholderTextColor="#9ca3af"
            value={form.kode}
            onChangeText={(v) => handleChange("kode", v)}
            style={styles.input}
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
              <Text style={styles.buttonLoadingText}>Menyimpan...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <FontAwesomeIcon
                name="save"
                size={14}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>SIMPAN DATA</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* LIST MAPEL CARD */}
      <View style={styles.listCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <FontAwesomeIcon
              name="list-alt"
              size={16}
              color="#059669"
              style={styles.cardTitleIcon}
            />
            <Text style={styles.cardTitle}>Daftar Mata Pelajaran</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            {mapelList.length} mata pelajaran tersedia
          </Text>
        </View>

        {listLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#2563eb" size="small" />
            <Text style={styles.loadingText}>Memuat data mata pelajaran...</Text>
          </View>
        ) : mapelList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesomeIcon
              name="book-open"
              size={24}
              color="#d1d5db"
            />
            <Text style={styles.emptyText}>Belum ada mata pelajaran</Text>
            <Text style={styles.emptySubtext}>Mulai dengan menambahkan mata pelajaran pertama</Text>
          </View>
        ) : (
          <View style={styles.mapelList}>
            {mapelList.map((item) => (
              <View key={item.id} style={styles.mapelItem}>
                <View style={styles.mapelContent}>
                  <View style={styles.mapelIcon}>
                    <FontAwesomeIcon
                      name="bookmark"
                      size={14}
                      color="#2563eb"
                    />
                  </View>
                  <View style={styles.mapelInfo}>
                    <Text style={styles.mapelNama}>{item.nama}</Text>
                    <Text style={styles.mapelKode}>{item.kode}</Text>
                  </View>
                </View>
                <View style={styles.mapelIdContainer}>
                  <Text style={styles.mapelId}>ID: {item.id}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* SPACER UNTUK NAVIGATOR */}
      <View style={styles.spacer} />
    </>
  );

  /* ================== UI ================== */

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

export default CreateMataPelajaranScreen;

/* ================== STYLE ================== */

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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

  /* SCROLL VIEW */
  scrollView: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  scrollContent: {
    paddingBottom: 100,
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

  /* MAPEL LIST STYLES */
  mapelList: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  
  mapelItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  
  mapelContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  
  mapelIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#bfdbfe",
  },
  
  mapelInfo: {
    flex: 1,
  },
  
  mapelNama: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  
  mapelKode: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },

  mapelIdContainer: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  mapelId: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
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

  /* CENTERED VIEWS */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },

  centerLoadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },

  errorIcon: {
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ef4444",
    marginBottom: 8,
    letterSpacing: 0.3,
  },

  errorText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  /* SPACER UNTUK NAVIGATOR */
  spacer: {
    height: 100,
  },
});