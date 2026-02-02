import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  Modal,
  StatusBar,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { API, SOCKET_URL } from '../../services/api';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

/* ================= UTIL ================= */

const getToken = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan');
  return token;
};

const bulanNama = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

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

/* ================= SCREEN ================= */

function AdminJadwalScreen() {
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<number | null>(null);
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [maxAbsen, setMaxAbsen] = useState('');
  const [settingId, setSettingId] = useState<number | null>(null);

  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('10:00');

  const [tanggalMulai, setTanggalMulai] = useState<Date>(new Date());
  const [tanggalSelesai, setTanggalSelesai] = useState<Date>(new Date());

  const [showTM, setShowTM] = useState(false);
  const [showTS, setShowTS] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<any | null>(null);

  const [editJamMulai, setEditJamMulai] = useState('');
  const [editJamSelesai, setEditJamSelesai] = useState('');
  const [editTanggal, setEditTanggal] = useState<Date>(new Date());

  /* ================= JAM OPTION ================= */

  const jamOptions = useMemo(() => {
    return Array.from({ length: 96 }, (_, i) => {
      const h = String(Math.floor(i / 4)).padStart(2, '0');
      const m = String((i % 4) * 15).padStart(2, '0');
      return `${h}:${m}`;
    });
  }, []);

  /* ================= SOCKET ================= */
  const socket = useMemo(
    () => io(SOCKET_URL, { transports: ['websocket'] }),
    [],
  );

  /* ================= FETCH ================= */

  const fetchKelas = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/kelas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKelasList(res.data.data || []);
    } catch (e: any) {
      console.log(e.response || e.message);
      showAlert.error(
        'Gagal Memuat Data',
        'Tidak dapat mengambil data kelas. Periksa koneksi internet Anda.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJadwal = useCallback(async (kelasId: number) => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/jadwal/kelas/${kelasId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJadwal(res.data.data || []);
    } catch (e: any) {
      console.log(e.response || e.message);
      showAlert.error(
        'Gagal Memuat Data',
        'Tidak dapat mengambil jadwal kelas.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAbsensiSetting = useCallback(async (kelasId: number) => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/absensi-setting/kelas/${kelasId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.data) {
        setMaxAbsen(String(res.data.data.maxAbsen));
        setSettingId(res.data.data.id);
      } else {
        setMaxAbsen('');
        setSettingId(null);
      }
    } catch (e: any) {
      console.log(e.response || e.message);
      showAlert.error(
        'Gagal Memuat Data',
        'Tidak dapat mengambil setting absensi.'
      );
    }
  }, []);

  const loadData = useCallback(async () => {
    await fetchKelas();
    if (selectedKelas) {
      await Promise.all([
        fetchJadwal(selectedKelas),
        fetchAbsensiSetting(selectedKelas)
      ]);
    }
    setRefreshing(false);
  }, [fetchKelas, fetchJadwal, fetchAbsensiSetting, selectedKelas]);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const onKelasChange = (id: number) => {
    setSelectedKelas(id);
    fetchJadwal(id);
    fetchAbsensiSetting(id);
  };

  /* ================= GROUP ================= */

  const jadwalPerBulan = useMemo(() => {
    const map: Record<string, any[]> = {};
    jadwal.forEach(j => {
      const d = new Date(j.tanggal);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(j);
    });
    return map;
  }, [jadwal]);

  /* ================= ACTION ================= */

  const saveMaxAbsen = async () => {
    if (!selectedKelas || !maxAbsen) {
      showAlert.validation('Pilih kelas dan isi batas absen terlebih dahulu.');
      return;
    }

    showAlert.confirm(
      'Simpan Batas Absen',
      `Anda akan mengatur batas absen maksimal ${maxAbsen} kali.`,
      async () => {
        setLoading(true);
        try {
          const token = await getToken();
          if (settingId) {
            await axios.put(
              `${API}/absensi-setting/${settingId}`,
              { maxAbsen: Number(maxAbsen) },
              { headers: { Authorization: `Bearer ${token}` } },
            );
          } else {
            await axios.post(
              `${API}/absensi-setting/kelas/${selectedKelas}`,
              { maxAbsen: Number(maxAbsen) },
              { headers: { Authorization: `Bearer ${token}` } },
            );
          }
          socket.emit('absensi-setting-changed', { kelasId: selectedKelas });
          showAlert.success(
            'Berhasil Disimpan',
            `Batas absen ${maxAbsen} kali berhasil disimpan.`
          );
        } catch (e: any) {
          console.log(e.response || e.message);
          const errorMessage = e.response?.data?.message ?? 'Gagal menyimpan batas absen.';
          showAlert.error(
            'Gagal Menyimpan',
            errorMessage
          );
        } finally {
          setLoading(false);
        }
      },
      {
        confirmText: 'Simpan Sekarang',
        cancelText: 'Periksa Kembali',
        type: 'info'
      }
    );
  };

  const createBulk = async () => {
    if (!tanggalMulai || !tanggalSelesai || !selectedKelas) {
      showAlert.validation('Pilih kelas dan tanggal terlebih dahulu.');
      return;
    }

    if (tanggalMulai > tanggalSelesai) {
      showAlert.validation('Tanggal mulai tidak boleh lebih besar dari tanggal selesai.');
      return;
    }

    if (
      jadwal.some(
        j => new Date(j.tanggal).toDateString() === tanggalMulai.toDateString(),
      )
    ) {
      showAlert.warning(
        'Validasi',
        'Tanggal sudah memiliki jadwal. Pilih tanggal lain.'
      );
      return;
    }

    showAlert.confirm(
      'Buat Jadwal Massal',
      `Anda akan membuat jadwal dari ${tanggalMulai.toLocaleDateString('id-ID')} hingga ${tanggalSelesai.toLocaleDateString('id-ID')} dengan jam ${jamMulai} - ${jamSelesai}.`,
      async () => {
        setLoading(true);
        try {
          const token = await getToken();
          await axios.post(
            `${API}/jadwal/bulk`,
            {
              kelasId: selectedKelas,
              jamMulai,
              jamSelesai,
              tanggalMulai: tanggalMulai.toISOString().split('T')[0],
              tanggalSelesai: tanggalSelesai.toISOString().split('T')[0],
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          socket.emit('jadwal-changed', { kelasId: selectedKelas });
          showAlert.success(
            'Berhasil Dibuat',
            'Jadwal massal berhasil dibuat.',
            () => fetchJadwal(selectedKelas)
          );
        } catch (e: any) {
          console.log(e.response || e.message);
          const errorMessage = e.response?.data?.message ?? 'Gagal membuat jadwal massal.';
          showAlert.error(
            'Gagal Membuat',
            errorMessage
          );
        } finally {
          setLoading(false);
        }
      },
      {
        confirmText: 'Buat Sekarang',
        cancelText: 'Periksa Kembali',
        type: 'info'
      }
    );
  };

  const deleteJadwal = async (id: number, hari: string, tanggal: string) => {
    showAlert.confirm(
      'Konfirmasi Penghapusan',
      `Apakah Anda yakin ingin menghapus jadwal ${hari} (${tanggal})?`,
      async () => {
        setLoading(true);
        try {
          const token = await getToken();
          await axios.delete(`${API}/jadwal/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          socket.emit('jadwal-changed', { kelasId: selectedKelas });
          showAlert.success(
            'Berhasil Dihapus',
            'Jadwal berhasil dihapus.',
            () => fetchJadwal(selectedKelas!)
          );
        } catch (e: any) {
          console.log(e.response || e.message);
          const errorMessage = e.response?.data?.message ?? 'Gagal menghapus jadwal.';
          showAlert.error(
            'Gagal Menghapus',
            errorMessage
          );
        } finally {
          setLoading(false);
        }
      },
      {
        confirmText: 'Hapus',
        cancelText: 'Batal',
        type: 'warning'
      }
    );
  };

  const submitEdit = async () => {
    if (!editingJadwal) return;
    
    showAlert.confirm(
      'Edit Jadwal',
      'Anda akan mengubah jadwal. Pastikan data sudah benar.',
      async () => {
        setLoading(true);
        try {
          const token = await getToken();
          const payload: any = {
            jamMulai: editJamMulai,
            jamSelesai: editJamSelesai,
          };
          if (editingJadwal.absensi && editingJadwal.absensi.length === 0 && editTanggal) {
            payload.tanggal = editTanggal.toISOString().split('T')[0];
          }
          await axios.put(`${API}/jadwal/${editingJadwal.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          socket.emit('jadwal-changed', { kelasId: selectedKelas });
          setEditVisible(false);
          showAlert.success(
            'Berhasil Diperbarui',
            'Jadwal berhasil diperbarui.',
            () => fetchJadwal(selectedKelas!)
          );
        } catch (e: any) {
          console.log(e.response || e.message);
          const errorMessage = e.response?.data?.message ?? 'Gagal memperbarui jadwal.';
          showAlert.error(
            'Gagal Memperbarui',
            errorMessage
          );
        } finally {
          setLoading(false);
        }
      },
      {
        confirmText: 'Simpan Perubahan',
        cancelText: 'Batal',
        type: 'info'
      }
    );
  };

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    const handleJadwalChanged = ({ kelasId }: { kelasId: number }) => {
      if (selectedKelas === kelasId) fetchJadwal(kelasId);
    };

    const handleAbsensiSettingChanged = ({ kelasId }: { kelasId: number }) => {
      if (selectedKelas === kelasId) fetchAbsensiSetting(kelasId);
    };

    socket.on('jadwal-changed', handleJadwalChanged);
    socket.on('absensi-setting-changed', handleAbsensiSettingChanged);
    
    return () => {
      socket.off('jadwal-changed', handleJadwalChanged);
      socket.off('absensi-setting-changed', handleAbsensiSettingChanged);
    };
  }, [selectedKelas, fetchJadwal, fetchAbsensiSetting, socket]);

  /* ================= STATE HANDLING ================= */

  if (loading && !selectedKelas && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.centerLoadingText}>Menyiapkan data jadwal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Manajemen Jadwal</Text>
      <Text style={styles.headerSubtitle}>
        Kelola jadwal dan batas absensi kelas
      </Text>
    </View>
  );

  const renderContent = () => (
    <>
      {/* PILIH KELAS CARD */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <FontAwesomeIcon
              name="search"
              size={16}
              color="#2563eb"
              style={styles.cardTitleIcon}
            />
            <Text style={styles.cardTitle}>Pilih Kelas</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Pilih kelas untuk mengelola jadwal
          </Text>
        </View>
        
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedKelas ?? undefined}
            onValueChange={onKelasChange}
            style={styles.picker}
            dropdownIconColor="#6b7280"
          >
            <Picker.Item label="Pilih Kelas" value={null} />
            {kelasList.map(k => (
              <Picker.Item key={k.id} label={k.namaKelas} value={k.id} />
            ))}
          </Picker>
        </View>
      </View>

      {selectedKelas && (
        <>
          {/* BATAS ABSEN CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <FontAwesomeIcon
                  name="clipboard"
                  size={16}
                  color="#f59e0b"
                  style={styles.cardTitleIcon}
                />
                <Text style={styles.cardTitle}>Batas Absen</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                Tentukan jumlah maksimal absen yang diizinkan
              </Text>
            </View>
            
            <TextInput
              style={styles.input}
              value={maxAbsen}
              onChangeText={setMaxAbsen}
              keyboardType="numeric"
              placeholder="Contoh: 3"
              placeholderTextColor="#9ca3af"
            />
            
            <TouchableOpacity
              style={[styles.button, loading && styles.disabled]}
              onPress={saveMaxAbsen}
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
                  <Text style={styles.buttonText}>SIMPAN BATAS ABSEN</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* BUAT JADWAL CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <FontAwesomeIcon
                  name="calendar"
                  size={16}
                  color="#059669"
                  style={styles.cardTitleIcon}
                />
                <Text style={styles.cardTitle}>Buat Jadwal Baru</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                Tambah jadwal untuk rentang tanggal tertentu
              </Text>
            </View>

            <Text style={styles.inputLabel}>Jam Mulai</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={jamMulai}
                onValueChange={setJamMulai}
                style={styles.picker}
                dropdownIconColor="#6b7280"
              >
                {jamOptions.map(j => (
                  <Picker.Item key={j} label={j} value={j} />
                ))}
              </Picker>
            </View>

            <Text style={styles.inputLabel}>Jam Selesai</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={jamSelesai}
                onValueChange={setJamSelesai}
                style={styles.picker}
                dropdownIconColor="#6b7280"
              >
                {jamOptions.map(j => (
                  <Picker.Item key={j} label={j} value={j} />
                ))}
              </Picker>
            </View>

            <Text style={styles.inputLabel}>Tanggal Mulai</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowTM(true)}
              activeOpacity={0.85}
            >
              <View style={styles.dateInputContent}>
                <FontAwesomeIcon
                  name="calendar"
                  size={14}
                  color="#6b7280"
                  style={styles.dateInputIcon}
                />
                <Text style={styles.dateInputText}>
                  {tanggalMulai?.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) || 'Pilih Tanggal Mulai'}
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Tanggal Selesai</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowTS(true)}
              activeOpacity={0.85}
            >
              <View style={styles.dateInputContent}>
                <FontAwesomeIcon
                  name="calendar"
                  size={14}
                  color="#6b7280"
                  style={styles.dateInputIcon}
                />
                <Text style={styles.dateInputText}>
                  {tanggalSelesai?.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) || 'Pilih Tanggal Selesai'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.disabled]}
              onPress={createBulk}
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
                    name="calendar"
                    size={14}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>BUAT JADWAL</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* LIST JADWAL PER BULAN */}
          {Object.entries(jadwalPerBulan).map(([key, list]) => {
            const [year, month] = key.split('-');
            return (
              <View style={styles.listCard} key={key}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <FontAwesomeIcon
                      name="calendar"
                      size={16}
                      color="#7c3aed"
                      style={styles.cardTitleIcon}
                    />
                    <Text style={styles.cardTitle}>
                      {bulanNama[+month]} {year}
                    </Text>
                  </View>
                  <Text style={styles.cardSubtitle}>
                    {list.length} jadwal tersedia
                  </Text>
                </View>
                
                {list.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <FontAwesomeIcon
                      name="calendar"
                      size={24}
                      color="#d1d5db"
                    />
                    <Text style={styles.emptyText}>Belum ada jadwal</Text>
                    <Text style={styles.emptySubtext}>Tambahkan jadwal baru untuk bulan ini</Text>
                  </View>
                ) : (
                  <FlatList
                    data={list}
                    numColumns={2}
                    scrollEnabled={false}
                    keyExtractor={i => i.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.listItem}>
                        <View style={styles.listItemHeader}>
                          <View style={styles.dayIcon}>
                            <FontAwesomeIcon
                              name="calendar"
                              size={14}
                              color="#2563eb"
                            />
                          </View>
                          <Text style={styles.itemDay}>{item.hari}</Text>
                        </View>
                        <Text style={styles.itemDate}>
                          {new Date(item.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </Text>
                        <Text style={styles.itemTime}>
                          {item.jamMulai} - {item.jamSelesai}
                        </Text>
                        <View style={styles.itemActions}>
                          <TouchableOpacity 
                            onPress={() => deleteJadwal(item.id, item.hari, item.tanggal)}
                            style={styles.deleteButton}
                            activeOpacity={0.85}
                          >
                            <FontAwesomeIcon
                              name="trash"
                              size={12}
                              color="#ef4444"
                              style={styles.deleteButtonIcon}
                            />
                            <Text style={styles.deleteText}>Hapus</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingJadwal(item);
                              setEditJamMulai(item.jamMulai);
                              setEditJamSelesai(item.jamSelesai);
                              setEditTanggal(new Date(item.tanggal));
                              setEditVisible(true);
                            }}
                            style={styles.editButton}
                            activeOpacity={0.85}
                          >
                            <FontAwesomeIcon
                              name="edit"
                              size={12}
                              color="#2563eb"
                              style={styles.editButtonIcon}
                            />
                            <Text style={styles.editText}>Edit</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                )}
              </View>
            );
          })}
        </>
      )}

      {/* SPACER UNTUK NAVIGATOR */}
      <View style={styles.spacer} />
    </>
  );

  /* ================= UI ================= */

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

      {/* MODAL EDIT */}
      <Modal visible={editVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <FontAwesomeIcon
                  name="edit"
                  size={18}
                  color="#2563eb"
                  style={styles.modalHeaderIcon}
                />
                <Text style={styles.modalTitle}>Edit Jadwal</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setEditVisible(false)}
                style={styles.modalCloseButton}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Jam Mulai</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={editJamMulai}
                onValueChange={setEditJamMulai}
                style={styles.picker}
              >
                {jamOptions.map(j => (
                  <Picker.Item key={j} label={j} value={j} />
                ))}
              </Picker>
            </View>

            <Text style={styles.modalSubtitle}>Jam Selesai</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={editJamSelesai}
                onValueChange={setEditJamSelesai}
                style={styles.picker}
              >
                {jamOptions.map(j => (
                  <Picker.Item key={j} label={j} value={j} />
                ))}
              </Picker>
            </View>

            <Text style={styles.modalSubtitle}>Tanggal</Text>
            <TouchableOpacity
              disabled={editingJadwal?.absensi?.length > 0}
              style={[
                styles.dateInput,
                editingJadwal?.absensi?.length > 0 && styles.disabledInput
              ]}
              onPress={() => setShowTM(true)}
              activeOpacity={0.85}
            >
              <View style={styles.dateInputContent}>
                <FontAwesomeIcon
                  name="calendar"
                  size={14}
                  color={editingJadwal?.absensi?.length > 0 ? "#9ca3af" : "#6b7280"}
                  style={styles.dateInputIcon}
                />
                <Text style={[
                  styles.dateInputText,
                  editingJadwal?.absensi?.length > 0 && styles.disabledText
                ]}>
                  {editTanggal?.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) || 'Pilih Tanggal'}
                </Text>
              </View>
            </TouchableOpacity>

            {editingJadwal?.absensi?.length > 0 && (
              <View style={styles.warningContainer}>
                <FontAwesomeIcon
                  name="exclamation-triangle"
                  size={12}
                  color="#f59e0b"
                  style={styles.warningIcon}
                />
                <Text style={styles.warningText}>
                  Jadwal sudah digunakan absensi, tanggal tidak bisa diubah
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabled]}
                onPress={submitEdit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={styles.saveButtonContent}>
                    <FontAwesomeIcon
                      name="save"
                      size={14}
                      color="#fff"
                      style={styles.saveButtonIcon}
                    />
                    <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DATE TIME PICKERS - HARUS DILUAR MODAL */}
      {showTM && (
        <DateTimePicker
          value={tanggalMulai || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowTM(false);
            if (selectedDate) {
              setTanggalMulai(selectedDate);
            }
          }}
        />
      )}
      {showTS && (
        <DateTimePicker
          value={tanggalSelesai || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowTS(false);
            if (selectedDate) {
              setTanggalSelesai(selectedDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

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
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    letterSpacing: 0.2,
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
    marginBottom: 16,
  },

  pickerContainer: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },

  picker: {
    backgroundColor: "#f8fafc",
    color: "#1e293b",
    fontSize: 15,
  },

  dateInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },

  dateInputContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  dateInputIcon: {
    marginRight: 12,
  },

  dateInputText: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
    flex: 1,
  },

  disabledInput: {
    backgroundColor: "#f3f4f6",
    opacity: 0.7,
  },

  disabledText: {
    color: "#9ca3af",
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

  /* LIST ITEM STYLES */
  listItem: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    margin: 6,
    flex: 1,
  },

  listItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  dayIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  itemDay: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: 0.2,
  },

  itemDate: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 4,
  },

  itemTime: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 12,
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },

  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    flex: 1,
    marginRight: 6,
    justifyContent: "center",
  },

  deleteButtonIcon: {
    marginRight: 6,
  },

  deleteText: {
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dbeafe",
    flex: 1,
    marginLeft: 6,
    justifyContent: "center",
  },

  editButtonIcon: {
    marginRight: 6,
  },

  editText: {
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

  /* SPACER UNTUK NAVIGATOR */
  spacer: {
    height: 100,
  },

  /* MODAL STYLES */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  modalHeaderIcon: {
    marginRight: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.3,
  },

  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCloseText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginTop: 4,
    marginBottom: 16,
  },

  warningIcon: {
    marginRight: 8,
  },

  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
    flex: 1,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },

  cancelButtonText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },

  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  saveButtonIcon: {
    marginRight: 8,
  },

  saveButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default AdminJadwalScreen;