import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Dimensions,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";
import { Icon } from "react-native-elements";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

/* ================== TYPE ================== */

type StatusIzin = "menunggu" | "disetujui" | "ditolak";

interface IzinData {
  id: number;
  status: StatusIzin;
  tanggal: string;
  alasan: string;
  user?: {
    name: string;
  };
  kelas: {
    namaKelas: string;
  };
}

/* ================== CONSTANT ================== */

const STATUS_COLOR: Record<StatusIzin, string> = {
  menunggu: "#F59E0B",
  disetujui: "#10B981",
  ditolak: "#EF4444",
};

const STATUS_LABEL: Record<StatusIzin, string> = {
  menunggu: "MENUNGGU",
  disetujui: "DISETUJUI",
  ditolak: "DITOLAK",
};

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
    paddingHorizontal: 8,
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
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
    flexShrink: 1,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
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

/* ================== HELPER ================== */

const getToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Token tidak ditemukan");
  return token;
};

/* ================== COMPONENT ================== */

export default function PengajarIzinScreen() {
  const [izinList, setIzinList] = useState<IzinData[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(true);

  /* ================== LOAD AUTH ================== */

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedRole = await AsyncStorage.getItem("role");
        setRole(storedRole);
      } catch (err: any) {
        console.log(err.message || err);
        showAlert.error(
          "⚠️ Gagal Memuat Data",
          "Tidak dapat mengambil data autentikasi. Silakan login kembali."
        );
      } finally {
        setInitLoading(false);
      }
    };

    loadAuth();
  }, []);

  /* ================== FETCH IZIN ================== */

  const fetchIzin = useCallback(async () => {
    if (!role || role !== "pengajar") return;

    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/izin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIzinList(res.data.data || []);
    } catch (err: any) {
      console.log(err.response || err.message);
      showAlert.error(
        "⚠️ Gagal Memuat Data",
        "Tidak dapat mengambil data izin. Periksa koneksi internet Anda."
      );
    } finally {
      setLoading(false);
    }
  }, [role]);

  useFocusEffect(
    useCallback(() => {
      fetchIzin();
    }, [fetchIzin])
  );

  /* ================== UPDATE STATUS ================== */

  const updateStatus = async (id: number, status: StatusIzin) => {
    const actionText = status === "disetujui" ? "menyetujui" : "menolak";
    const actionTitle = status === "disetujui" ? "Setujui Izin" : "Tolak Izin";
    const actionEmoji = status === "disetujui" ? "✅" : "❌";

    showAlert.confirm(
      `${actionEmoji} Konfirmasi Tindakan`,
      `Apakah Anda yakin ingin ${actionText} izin ini?`,
      async () => {
        setLoading(true);
        try {
          const token = await getToken();
          await axios.put(
            `${API}/izin/${id}`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          showAlert.success(
            "✅ Berhasil Diproses",
            `Izin berhasil di${actionText}.`,
            () => fetchIzin()
          );
        } catch (err: any) {
          console.log(err.response || err.message);
          const errorMessage = err.response?.data?.message ?? "Gagal memperbarui status izin. Silakan coba lagi.";
          
          if (err.response?.status === 400) {
            showAlert.error(
              "⚠️ Data Tidak Valid",
              errorMessage
            );
          } else if (err.response?.status === 401) {
            showAlert.error(
              "⚠️ Autentikasi Gagal",
              "Sesi Anda telah berakhir. Silakan login kembali."
            );
          } else if (err.response?.status === 404) {
            showAlert.error(
              "⚠️ Data Tidak Ditemukan",
              "Izin tidak ditemukan atau sudah dihapus."
            );
          } else {
            showAlert.error(
              "⚠️ Gagal Memproses",
              errorMessage
            );
          }
        } finally {
          setLoading(false);
        }
      },
      {
        confirmText: "Ya, Lanjutkan",
        cancelText: "Batal",
        type: "info"
      }
    );
  };

  /* ================== RENDER ITEM ================== */

  const renderItem = ({ item }: { item: IzinData }) => (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userIcon}>
            <Icon
              name="user"
              type="font-awesome"
              size={14}
              color="#fff"
            />
          </View>
          <View>
            <Text style={styles.userName}>{item.user?.name || "Santri"}</Text>
            <Text style={styles.classText}>
              Kelas: {item.kelas?.namaKelas || "-"}
            </Text>
          </View>
        </View>
        
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLOR[item.status] },
          ]}
        >
          <Icon
            name={item.status === "menunggu" ? "clock-o" : item.status === "disetujui" ? "check" : "times"}
            type="font-awesome"
            size={10}
            color="#fff"
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{STATUS_LABEL[item.status]}</Text>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.cardContent}>
        <View style={styles.dateContainer}>
          <Icon
            name="calendar"
            type="font-awesome"
            size={12}
            color="#6b7280"
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>
            {new Date(item.tanggal).toLocaleDateString("id-ID", {
              weekday: 'long',
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </Text>
        </View>
        
        <View style={styles.reasonContainer}>
          <View style={styles.reasonHeader}>
            <Icon
              name="sticky-note"
              type="font-awesome"
              size={12}
              color="#4b5563"
              style={styles.reasonIcon}
            />
            <Text style={styles.reasonLabel}>Alasan Izin:</Text>
          </View>
          <Text style={styles.reasonText}>{item.alasan}</Text>
        </View>
      </View>

      {/* ACTIONS */}
      {item.status === "menunggu" && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => updateStatus(item.id, "disetujui")}
            activeOpacity={0.85}
          >
            <Icon name="check" type="font-awesome" color="#fff" size={14} />
            <Text style={styles.actionButtonText}>Setujui</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => updateStatus(item.id, "ditolak")}
            activeOpacity={0.85}
          >
            <Icon name="times" type="font-awesome" color="#fff" size={14} />
            <Text style={styles.actionButtonText}>Tolak</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

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

  if (role !== "pengajar") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Icon
            name="lock"
            type="font-awesome"
            size={32}
            color="#ef4444"
            style={styles.errorIcon}
          />
          <Text style={styles.errorTitle}>🔒 Akses Ditolak</Text>
          <Text style={styles.errorText}>
            Hanya pengajar yang dapat mengakses halaman ini
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ================== UI ================== */

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Render Alert Provider */}
      <AlertProvider />
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER YANG IKUT SCROLL */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Manajemen Izin Santri</Text>
            <Text style={styles.headerSubtitle}>
              Kelola pengajuan izin santri dengan mudah
            </Text>
          </View>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon
              name="clipboard"
              type="font-awesome"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* STATS SUMMARY - DITAMBAH MARGIN TOP AGAR TURUN */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={[styles.statsIcon, { backgroundColor: '#F59E0B20' }]}>
              <Icon
                name="clock-o"
                type="font-awesome"
                size={16}
                color="#F59E0B"
              />
            </View>
            <View style={styles.statsInfo}>
              <Text style={styles.statsCount}>
                {izinList.filter(i => i.status === 'menunggu').length}
              </Text>
              <Text style={styles.statsLabel}>Menunggu</Text>
            </View>
          </View>
          
          <View style={styles.statsCard}>
            <View style={[styles.statsIcon, { backgroundColor: '#10B98120' }]}>
              <Icon
                name="check"
                type="font-awesome"
                size={16}
                color="#10B981"
              />
            </View>
            <View style={styles.statsInfo}>
              <Text style={styles.statsCount}>
                {izinList.filter(i => i.status === 'disetujui').length}
              </Text>
              <Text style={styles.statsLabel}>Disetujui</Text>
            </View>
          </View>
          
          <View style={styles.statsCard}>
            <View style={[styles.statsIcon, { backgroundColor: '#EF444420' }]}>
              <Icon
                name="times"
                type="font-awesome"
                size={16}
                color="#EF4444"
              />
            </View>
            <View style={styles.statsInfo}>
              <Text style={styles.statsCount}>
                {izinList.filter(i => i.status === 'ditolak').length}
              </Text>
              <Text style={styles.statsLabel}>Ditolak</Text>
            </View>
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.contentContainer}>
          {loading && izinList.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Memuat data izin...</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              <View style={styles.listHeader}>
                <Text style={styles.totalText}>
                  Total Pengajuan: {izinList.length} izin
                </Text>
                {izinList.length > 0 && (
                  <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={fetchIzin}
                    activeOpacity={0.85}
                  >
                    <Icon
                      name="refresh"
                      type="font-awesome"
                      size={12}
                      color="#2563eb"
                    />
                    <Text style={styles.refreshText}>Refresh</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <FlatList
                data={izinList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon
                      name="clipboard"
                      type="font-awesome"
                      size={36}
                      color="#d1d5db"
                    />
                    <Text style={styles.emptyTitle}>Tidak ada pengajuan izin</Text>
                    <Text style={styles.emptySubtext}>
                      Semua izin santri telah diproses atau belum ada pengajuan
                    </Text>
                  </View>
                }
              />
            </View>
          )}
        </View>

        {/* SPACER UNTUK NAVIGATOR */}
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  container: {
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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

  /* STATS CONTAINER - DITAMBAH MARGIN TOP AGAR TURUN */
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 15, // DITAMBAH: Margin top untuk menurunkan posisi
    marginBottom: 20,
  },

  statsCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },

  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  statsInfo: {
    alignItems: "center",
  },

  statsCount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 2,
  },

  statsLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* CONTENT CONTAINER */
  contentContainer: {
    paddingHorizontal: 20,
  },

  listContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  totalText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    letterSpacing: 0.2,
  },

  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },

  refreshText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
    marginLeft: 6,
  },

  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  loadingText: {
    marginTop: 16,
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },

  /* CARD STYLES */
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  userInfo: {
    flex: 1,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  userIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
    letterSpacing: 0.2,
  },

  classText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 110,
    justifyContent: "center",
  },

  statusIcon: {
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },

  cardContent: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
  },

  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  dateIcon: {
    marginRight: 8,
  },

  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  reasonContainer: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  reasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  reasonIcon: {
    marginRight: 8,
  },

  reasonLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4b5563",
  },

  reasonText: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
  },

  actionContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  approveButton: {
    backgroundColor: "#10B981",
  },

  rejectButton: {
    backgroundColor: "#EF4444",
  },

  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 13,
    letterSpacing: 0.3,
  },

  /* EMPTY STATES */
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6b7280",
    marginTop: 16,
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
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

  /* SPACER */
  spacer: {
    height: 100,
  },
});