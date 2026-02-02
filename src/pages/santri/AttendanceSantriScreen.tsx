// SantriAbsensiScreen.tsx - Fokus pada tombol tanpa shadow
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../../components/loading';
import { API } from '../../services/api';
import { NIVI } from '../../theme/niviTheme';
import { Icon } from 'react-native-elements';
import { TextInput } from 'react-native-gesture-handler';
import { socket } from '../../services/socket';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

/* =======================
   CUSTOM ALERT MODAL
======================= */
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

// ================ CUSTOM ALERT HOOK ================
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

// ================ ALERT HELPER FUNCTIONS ================
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

const getToken = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan');
  return token;
};

type StatusAbsensi = 'hadir' | 'izin' | 'sakit';

const statusColors: any = {
  hadir: '#10B981',
  izin: '#F59E0B',
  sakit: '#EF4444',
};

export default function SantriAbsensiScreen() {
  const [absensiHariIni, setAbsensiHariIni] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusAbsen, setStatusAbsen] = useState<StatusAbsensi | null>(null);
  const [showIzinModal, setShowIzinModal] = useState(false);
  const [alasanIzin, setAlasanIzin] = useState('');
  const [izinPending, setIzinPending] = useState(false);

  const statusOptions: StatusAbsensi[] = ['hadir', 'izin', 'sakit'];

  // ==================== FETCH ABSENSI ====================
  const fetchAbsensiHariIni = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/absensi/me/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAbsensiHariIni(res.data.data || []);
    } catch (err: any) {
      console.log(err.response || err.message);
      showAlert.error(
        "⚠️ Gagal Memuat Data",
        "Tidak dapat mengambil data absensi. Periksa koneksi internet Anda."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ==================== FETCH IZIN PENDING ====================
  const fetchIzinPending = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/izin/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIzinPending(res.data.some((i: any) => i.status === 'menunggu'));
    } catch (err: any) {
      console.log(err.response || err.message);
    }
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([fetchAbsensiHariIni(), fetchIzinPending()]);
  }, [fetchAbsensiHariIni, fetchIzinPending]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log('WEBSOCKET CONNECTED:', socket.id);
    });

    // Ambil kelas user dari AsyncStorage atau dari state user
    const joinKelas = async () => {
      const kelasStr = await AsyncStorage.getItem('kelasIds');
      const kelasIds = kelasStr ? JSON.parse(kelasStr) : [];
      if (kelasIds.length) {
        socket.emit('join-kelas', kelasIds);
        console.log('Joined kelas:', kelasIds);
      }
    };

    joinKelas();

    socket.on('absensi-update', data => {
      console.log('Realtime absensi:', data);
      setAbsensiHariIni(data);
    });

    return () => {
      socket.off('connect');
      socket.off('absensi-update');
      socket.disconnect();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ==================== SUBMIT ABSEN ====================
  const submitAbsen = async (status: StatusAbsensi) => {
    const statusLabel = status === 'hadir' ? 'kehadiran' : status === 'izin' ? 'izin' : 'sakit';
    
    showAlert.confirm(
      `📝 Konfirmasi Absensi`,
      `Apakah Anda yakin ingin melakukan absensi ${statusLabel}?`,
      async () => {
        setLoading(true);
        try {
          const token = await getToken();
          await axios.post(
            `${API}/absensi/absen`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setStatusAbsen(status);
          
          showAlert.success(
            "✅ Berhasil",
            `Absensi ${statusLabel} berhasil dilakukan.`,
            () => loadData()
          );
        } catch (err: any) {
          console.log(err.response || err.message);
          const errorMessage = err.response?.data?.message ?? "Gagal melakukan absensi. Silakan coba lagi.";
          
          if (err.response?.status === 400) {
            showAlert.error(
              "⚠️ Validasi Gagal",
              errorMessage
            );
          } else if (err.response?.status === 409) {
            showAlert.warning(
              "⚠️ Sudah Absen",
              "Anda sudah melakukan absensi untuk sesi ini."
            );
          } else if (err.response?.status === 403) {
            showAlert.warning(
              "⏰ Waktu Habis",
              "Waktu absensi untuk sesi ini sudah berakhir."
            );
          } else {
            showAlert.error(
              "⚠️ Gagal Mengirim Absensi",
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

  // ==================== SUBMIT IZIN ====================
  const submitIzin = async () => {
    if (!alasanIzin.trim()) {
      showAlert.validation("Alasan izin wajib diisi.");
      return;
    }

    if (alasanIzin.trim().length < 5) {
      showAlert.validation("Alasan izin minimal 5 karakter.");
      return;
    }

    showAlert.confirm(
      "📋 Konfirmasi Pengajuan Izin",
      "Apakah Anda yakin ingin mengajukan izin dengan alasan ini?",
      async () => {
        setLoading(true);
        try {
          const token = await getToken();
          await axios.post(
            `${API}/izin`,
            {
              alasan: alasanIzin,
              tanggal: new Date(),
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );

          showAlert.success(
            "✅ Berhasil Diajukan",
            "Izin berhasil diajukan dan menunggu persetujuan pengajar.",
            () => {
              setShowIzinModal(false);
              setAlasanIzin('');
              loadData();
            }
          );
        } catch (err: any) {
          console.log(err.response || err.message);
          const errorMessage = err.response?.data?.message ?? "Gagal mengajukan izin. Silakan coba lagi.";
          
          if (err.response?.status === 400) {
            showAlert.error(
              "⚠️ Data Tidak Valid",
              errorMessage
            );
          } else if (err.response?.status === 409) {
            showAlert.warning(
              "⚠️ Izin Aktif",
              "Anda sudah memiliki izin aktif atau menunggu persetujuan."
            );
          } else {
            showAlert.error(
              "⚠️ Gagal Mengajukan Izin",
              errorMessage
            );
          }
        } finally {
          setLoading(false);
        }
      },
      {
        confirmText: "Ya, Ajukan Sekarang",
        cancelText: "Periksa Kembali",
        type: "info"
      }
    );
  };

  // ==================== STATISTIK ====================
  const stats: any = { hadir: 0, izin: 0, sakit: 0 };
  absensiHariIni.forEach(a => {
    stats[a.status] = (stats[a.status] || 0) + 1;
  });
  const total = absensiHariIni.length;
  const percent = (v: number) =>
    total === 0 ? 0 : Math.round((v / total) * 100);

  // ==================== RENDER ====================
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Absensi Hari Ini</Text>
      <Text style={styles.headerSubtitle}>
        Lakukan absensi sesuai status Anda
      </Text>
    </View>
  );

  const renderContent = () => (
    <>
      {/* ==================== BUTTON ABSEN CARD ==================== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status Absensi</Text>
        
        <View style={styles.buttonGroup}>
          {statusOptions.map(s => {
            const bgColor = statusColors[s];
            const isActive = statusAbsen === s;
            const isDisabled = s === 'izin' && izinPending;

            return (
              <TouchableOpacity
                key={s}
                activeOpacity={0.85}
                onPress={() => {
                  if (s === 'izin') {
                    if (!izinPending) {
                      setShowIzinModal(true);
                    } else {
                      showAlert.warning(
                        "⚠️ Peringatan",
                        "Masih ada izin yang menunggu persetujuan. Tunggu hingga izin sebelumnya diproses."
                      );
                    }
                  } else {
                    submitAbsen(s);
                  }
                }}
                disabled={isDisabled}
                style={[
                  styles.btn,
                  isActive && styles.btnActive,
                  {
                    backgroundColor: isActive
                      ? bgColor
                      : isDisabled
                      ? '#f3f4f6'
                      : `${bgColor}0A`,
                    borderColor: isActive
                      ? bgColor
                      : isDisabled
                      ? '#e5e7eb'
                      : `${bgColor}30`,
                  },
                ]}
              >
                <View style={[
                  styles.btnIconContainer,
                  isActive && styles.btnIconContainerActive,
                  isDisabled && styles.btnIconContainerDisabled,
                ]}>
                  <Icon
                    name={
                      s === 'hadir'
                        ? 'check-circle'
                        : s === 'izin'
                        ? 'id-card'
                        : 'heartbeat'
                    }
                    type="font-awesome"
                    color={
                      isActive
                        ? '#FFFFFF'
                        : isDisabled
                        ? '#d1d5db'
                        : bgColor
                    }
                    size={24}
                  />
                </View>
                <Text style={[
                  styles.btnText,
                  isActive && styles.btnTextActive,
                  isDisabled && styles.btnTextDisabled,
                  { color: isActive ? '#FFFFFF' : isDisabled ? '#9ca3af' : bgColor }
                ]}>
                  {s.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ==================== STATISTIK CARD ==================== */}
      <View style={[styles.listCard, styles.statistikCard]}>
        <Text style={styles.listTitle}>Statistik Absensi</Text>
        
        {total === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada absensi hari ini</Text>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {statusOptions.map(key => (
              <View 
                key={key} 
                style={styles.statCard}
              >
                <View style={[
                  styles.statIconContainer,
                  { backgroundColor: `${statusColors[key]}15` }
                ]}>
                  <Icon
                    name={
                      key === 'hadir'
                        ? 'check-circle'
                        : key === 'izin'
                        ? 'id-card'
                        : 'heartbeat'
                    }
                    type="font-awesome"
                    color={statusColors[key]}
                    size={20}
                  />
                </View>
                <Text style={[styles.statValue, { color: statusColors[key] }]}>
                  {stats[key as keyof typeof stats]}
                </Text>
                <Text style={styles.statLabel}>{key.toUpperCase()}</Text>
                <View style={styles.bar}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${percent(stats[key as keyof typeof stats])}%`,
                        backgroundColor: statusColors[key],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.percent}>
                  {percent(stats[key as keyof typeof stats])}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ==================== RIWAYAT ABSENSI CARD ==================== */}
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Riwayat Absensi</Text>
        
        {absensiHariIni.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada absensi hari ini</Text>
          </View>
        ) : (
          <FlatList
            data={absensiHariIni}
            keyExtractor={i => i.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: `${statusColors[item.status]}15` }
                ]}>
                  <Icon
                    name={
                      item.status === 'hadir'
                        ? 'check-circle'
                        : item.status === 'izin'
                        ? 'clock'
                        : 'heartbeat'
                    }
                    type="font-awesome"
                    color={statusColors[item.status]}
                    size={16}
                  />
                </View>
                <View style={styles.listItemContent}>
                  <Text
                    style={[
                      styles.jadwal,
                      item.status === 'izin' || item.status === 'disetujui'
                        ? { color: '#F59E0B' }
                        : {},
                    ]}
                  >
                    {item.status === 'izin' || item.status === 'disetujui'
                      ? `Izin | ${new Date(item.tanggal).toLocaleDateString('id-ID')}`
                      : `${item.jadwal?.hari || 'Tidak ada jadwal'} | ${item.jadwal?.jamMulai || ''}-${item.jadwal?.jamSelesai || ''}`}
                  </Text>
                  <Text
                    style={[styles.status, { color: statusColors[item.status] }]}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* SPACER UNTUK NAVIGATOR */}
      <View style={styles.spacer} />
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <Loading visible={loading} />
      
      {/* Render Alert Provider */}
      <AlertProvider />

      <ScrollView
        style={styles.container}
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

      {/* ==================== MODAL IZIN ==================== */}
      <Modal
        visible={showIzinModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📋 Ajukan Izin</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowIzinModal(false);
                  setAlasanIzin('');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Alasan Izin</Text>
            <TextInput
              value={alasanIzin}
              onChangeText={setAlasanIzin}
              placeholder="Contoh: Keperluan keluarga"
              placeholderTextColor="#9ca3af"
              multiline
              style={styles.textArea}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowIzinModal(false);
                  setAlasanIzin('');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCancelButtonText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={submitIzin}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSubmitButtonText}>AJUKAN IZIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  scrollContent: {
    paddingBottom: 100, // Spacer untuk navigator
  },

  // HEADER - SEKARANG DI DALAM SCROLLVIEW
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
    fontSize: 22,
    fontWeight: "800",
  },

  headerSubtitle: {
    marginTop: 6,
    color: "#c7d2fe",
    fontSize: 14,
  },

  // CARD - Untuk Status Absensi
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 24, // Tambah margin bawah agar berjarak dengan statistik
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },

  // LIST CARD - Untuk Statistik dan Riwayat
  listCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  // Statistik Card khusus dengan margin atas
  statistikCard: {
    marginTop: 0, // Jaga jarak dari card status absensi
  },

  listTitle: { // ← TAMBAHKAN INI
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111827",
  },

  // BUTTON GROUP
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  btn: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 0,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    borderWidth: 2,
  },

  btnActive: {
    // No shadow
  },

  btnIconContainer: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  btnIconContainerActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  btnIconContainerDisabled: {
    backgroundColor: '#f3f4f6',
  },

  btnText: { 
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
    marginTop: 2,
  },

  btnTextActive: {
    fontWeight: '800',
  },

  btnTextDisabled: {
    opacity: 0.5,
  },

  // STATISTICS
  statsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: 12,
  },

  statCard: { 
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  statValue: { 
    fontSize: 24, 
    fontWeight: '800', 
    marginBottom: 4,
  },

  statLabel: { 
    fontSize: 12, 
    color: '#6b7280', 
    marginBottom: 10,
    fontWeight: '600',
  },

  bar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 6,
  },

  fill: { 
    height: '100%', 
    borderRadius: 2,
  },

  percent: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    color: '#9ca3af',
  },

  // LIST ITEMS
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: 'row',
    alignItems: 'center',
  },

  listItemContent: {
    flex: 1,
  },

  statusIndicator: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  jadwal: { 
    fontSize: 14, 
    color: '#4b5563', 
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: '500',
  },

  status: { 
    fontSize: 13, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // EMPTY STATE
  emptyContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
  },

  // MODAL
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },

  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  modalCloseButtonText: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '700',
  },

  modalLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 10,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    textAlignVertical: 'top',
    marginHorizontal: 20,
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 12,
  },

  modalCancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 14,
  },

  modalSubmitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },

  modalSubmitButtonText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // SPACER UNTUK NAVIGATOR
  spacer: {
    height: 100,
  },
});