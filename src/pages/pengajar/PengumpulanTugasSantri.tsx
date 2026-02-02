import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  StatusBar,
  Platform,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { API } from '../../services/api';
import { Icon } from 'react-native-elements';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

interface Submission {
  id: number;
  status: 'pending' | 'submitted' | 'reviewed' | 'rejected';
  isGraded: boolean;
  linkUrl?: string | null;
  submittedAt: string;
  user: {
    name: string;
  };
  tugas: {
    id: number;
    title: string;
  };
}

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

const PengajarSubmissionScreen = () => {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API}/submission/pengajar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Map status dan cek apakah sudah dinilai
      const submissions = res.data.data.map((s: any) => ({
        ...s,
        isGraded: s.nilai !== undefined && s.nilai !== null,
      }));
      setData(submissions);
    } catch (err: any) {
      console.log('Fetch error:', err.response || err.message);
      showAlert.error(
        'Gagal Memuat Data',
        'Tidak dapat mengambil data pengumpulan tugas. Periksa koneksi internet Anda.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubmission();
  };

  useEffect(() => {
    fetchSubmission();
  }, []);

  const updateStatus = async (id: number, status: 'reviewed' | 'rejected', santriName: string, tugasTitle: string) => {
    const statusText = status === 'reviewed' ? 'diterima' : 'ditolak';
    
    showAlert.confirm(
      status === 'reviewed' ? '✅ Terima Pengumpulan' : '❌ Tolak Pengumpulan',
      `Apakah Anda yakin ingin ${statusText} pengumpulan tugas "${tugasTitle}" dari ${santriName}?`,
      async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          await axios.put(
            `${API}/submission/${id}/status`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          
          showAlert.success(
            status === 'reviewed' ? '✅ Berhasil Diterima' : '⚠️ Berhasil Ditolak',
            `Pengumpulan tugas dari ${santriName} telah ${statusText}.`,
            () => fetchSubmission()
          );
        } catch (err: any) {
          console.log('Update error:', err.response || err.message);
          const errorMessage = err.response?.data?.message ?? 'Gagal memperbarui status pengumpulan.';
          showAlert.error(
            '⚠️ Gagal Memperbarui',
            errorMessage
          );
        }
      },
      {
        confirmText: status === 'reviewed' ? 'Terima' : 'Tolak',
        cancelText: 'Batal',
        type: status === 'reviewed' ? 'success' : 'warning'
      }
    );
  };

  const openLink = async (url?: string | null) => {
    if (!url) {
      showAlert.info(
        '📋 Informasi',
        'URL tugas tidak tersedia.'
      );
      return;
    }
    
    showAlert.confirm(
      '🔗 Buka Tugas',
      'Anda akan membuka tugas santri di browser. Pastikan koneksi internet stabil.',
      async () => {
        try {
          const finalUrl = url.startsWith('http') ? url : `https://${url}`;
          await Linking.openURL(finalUrl);
        } catch {
          showAlert.error(
            '⚠️ Gagal Membuka',
            'Tidak dapat membuka URL. Pastikan URL valid dan terhubung ke internet.'
          );
        }
      },
      {
        confirmText: 'Buka Sekarang',
        cancelText: 'Batal',
        type: 'info'
      }
    );
  };

  const navigateToGrade = (submissionId: number, santriName: string, tugasTitle: string) => {
    showAlert.confirm(
      '📝 Berikan Nilai',
      `Anda akan memberikan nilai untuk tugas "${tugasTitle}" dari ${santriName}.`,
      () => {
        navigation.navigate('Nilai', {
          submissionId,
          santriName,
          tugasTitle,
        });
      },
      {
        confirmText: 'Lanjutkan',
        cancelText: 'Nanti Saja',
        type: 'info'
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'submitted':
        return '#3b82f6';
      case 'reviewed':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'clock';
      case 'submitted':
        return 'paper-plane';
      case 'reviewed':
        return 'check-circle';
      case 'rejected':
        return 'times-circle';
      default:
        return 'question-circle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'submitted':
        return 'Terkirim';
      case 'reviewed':
        return 'Diterima';
      case 'rejected':
        return 'Ditolak';
      default:
        return 'Tidak Diketahui';
    }
  };

  const renderItem = ({ item }: { item: Submission }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: `${statusColor}15` }]}>
              <Icon
                name={getStatusIcon(item.status)}
                type="font-awesome"
                size={16}
                color={statusColor}
              />
            </View>
          </View>
          
          <View style={styles.cardTitleContainer}>
            <Text style={styles.santri}>{item.user.name}</Text>
            <Text style={styles.task}>{item.tugas.title}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Icon
              name="calendar"
              type="font-awesome"
              size={12}
              color="#64748b"
              style={styles.infoIcon}
            />
            <Text style={styles.date}>
              Dikirim: {new Date(item.submittedAt).toLocaleString('id-ID')}
            </Text>
          </View>

          {item.linkUrl && (
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => openLink(item.linkUrl)}
              activeOpacity={0.85}
            >
              <View style={styles.linkContent}>
                <Icon
                  name="external-link"
                  type="font-awesome"
                  size={14}
                  color="#2563eb"
                  style={styles.linkIcon}
                />
                <Text style={styles.link}>Buka Tugas</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <Icon
                name={getStatusIcon(item.status)}
                type="font-awesome"
                size={12}
                color={statusColor}
                style={styles.statusIcon}
              />
              <Text style={[styles.status, { color: statusColor }]}>
                {getStatusText(item.status).toUpperCase()}
              </Text>
            </View>

            <View style={styles.actionRow}>
              {item.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => updateStatus(item.id, 'rejected', item.user.name, item.tugas.title)}
                    activeOpacity={0.85}
                  >
                    <Icon
                      name="times"
                      type="font-awesome"
                      size={12}
                      color="#ef4444"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.rejectText}>Tolak</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => updateStatus(item.id, 'reviewed', item.user.name, item.tugas.title)}
                    activeOpacity={0.85}
                  >
                    <Icon
                      name="check"
                      type="font-awesome"
                      size={12}
                      color="#10b981"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.acceptText}>Terima</Text>
                  </TouchableOpacity>
                </>
              )}

              {item.status === 'reviewed' && !item.isGraded && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.gradeButton]}
                  onPress={() => navigateToGrade(item.id, item.user.name, item.tugas.title)}
                  activeOpacity={0.85}
                >
                  <Icon
                    name="pencil"
                    type="font-awesome"
                    size={12}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.gradeText}>Berikan Nilai</Text>
                </TouchableOpacity>
              )}

              {item.isGraded && (
                <View style={styles.gradedBadge}>
                  <Icon
                    name="check-circle"
                    type="font-awesome"
                    size={12}
                    color="#10b981"
                    style={styles.gradedIcon}
                  />
                  <Text style={styles.gradedLabel}>Sudah Dinilai</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* Render Alert Provider */}
      <AlertProvider />
      
      <View style={styles.container}>
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
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Pengumpulan Tugas</Text>
            <Text style={styles.headerSubtitle}>
              Kelola dan nilai tugas yang dikumpulkan santri
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Memuat data pengumpulan...</Text>
            </View>
          ) : data.length > 0 ? (
            <View style={styles.listContainer}>
              <View style={styles.listHeader}>
                <View style={styles.listHeaderContent}>
                  <Icon
                    name="list-alt"
                    type="font-awesome"
                    size={16}
                    color="#2563eb"
                    style={styles.listHeaderIcon}
                  />
                  <Text style={styles.totalText}>Total: {data.length} pengumpulan</Text>
                </View>
                <TouchableOpacity 
                  style={styles.filterButton}
                  onPress={onRefresh}
                  activeOpacity={0.85}
                >
                  <Icon
                    name="refresh"
                    type="font-awesome"
                    size={14}
                    color="#2563eb"
                  />
                </TouchableOpacity>
              </View>

              <FlatList
                data={data}
                keyExtractor={i => i.id.toString()}
                renderItem={renderItem}
                scrollEnabled={false}
                contentContainerStyle={styles.flatListContent}
              />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon
                name="inbox"
                type="font-awesome"
                size={56}
                color="#d1d5db"
              />
              <Text style={styles.emptyText}>Belum ada pengumpulan tugas</Text>
              <Text style={styles.emptySubtext}>
                Santri belum mengumpulkan tugas atau semua tugas sudah dinilai
              </Text>
            </View>
          )}
          
          {/* SPACER UNTUK NAVIGATOR */}
          <View style={styles.spacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default PengajarSubmissionScreen;

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  scrollContent: {
    paddingBottom: 100,
  },
  
  /* HEADER */
  header: {
    backgroundColor: '#1e3a8a',
    paddingTop: Platform.OS === 'android' ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
  },
  
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  
  headerSubtitle: {
    color: '#c7d2fe',
    fontSize: 14,
    fontWeight: '500',
  },
  
  /* LOADING STATE */
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#f8fafc',
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  
  /* LIST CONTAINER */
  listContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  
  listHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  listHeaderIcon: {
    marginRight: 10,
  },
  
  totalText: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dbeafe',
  },
  
  flatListContent: {
    paddingBottom: 20,
  },
  
  /* CARD STYLES */
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  
  avatarContainer: {
    marginRight: 16,
  },
  
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  
  cardTitleContainer: {
    flex: 1,
  },
  
  santri: { 
    fontSize: 17, 
    fontWeight: '800', 
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  
  task: { 
    fontSize: 14, 
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  
  cardContent: {
    padding: 20,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  infoIcon: {
    marginRight: 8,
  },
  
  date: { 
    fontSize: 13, 
    color: '#64748b', 
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  
  linkButton: {
    marginBottom: 16,
  },
  
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#dbeafe',
  },
  
  linkIcon: {
    marginRight: 10,
  },
  
  link: { 
    color: '#2563eb', 
    fontWeight: '700', 
    fontSize: 14,
    letterSpacing: 0.2,
  },
  
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  
  statusIcon: {
    marginRight: 8,
  },
  
  status: { 
    fontWeight: '800', 
    fontSize: 12,
    letterSpacing: 0.3,
  },
  
  actionRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1.5,
  },
  
  buttonIcon: {
    marginRight: 8,
  },
  
  rejectButton: { 
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  
  rejectText: { 
    color: '#ef4444', 
    fontWeight: '800', 
    fontSize: 12,
    letterSpacing: 0.2,
  },
  
  acceptButton: { 
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
  },
  
  acceptText: { 
    color: '#10b981', 
    fontWeight: '800', 
    fontSize: 12,
    letterSpacing: 0.2,
  },
  
  gradeButton: { 
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  
  gradeText: { 
    color: '#fff', 
    fontWeight: '800', 
    fontSize: 12,
    letterSpacing: 0.2,
  },
  
  gradedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1.5,
    borderColor: '#dcfce7',
  },
  
  gradedIcon: {
    marginRight: 8,
  },
  
  gradedLabel: { 
    color: '#10b981', 
    fontWeight: '800', 
    fontSize: 12,
    letterSpacing: 0.2,
  },
  
  /* EMPTY STATE */
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  
  emptySubtext: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '400',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  
  /* SPACER UNTUK NAVIGATOR */
  spacer: {
    height: 100,
  },
});