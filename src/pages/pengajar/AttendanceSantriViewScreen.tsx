import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Image,
  Modal,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from 'react-native-elements';
import { API } from '../../services/api';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

interface Santri {
  id: number;
  name: string;
  profile?: {
    fotoUrl?: string | null;
  } | null;
}

interface Absensi {
  id: number;
  userId: number;
  tanggal: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
}

interface Kelas {
  id: number;
  namaKelas: string;
  santri: Santri[];
  absensi: Absensi[];
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
    }
  };

  return {
    AlertProvider,
    showAlert: showAlertHelper,
  };
};

const { AlertProvider, showAlert } = createAlertHelper();

/* ================== COMPONENT ================== */

const KelasScreen: React.FC = () => {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedAbsensi, setSelectedAbsensi] = useState<Absensi | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'hadir' | 'izin' | 'sakit' | 'alpha'>('hadir');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  const sortedAbsensi = useMemo(() => {
    if (!selectedKelas?.absensi) return [];

    return [...selectedKelas.absensi].sort((a, b) => {
      const timeA = new Date(a.tanggal).getTime();
      const timeB = new Date(b.tanggal).getTime();

      return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
    });
  }, [selectedKelas?.absensi, sortOrder]);

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const res = await axios.get<{ success: boolean; data: Kelas[] }>(
        `${API}/kelas`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setKelasList(res.data.data);

        if (selectedKelas) {
          const updated = res.data.data.find(k => k.id === selectedKelas.id);
          if (updated) {
            setSelectedKelas(updated);
          }
        }
      }
    } catch (error: any) {
      console.error(error.response || error.message);
      showAlert.error(
        'Gagal Memuat Data',
        'Tidak dapat mengambil data kelas. Periksa koneksi internet Anda.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchKelas();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hadir':
        return 'check-circle';
      case 'izin':
        return 'clock-o';
      case 'sakit':
        return 'heartbeat';
      case 'alpha':
        return 'times-circle';
      default:
        return 'question-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir':
        return '#059669';
      case 'izin':
        return '#f59e0b';
      case 'sakit':
        return '#2563eb';
      case 'alpha':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'hadir':
        return 'Hadir';
      case 'izin':
        return 'Izin';
      case 'sakit':
        return 'Sakit';
      case 'alpha':
        return 'Alpha';
      default:
        return 'Tidak Hadir';
    }
  };

  const getRandomColor = (id: number) => {
    const colors = ['#2563eb', '#7c3aed', '#059669', '#f59e0b', '#dc2626'];
    return colors[id % colors.length];
  };

  const renderKelasItem = ({ item }: { item: Kelas }) => (
    <TouchableOpacity
      style={styles.kelasCard}
      onPress={() => setSelectedKelas(item)}
      activeOpacity={0.85}
    >
      <View style={[styles.kelasIconContainer, { backgroundColor: `${getRandomColor(item.id)}15` }]}>
        <FontAwesomeIcon
          name="users"
          size={22}
          color={getRandomColor(item.id)}
        />
      </View>
      <View style={styles.kelasContent}>
        <Text style={styles.kelasTitle}>{item.namaKelas}</Text>
        <View style={styles.kelasInfo}>
          <View style={styles.kelasInfoItem}>
            <FontAwesomeIcon
              name="user"
              size={12}
              color="#6b7280"
            />
            <Text style={styles.kelasInfoText}>
              {item.santri.length} Santri
            </Text>
          </View>
          <View style={styles.kelasInfoItem}>
            <FontAwesomeIcon
              name="calendar"
              size={12}
              color="#6b7280"
            />
            <Text style={styles.kelasInfoText}>
              {item.absensi.length} Absensi
            </Text>
          </View>
        </View>
      </View>
      <FontAwesomeIcon
        name="chevron-right"
        size={14}
        color="#9ca3af"
      />
    </TouchableOpacity>
  );

  const renderAbsensiItem = ({ item }: { item: Santri }) => {
    const absensiUser = sortedAbsensi.filter(a => a.userId === item.id);

    return (
      <View style={styles.absensiCard}>
        <View style={styles.absensiHeader}>
          <View style={styles.avatarContainer}>
            {item.profile?.fotoUrl ? (
              <Image
                source={{ uri: `${API}${item.profile.fotoUrl}` }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: `${getRandomColor(item.id)}15` }]}>
                <Text style={[styles.avatarText, { color: getRandomColor(item.id) }]}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.santriInfo}>
            <Text style={styles.santriName}>{item.name}</Text>
            <Text style={styles.santriId}>ID: {item.id}</Text>
          </View>
        </View>

        <View style={styles.absensiContent}>
          {absensiUser && absensiUser.length > 0 ? (
            <FlatList
              data={absensiUser}
              scrollEnabled={false}
              keyExtractor={a => a.id.toString()}
              renderItem={({ item: absen }) => (
                <View style={styles.absensiRecord}>
                  <View style={styles.absensiRecordLeft}>
                    <View
                      style={[styles.statusBadge, { backgroundColor: `${getStatusColor(absen.status)}15` }]}
                    >
                      <FontAwesomeIcon
                        name={getStatusIcon(absen.status)}
                        size={14}
                        color={getStatusColor(absen.status)}
                      />
                      <Text
                        style={[styles.statusText, { color: getStatusColor(absen.status) }]}
                      >
                        {getStatusText(absen.status)}
                      </Text>
                    </View>
                    <Text style={styles.absensiDate}>
                      {new Date(absen.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setSelectedAbsensi(absen);
                      setSelectedStatus(absen.status);
                      setEditModal(true);
                    }}
                    activeOpacity={0.85}
                  >
                    <FontAwesomeIcon
                      name="edit"
                      size={14}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <View style={styles.noAbsensiContainer}>
              <FontAwesomeIcon
                name="calendar"
                size={16}
                color="#d1d5db"
              />
              <Text style={styles.noAbsensiText}>
                Belum ada catatan absensi
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const getAbsensiSummary = () => {
    if (!selectedKelas) return { hadir: 0, izin: 0, sakit: 0, alpha: 0 };

    const today = new Date().toDateString();
    const todayAbsensi = selectedKelas.absensi.filter(
      a => new Date(a.tanggal).toDateString() === today,
    );

    return {
      hadir: todayAbsensi.filter(a => a.status === 'hadir').length,
      izin: todayAbsensi.filter(a => a.status === 'izin').length,
      sakit: todayAbsensi.filter(a => a.status === 'sakit').length,
      alpha: todayAbsensi.filter(a => a.status === 'alpha').length,
    };
  };

  const updateAbsensiStatus = async () => {
    if (!selectedAbsensi) return;

    showAlert.confirm(
      'Ubah Status Absensi',
      `Anda akan mengubah status absensi menjadi ${getStatusText(selectedStatus)}.`,
      async () => {
        try {
          setLoading(true);
          const token = await AsyncStorage.getItem('token');

          await axios.put(
            `${API}/absensi/${selectedAbsensi?.id}`,
            { status: selectedStatus },
            { headers: { Authorization: `Bearer ${token}` } },
          );

          showAlert.success(
            'Berhasil Diperbarui',
            'Status absensi berhasil diperbarui.',
            () => {
              setEditModal(false);
              fetchKelas();
            }
          );
        } catch (error: any) {
          console.error(error.response || error.message);
          const errorMessage = error.response?.data?.message ?? 'Gagal memperbarui status absensi.';
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

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.centerLoadingText}>Menyiapkan data kelas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedKelas) {
    // Pilih kelas - HEADER SAMA PERSIS DENGAN DASHBOARD
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        
        {/* Render Alert Provider */}
        <AlertProvider />
        
        <ScrollView
          style={styles.container}
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER - SAMA DENGAN DASHBOARD PENGASAR */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Daftar Kelas</Text>
            <Text style={styles.headerSubtitle}>
              {kelasList.length} kelas tersedia
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              activeOpacity={0.85}
            >
              <FontAwesomeIcon
                name="refresh"
                size={16}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {kelasList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesomeIcon
                name="school"
                size={56}
                color="#d1d5db"
              />
              <Text style={styles.emptyText}>Tidak ada kelas</Text>
              <Text style={styles.emptySubtitle}>
                Belum ada data kelas yang tersedia
              </Text>
            </View>
          ) : (
            <View style={styles.kelasListContainer}>
              {kelasList.map(item => renderKelasItem({ item }))}
            </View>
          )}

          {/* SPACER UNTUK NAVIGATOR */}
          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const absensiSummary = getAbsensiSummary();
  const totalAbsensiToday =
    absensiSummary.hadir +
    absensiSummary.izin +
    absensiSummary.sakit +
    absensiSummary.alpha;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
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
        {/* HEADER - SAMA DENGAN DASHBOARD PENGASAR */}
        <View style={styles.header}>
          <View style={styles.headerBackContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedKelas(null)}
              activeOpacity={0.85}
            >
              <View style={styles.backButtonContent}>
                <FontAwesomeIcon
                  name="arrow-left"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.backText}>Kembali</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              activeOpacity={0.85}
            >
              <FontAwesomeIcon
                name="refresh"
                size={16}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.absensiTitle}>{selectedKelas.namaKelas}</Text>
          <View style={styles.absensiSubtitleContainer}>
            <View style={styles.subtitleItem}>
              <FontAwesomeIcon
                name="user"
                size={14}
                color="#c7d2fe"
              />
              <Text style={styles.absensiSubtitle}>
                {selectedKelas.santri.length} Santri
              </Text>
            </View>
            <View style={styles.subtitleItem}>
              <FontAwesomeIcon
                name="calendar"
                size={14}
                color="#c7d2fe"
              />
              <Text style={styles.absensiSubtitle}>
                {totalAbsensiToday} Absensi Hari Ini
              </Text>
            </View>
          </View>
        </View>

        {/* Summary Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <FontAwesomeIcon
                name="calendar"
                size={16}
                color="#059669"
                style={styles.cardTitleIcon}
              />
              <Text style={styles.cardTitle}>Rekap Absensi Hari Ini</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              Statistik kehadiran santri
            </Text>
          </View>

          <View style={styles.summaryGrid}>
            {[
              { key: 'hadir', label: 'Hadir', color: '#059669' },
              { key: 'izin', label: 'Izin', color: '#f59e0b' },
              { key: 'sakit', label: 'Sakit', color: '#2563eb' },
              { key: 'alpha', label: 'Alpha', color: '#dc2626' },
            ].map(({ key, label, color }) => (
              <View key={key} style={styles.summaryItem}>
                <View style={[styles.summaryBadge, { backgroundColor: `${color}15` }]}>
                  <Text style={[styles.summaryNumber, { color }]}>
                    {absensiSummary[key as keyof typeof absensiSummary]}
                  </Text>
                </View>
                <Text style={styles.summaryLabel}>{label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setSortOrder(sortOrder === 'latest' ? 'oldest' : 'latest')}
            style={styles.sortButton}
            activeOpacity={0.85}
          >
            <FontAwesomeIcon
              name={sortOrder === 'latest' ? 'sort-down' : 'sort-up'}
              size={14}
              color="#2563eb"
            />
            <Text style={styles.sortButtonText}>
              Urutkan: {sortOrder === 'latest' ? 'Terbaru' : 'Terlama'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Santri List */}
        <View style={styles.listCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <FontAwesomeIcon
                name="users"
                size={16}
                color="#7c3aed"
                style={styles.cardTitleIcon}
              />
              <Text style={styles.cardTitle}>Daftar Santri</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              Total: {selectedKelas.santri.length} santri
            </Text>
          </View>

          {selectedKelas.santri.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesomeIcon
                name="user-slash"
                size={24}
                color="#d1d5db"
              />
              <Text style={styles.emptyText}>Belum ada santri di kelas ini</Text>
              <Text style={styles.emptySubtext}>Santri akan muncul setelah ditambahkan ke kelas</Text>
            </View>
          ) : (
            <FlatList
              data={selectedKelas.santri}
              keyExtractor={item => item.id.toString()}
              renderItem={renderAbsensiItem}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.absensiList}
            />
          )}
        </View>

        {/* SPACER UNTUK NAVIGATOR */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Modal Edit Absensi */}
      <Modal
        visible={editModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <FontAwesomeIcon
                  name="edit"
                  size={18}
                  color="#2563eb"
                  style={styles.modalTitleIcon}
                />
                <Text style={styles.modalTitle}>Ubah Status Absensi</Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditModal(false)}
                style={styles.modalCloseButton}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalInfoContainer}>
              <Text style={styles.modalInfoTitle}>Data Absensi</Text>
              {selectedAbsensi && (
                <Text style={styles.modalInfoText}>
                  {new Date(selectedAbsensi.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              )}
            </View>

            <Text style={styles.modalSubtitle}>
              Pilih status baru untuk absensi ini:
            </Text>

            <View style={styles.statusOptionsContainer}>
              {['hadir', 'izin', 'sakit', 'alpha'].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusOption,
                    selectedStatus === s && {
                      backgroundColor: `${getStatusColor(s)}15`,
                      borderColor: getStatusColor(s),
                    },
                  ]}
                  onPress={() => setSelectedStatus(s as any)}
                  activeOpacity={0.85}
                >
                  <FontAwesomeIcon
                    name={getStatusIcon(s)}
                    size={16}
                    color={selectedStatus === s ? getStatusColor(s) : '#6b7280'}
                    style={styles.statusOptionIcon}
                  />
                  <View style={styles.statusOptionContent}>
                    <Text style={[
                      styles.statusOptionText,
                      selectedStatus === s && { color: getStatusColor(s), fontWeight: '700' }
                    ]}>
                      {getStatusText(s)}
                    </Text>
                    <Text style={styles.statusOptionDescription}>
                      {s === 'hadir' ? 'Santri hadir mengikuti kegiatan' :
                       s === 'izin' ? 'Santri izin dengan alasan' :
                       s === 'sakit' ? 'Santri tidak hadir karena sakit' :
                       'Santri tidak hadir tanpa keterangan'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabled]}
                onPress={updateAbsensiStatus}
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
    </SafeAreaView>
  );
};

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Loading State
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  centerLoadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  // HEADER - SAMA DENGAN DASHBOARD PENGASAR
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "android" ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
    marginBottom: 20,
  },
  headerBackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshButton: {
    position: 'absolute',
    top: Platform.OS === "android" ? 58 : 74,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  backButton: {
    marginTop: Platform.OS === "android" ? 8 : 12,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    color: '#fff',
    marginLeft: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  
  // Header untuk detail kelas
  absensiTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  absensiSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 20,
  },
  subtitleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  absensiSubtitle: {
    fontSize: 15,
    color: '#c7d2fe',
    marginLeft: 8,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  // Kelas List
  kelasListContainer: {
    paddingHorizontal: 20,
    marginTop: 0,
    paddingBottom: 16,
  },
  kelasCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  kelasIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  kelasContent: {
    flex: 1,
  },
  kelasTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  kelasInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kelasInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  kelasInfoText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 8,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  // Empty States
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '400',
    marginTop: 4,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '400',
    marginTop: 4,
    textAlign: 'center',
  },

  // MAIN CARD STYLES
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

  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignSelf: 'flex-start',
  },
  sortButtonText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.2,
  },

  // Santri List
  listTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111827",
  },

  // Absensi List
  absensiList: {
    paddingBottom: 40,
  },
  absensiCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  absensiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  santriInfo: {
    flex: 1,
  },
  santriName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  santriId: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  absensiContent: {
    paddingTop: 4,
  },
  absensiRecord: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  absensiRecordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  absensiDate: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginLeft: 16,
    letterSpacing: 0.2,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  noAbsensiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  noAbsensiText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 10,
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },

  // Modal
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
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitleIcon: {
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.3,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  modalInfoContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  modalInfoTitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  modalInfoText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 16,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  statusOptionsContainer: {
    marginBottom: 24,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  statusOptionIcon: {
    marginRight: 12,
  },
  statusOptionContent: {
    flex: 1,
  },
  statusOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  statusOptionDescription: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '400',
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  disabled: {
    opacity: 0.7,
  },

  // DITAMBAHKAN: Spacer untuk navigator
  spacer: {
    height: 100,
  },
});

export default KelasScreen;