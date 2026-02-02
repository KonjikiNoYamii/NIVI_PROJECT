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
  Dimensions,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API, SOCKET_URL } from "../../services/api";
import { Icon } from "react-native-elements";
import io from "socket.io-client";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

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
                  <Text style={customAlertStyles.cancelButtonText}>{cancelText}</Text>
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
  const [refreshing, setRefreshing] = useState(false);

  /* =======================
     FETCH INITIAL DATA
  ======================= */
  const fetchInitData = async () => {
    try {
      const [kelasRes, pengajarRes] = await Promise.all([
        axios.get(`${API}/kelas`),
        axios.get(`${API}/users/pengajar`),
      ]);
      setKelasList(kelasRes.data.data ?? kelasRes.data ?? []);
      setAllPengajar(pengajarRes.data.data ?? pengajarRes.data ?? []);
    } catch (err: any) {
      console.log(err.response || err.message);
      showAlert.error(
        "Gagal Memuat Data", 
        "Tidak dapat mengambil data awal. Periksa koneksi internet Anda."
      );
    } finally {
      setFetchingInit(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInitData();
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
        if (!token) {
          showAlert.error(
            "Autentikasi Gagal",
            "Sesi Anda telah berakhir. Silakan login kembali."
          );
          return;
        }
        
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
      } catch (err: any) {
        console.log(err.response || err.message);
        showAlert.error(
          "Gagal Memuat Pengajar",
          "Tidak dapat mengambil data pengajar kelas. Silakan coba lagi."
        );
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchInitData();
  };

  /* =======================
     CREATE PENGAJAR
  ======================= */
  const handleCreatePengajar = async () => {
    if (!name.trim() || !email.trim()) {
      showAlert.validation("Nama dan email wajib diisi untuk membuat pengajar baru.");
      return;
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert.validation("Format email tidak valid. Harap masukkan email yang benar.");
      return;
    }

    showAlert.confirm(
      "Buat Pengajar Baru",
      "Anda akan membuat akun pengajar baru. Pastikan data sudah benar.",
      async () => {
        setCreating(true);
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) {
            showAlert.error(
              "Autentikasi Gagal",
              "Sesi Anda telah berakhir. Silakan login kembali."
            );
            setCreating(false);
            return;
          }
          
          const res = await axios.post(`${API}/admin/pengajar`, 
            { name: name.trim(), email: email.trim() },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const newPengajar = res.data.data ?? res.data;
          setAllPengajar(prev => [...prev, newPengajar]);
          setName("");
          setEmail("");
          
          showAlert.success(
            "Berhasil Dibuat",
            `Pengajar "${name}" berhasil ditambahkan ke sistem.`,
            () => {
              // Auto-refresh jika kelas sedang dipilih
              if (selectedKelasId) {
                const fetchPengajarByKelas = async () => {
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
                  }
                };
                fetchPengajarByKelas();
              }
            }
          );
        } catch (err: any) {
          console.log(err.response || err.message);
          const errorMessage = err.response?.data?.message ?? "Terjadi kesalahan server. Silakan coba lagi.";
          
          if (err.response?.status === 409) {
            showAlert.error(
              "Email Sudah Terdaftar",
              "Email ini sudah digunakan oleh pengajar lain."
            );
          } else if (err.response?.status === 400) {
            showAlert.error(
              "Data Tidak Valid",
              errorMessage
            );
          } else {
            showAlert.error(
              "Gagal Membuat Pengajar",
              errorMessage
            );
          }
        } finally {
          setCreating(false);
        }
      },
      {
        confirmText: "Buat Sekarang",
        cancelText: "Periksa Kembali",
        type: "info"
      }
    );
  };

  /* =======================
     ASSIGN PENGAJAR
  ======================= */
  const handleAssignPengajar = async (pengajar: Pengajar) => {
    if (!selectedKelasId) {
      showAlert.validation("Pilih kelas terlebih dahulu untuk menugaskan pengajar.");
      return;
    }

    const pengajarName = pengajar.profiles?.name ?? pengajar.email;
    
    showAlert.confirm(
      "Konfirmasi Penugasan",
      `Tambahkan ${pengajarName} ke kelas ini?`,
      async () => {
        setLoadingAssign(true);
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) {
            showAlert.error(
              "Autentikasi Gagal",
              "Sesi Anda telah berakhir. Silakan login kembali."
            );
            setLoadingAssign(false);
            return;
          }
          
          await axios.post(
            `${API}/kelas/${selectedKelasId}/pengajar`,
            { pengajarIds: pengajar.id },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Update state frontend secara manual
          setPengajarKelas(prev => [...prev, pengajar]);

          showAlert.success(
            "Berhasil Ditugaskan",
            `${pengajarName} berhasil ditambahkan ke kelas.`,
            () => {
              // Emit socket untuk real-time update
              socket.emit("kelas-pengajar-changed", { kelasId: selectedKelasId });
            }
          );
        } catch (err: any) {
          console.log(err.response || err.message);
          const errorMessage = err.response?.data?.message ?? "Gagal menambahkan pengajar ke kelas.";
          
          if (err.response?.status === 409) {
            showAlert.error(
              "Sudah Ditugaskan",
              `${pengajarName} sudah ada di kelas ini.`
            );
          } else {
            showAlert.error(
              "Gagal Menambahkan",
              errorMessage
            );
          }
        } finally {
          setLoadingAssign(false);
        }
      },
      {
        confirmText: "Tambahkan",
        cancelText: "Batal",
        type: "info"
      }
    );
  };

  /* =======================
     REMOVE PENGAJAR
  ======================= */
  const handleRemovePengajar = async (pengajar: Pengajar) => {
    if (!selectedKelasId) {
      showAlert.validation("Tidak ada kelas yang dipilih.");
      return;
    }

    const pengajarName = pengajar.profiles?.name ?? pengajar.email;
    
    showAlert.confirm(
      "Konfirmasi Penghapusan",
      `Apakah Anda yakin ingin menghapus ${pengajarName} dari kelas ini?`,
      async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) {
            showAlert.error(
              "Autentikasi Gagal",
              "Sesi Anda telah berakhir. Silakan login kembali."
            );
            return;
          }
          
          await axios.delete(`${API}/admin/kelas/pengajar`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { kelasId: selectedKelasId, pengajarId: pengajar.id },
          });

          // Emit socket untuk real-time update
          socket.emit("kelas-pengajar-changed", { kelasId: selectedKelasId });

          // Update local state
          setPengajarKelas(prev => prev.filter(p => p.id !== pengajar.id));

          showAlert.success(
            "Berhasil Dihapus",
            `${pengajarName} telah dihapus dari kelas.`
          );
        } catch (err: any) {
          console.log(err.response || err.message);
          const errorMessage = err.response?.data?.message ?? "Gagal menghapus pengajar dari kelas.";
          showAlert.error(
            "Gagal Menghapus",
            errorMessage
          );
        }
      },
      {
        confirmText: "Hapus dari Kelas",
        cancelText: "Batal",
        type: "warning"
      }
    );
  };

  if (fetchingInit && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.centerLoadingText}>Menyiapkan data pengajar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Manajemen Pengajar</Text>
        <Text style={styles.headerSubtitle}>
          Kelola data pengajar dan penugasan kelas
        </Text>
      </View>
      <TouchableOpacity style={styles.headerIcon}>
        <FontAwesome6Icon
          name="chalkboard-user"
          size={18}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => (
    <>
      {/* FORM BUAT PENGAJAR CARD */}
      <View style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <FontAwesomeIcon
              name="user-plus"
              size={16}
              color="#2563eb"
              style={styles.cardTitleIcon}
            />
            <Text style={styles.cardTitle}>Buat Pengajar Baru</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Tambahkan pengajar baru ke sistem
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nama Lengkap <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="Masukkan nama lengkap pengajar"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!creating}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Email <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="contoh: pengajar@pesantren.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!creating}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, creating && styles.disabled]}
          onPress={handleCreatePengajar}
          disabled={creating}
          activeOpacity={0.85}
        >
          {creating ? (
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
              <Text style={styles.buttonText}>BUAT PENGAJAR</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* PILIH KELAS CARD */}
      <View style={[styles.mainCard, styles.kelasCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <FontAwesomeIcon
              name="group"
              size={16}
              color="#7c3aed"
              style={styles.cardTitleIcon}
            />
            <Text style={styles.cardTitle}>Pilih Kelas</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Pilih kelas untuk menugaskan pengajar
          </Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.kelasScroll}
          contentContainerStyle={styles.kelasScrollContent}
        >
          {kelasList.length === 0 ? (
            <View style={styles.emptyKelas}>
              <FontAwesomeIcon
                name="school"
                size={20}
                color="#9ca3af"
              />
              <Text style={styles.emptyKelasText}>Belum ada kelas tersedia</Text>
            </View>
          ) : (
            <>
              {kelasList.map(k => (
                <TouchableOpacity
                  key={k.id}
                  style={[
                    styles.kelasButton,
                    selectedKelasId === k.id && styles.kelasButtonActive
                  ]}
                  onPress={() => setSelectedKelasId(k.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.kelasButtonContent}>
                    <FontAwesomeIcon
                      name="group"
                      size={14}
                      color={selectedKelasId === k.id ? "#fff" : "#6b7280"}
                      style={styles.kelasButtonIcon}
                    />
                    <Text style={[
                      styles.kelasButtonText,
                      selectedKelasId === k.id && styles.kelasButtonTextActive
                    ]}>
                      {k.namaKelas}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
        
        {selectedKelasId && kelasList.find(k => k.id === selectedKelasId) && (
          <View style={styles.selectedKelasInfo}>
            <FontAwesomeIcon
              name="check-circle"
              size={14}
              color="#059669"
            />
            <Text style={styles.selectedKelasText}>
              Terpilih: {kelasList.find(k => k.id === selectedKelasId)?.namaKelas}
            </Text>
          </View>
        )}
      </View>

      {/* Jika kelas dipilih, tampilkan pengajar */}
      {selectedKelasId && (
        <>
          {/* LIST PENGAJAR DI KELAS CARD */}
          <View style={[styles.mainCard, styles.pengajarListCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <FontAwesomeIcon
                  name="users"
                  size={16}
                  color="#059669"
                  style={styles.cardTitleIcon}
                />
                <Text style={styles.cardTitle}>Pengajar di Kelas</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                {pengajarKelas.length} pengajar ditugaskan
              </Text>
            </View>

            {loadingPengajarKelas ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#2563eb" size="small" />
                <Text style={styles.loadingText}>Memuat data pengajar...</Text>
              </View>
            ) : pengajarKelas.length > 0 ? (
              <View style={styles.pengajarList}>
                {pengajarKelas.map(p => (
                  <View key={p.id} style={styles.pengajarItem}>
                    <View style={styles.pengajarAvatar}>
                      <Text style={styles.pengajarAvatarText}>
                        {(p.profiles?.name ?? p.email).charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.pengajarInfo}>
                      <Text style={styles.pengajarNama}>{p.profiles?.name ?? p.email}</Text>
                      <Text style={styles.pengajarEmail}>{p.email}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemovePengajar(p)}
                      activeOpacity={0.85}
                    >
                      <FontAwesomeIcon
                        name="trash"
                        size={14}
                        color="#ef4444"
                      />
                      <Text style={styles.removeText}>Hapus</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <FontAwesomeIcon
                  name="user-slash"
                  size={24}
                  color="#d1d5db"
                />
                <Text style={styles.emptyText}>Belum ada pengajar di kelas ini</Text>
                <Text style={styles.emptySubtext}>Tambahkan pengajar dari daftar tersedia</Text>
              </View>
            )}
          </View>

          {/* LIST PENGAJAR TERSEDIA CARD */}
          <View style={[styles.mainCard, styles.availablePengajarCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <FontAwesomeIcon
                  name="user-plus"
                  size={16}
                  color="#f59e0b"
                  style={styles.cardTitleIcon}
                />
                <Text style={styles.cardTitle}>Tambahkan Pengajar</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                Pilih pengajar yang tersedia untuk ditambahkan ke kelas
              </Text>
            </View>
            
            <View style={styles.availablePengajarList}>
              {allPengajar
                .filter(p => !pengajarKelas.some(pk => pk.id === p.id))
                .map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.availablePengajarItem}
                    onPress={() => handleAssignPengajar(p)}
                    disabled={loadingAssign}
                    activeOpacity={0.85}
                  >
                    <View style={styles.availablePengajarContent}>
                      <View style={styles.availablePengajarAvatar}>
                        <Text style={styles.availablePengajarAvatarText}>
                          {(p.profiles?.name ?? p.email).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.availablePengajarInfo}>
                        <Text style={styles.availablePengajarNama}>{p.profiles?.name ?? p.email}</Text>
                        <Text style={styles.availablePengajarEmail}>{p.email}</Text>
                      </View>
                    </View>
                    {loadingAssign ? (
                      <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                      <View style={styles.addButton}>
                        <FontAwesomeIcon
                          name="plus-circle"
                          size={14}
                          color="#2563eb"
                          style={styles.addButtonIcon}
                        />
                        <Text style={styles.addText}>Tambah</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
            </View>
            
            {allPengajar.filter(p => !pengajarKelas.some(pk => pk.id === p.id)).length === 0 && (
              <View style={styles.emptyContainer}>
                <FontAwesomeIcon
                  name="check-circle"
                  size={24}
                  color="#d1d5db"
                />
                <Text style={styles.emptyText}>Semua pengajar sudah ditugaskan</Text>
                <Text style={styles.emptySubtext}>Tidak ada pengajar tersedia untuk ditambahkan</Text>
              </View>
            )}
          </View>
        </>
      )}

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

const { width } = Dimensions.get('window');

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

  /* HEADER */
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "android" ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  
  headerContent: {
    flex: 1,
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
  
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginLeft: 12,
    marginTop: 4,
  },

  /* MAIN CARD STYLES */
  mainCard: {
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
  
  kelasCard: {
    marginTop: 0,
  },
  
  pengajarListCard: {
    marginTop: 0,
  },
  
  availablePengajarCard: {
    marginTop: 0,
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

  /* KELAS SELECTION STYLES */
  kelasScroll: {
    marginHorizontal: -4,
  },
  
  kelasScrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  
  kelasButton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 12,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    minWidth: 100,
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
  
  kelasButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  
  kelasButtonIcon: {
    marginRight: 8,
  },
  
  kelasButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.2,
  },
  
  kelasButtonTextActive: {
    color: "#fff",
    fontWeight: "800",
  },
  
  emptyKelas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  
  emptyKelasText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
    marginLeft: 10,
  },
  
  selectedKelasInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  
  selectedKelasText: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
    marginLeft: 10,
    letterSpacing: 0.2,
  },

  /* PENGAJAR LIST STYLES */
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
  
  pengajarList: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  
  pengajarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  
  pengajarAvatar: {
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
  
  pengajarAvatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  
  pengajarInfo: {
    flex: 1,
  },
  
  pengajarNama: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  
  pengajarEmail: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  
  removeText: {
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "700",
    marginLeft: 6,
    letterSpacing: 0.2,
  },

  /* AVAILABLE PENGAJAR STYLES */
  availablePengajarList: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  
  availablePengajarItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  
  availablePengajarContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  
  availablePengajarAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#bae6fd",
  },
  
  availablePengajarAvatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0369a1",
  },
  
  availablePengajarInfo: {
    flex: 1,
  },
  
  availablePengajarNama: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  
  availablePengajarEmail: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  
  addButtonIcon: {
    marginRight: 6,
  },
  
  addText: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "700",
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

export default ManagePengajarScreen;