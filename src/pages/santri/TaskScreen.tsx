import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Linking,
  StatusBar,
  Platform,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { API } from '../../services/api';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

interface Task {
  id: number;
  subject: string;
  title: string;
  description?: string;
  deadline: string;
  status: 'belum_submit' | 'pending' | 'reviewed' | 'rejected';
  submission_link?: string | null;
  submitted_at?: string | null;
}

/* =======================
   CUSTOM ALERT MODAL
======================= */
interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'confirm';
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
      case 'confirm':
        return <FontAwesomeIcon name="question-circle" size={64} color="#3b82f6" />;
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
      case 'confirm': return '#3b82f6';
      default: return '#111827';
    }
  };

  const getButtonColor = () => {
    switch(type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'confirm': return '#3b82f6';
      default: return '#2563eb';
    }
  };

  const getIconContainerStyle = () => {
    switch(type) {
      case 'success': return customAlertStyles.iconContainerSuccess;
      case 'error': return customAlertStyles.iconContainerError;
      case 'warning': return customAlertStyles.iconContainerWarning;
      case 'info': return customAlertStyles.iconContainerInfo;
      case 'confirm': return customAlertStyles.iconContainerInfo;
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
              {(type === 'confirm' || onCancel) && (
                <TouchableOpacity 
                  style={[customAlertStyles.button, customAlertStyles.cancelButton]}
                  onPress={onCancel || onClose}
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
                {type === 'confirm' && <FontAwesomeIcon name="check" size={16} color="#ffffff" style={customAlertStyles.buttonIcon} />}
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
    type: 'info' as 'success' | 'error' | 'info' | 'warning' | 'confirm',
    confirmText: 'OK',
    cancelText: 'Batal',
    onConfirm: undefined as (() => void) | undefined,
    onCancel: undefined as (() => void) | undefined,
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' | 'confirm' = 'info',
    options?: {
      confirmText?: string;
      cancelText?: string;
      onConfirm?: () => void;
      onCancel?: () => void;
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
        "📋 Validasi",
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
        type?: 'success' | 'error' | 'info' | 'warning' | 'confirm';
      }
    ) => {
      getAlertHook().showAlert(
        title,
        message,
        options?.type || 'confirm',
        {
          confirmText: options?.confirmText || 'Konfirmasi',
          cancelText: options?.cancelText || 'Batal',
          onConfirm,
          onCancel: () => {},
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

const TaskScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionLink, setSubmissionLink] = useState('');

  const fetchTasks = useCallback(async (showLoading = true) => {
    try {
      showLoading ? setLoading(true) : setRefreshing(true);

      const token = await AsyncStorage.getItem('token');

      const res = await axios.get(`${API}/tugas/santri`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formatted: Task[] = res.data.data.map((t: any) => {
        const submission = t.submission?.[0]; // submission santri ini

        return {
          id: t.id,
          subject: t.mataPelajaran?.nama ?? 'Mata Pelajaran',
          title: t.title,
          description: t.description,
          deadline: t.deadline,

          status: submission?.status ?? 'belum_submit',

          submission_link: submission?.linkUrl ?? null,
          submitted_at: submission?.submittedAt ?? null,
        };
      });

      setTasks(formatted);
    } catch (err: any) {
      console.log(err.response || err.message);
      showAlert.error(
        '⚠️ Gagal Memuat Data',
        'Tidak dapat mengambil data tugas. Periksa koneksi internet Anda.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const submitAssignment = async (taskId: number, taskTitle: string) => {
    if (!submissionLink.trim()) {
      showAlert.validation('Link tugas wajib diisi untuk mengumpulkan tugas.');
      return;
    }

    showAlert.confirm(
      '📤 Kumpulkan Tugas',
      `Anda akan mengumpulkan tugas "${taskTitle}". Pastikan link yang dimasukkan sudah benar.`,
      async () => {
        try {
          setSubmitting(true);
          const token = await AsyncStorage.getItem('token');

          await axios.post(
            `${API}/submission`,
            {
              tugasId: taskId,
              linkUrl: submissionLink,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          showAlert.success(
            '✅ Berhasil Dikumpulkan',
            'Tugas Anda berhasil dikumpulkan dan menunggu penilaian dari pengajar.',
            () => {
              setSelectedTask(null);
              setSubmissionLink('');
              fetchTasks(false);
            }
          );
        } catch (err: any) {
          console.log(err.response || err.message);
          const errorMessage = err.response?.data?.message ?? 'Gagal mengumpulkan tugas. Silakan coba lagi.';
          
          if (err.response?.status === 409) {
            showAlert.error(
              '⚠️ Sudah Dikumpulkan',
              'Tugas ini sudah dikumpulkan sebelumnya.'
            );
          } else if (err.response?.status === 400) {
            showAlert.error(
              '⚠️ Data Tidak Valid',
              errorMessage
            );
          } else {
            showAlert.error(
              '⚠️ Gagal Mengumpulkan',
              errorMessage
            );
          }
        } finally {
          setSubmitting(false);
        }
      },
      {
        confirmText: 'Kumpulkan Sekarang',
        cancelText: 'Periksa Kembali',
        type: 'info'
      }
    );
  };

  const isLate = (deadline: string) =>
    new Date(deadline).getTime() < new Date().getTime();

  const openLink = async (url: string) => {
    showAlert.confirm(
      '🔗 Buka Tugas',
      'Anda akan membuka tugas di browser. Pastikan koneksi internet stabil.',
      async () => {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
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

  const handleCloseModal = () => {
    showAlert.confirm(
      '❌ Batalkan Pengumpulan',
      'Apakah Anda yakin ingin membatalkan pengumpulan? Data link yang sudah dimasukkan akan hilang.',
      () => {
        setSelectedTask(null);
        setSubmissionLink('');
      },
      {
        confirmText: 'Ya, Batalkan',
        cancelText: 'Lanjutkan Mengisi',
        type: 'warning'
      }
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks(true);
    }, [fetchTasks]),
  );

  // Bagian renderItem di TaskScreen
  const renderItem = ({ item }: { item: Task }) => {
    const late = isLate(item.deadline) && item.status === 'pending';

    // Fungsi label status baru
    const getStatusLabel = (status: Task['status']) => {
      switch (status) {
        case 'belum_submit':
          return 'Belum Dikumpulkan';
        case 'pending':
          return 'Menunggu Penilaian';
        case 'reviewed':
          return 'Diterima';
        case 'rejected':
          return 'Ditolak';
      }
    };

    // Fungsi warna status
    const getStatusColor = (status: Task['status']) => {
      switch (status) {
        case 'belum_submit':
          return '#dc2626';
        case 'pending':
          return '#f59e0b';
        case 'reviewed':
          return '#059669';
        case 'rejected':
          return '#dc2626';
      }
    };

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.subjectContainer}>
            <Text style={styles.subject}>{item.subject}</Text>
          </View>
          <Text style={[styles.deadline, late && styles.late]}>
            {new Date(item.deadline).toLocaleDateString('id-ID')}
          </Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        {item.description && <Text style={styles.desc}>{item.description}</Text>}

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: `${getStatusColor(item.status)}15` }
          ]}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: getStatusColor(item.status) }
            ]} />
            <Text style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        {/* Tombol kumpulkan hanya muncul jika belum submit */}
        {item.status === 'belum_submit' && (
          <TouchableOpacity
            style={[styles.button, late && styles.lateBtn]}
            onPress={() => setSelectedTask(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {late ? 'Kumpulkan (Terlambat)' : 'Kumpulkan'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Submitted info */}
        {item.status !== 'belum_submit' && item.submitted_at && (
          <View style={styles.submittedContainer}>
            <Text style={styles.submittedDate}>
              Dikumpulkan: {new Date(item.submitted_at).toLocaleString('id-ID')}
            </Text>
          </View>
        )}

        {/* Link tugas */}
        {item.submission_link && (
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => openLink(item.submission_link!)}
            activeOpacity={0.85}
          >
            <Text style={styles.linkText}>Lihat Pengumpulan</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Daftar Tugas</Text>
        <Text style={styles.headerSubtitle}>
          {tasks.length} tugas tersedia
        </Text>
      </View>
    </View>
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listTitle}>Semua Tugas</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.centerLoadingText}>Memuat data tugas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* Render Alert Provider */}
      <AlertProvider />
      
      <FlatList
        data={tasks}
        keyExtractor={i => i.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => fetchTasks(false)}
            colors={['#2563eb']}
            tintColor="#2563eb"
            title="Menyegarkan data..."
            titleColor="#2563eb"
          />
        }
        contentContainerStyle={
          tasks.length === 0
            ? { flexGrow: 1, paddingBottom: 100 }
            : [styles.listContainer, { paddingBottom: 100 }]
        }
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderListHeader()}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Belum Ada Tugas</Text>
            <Text style={styles.emptySubtitle}>
              Saat ini belum ada tugas yang diberikan oleh pengajar.
            </Text>

            <TouchableOpacity
              style={styles.reloadBtn}
              onPress={() => fetchTasks(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.reloadText}>Muat Ulang</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />

      <Modal visible={!!selectedTask} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📤 Pengumpulan Tugas</Text>
              <TouchableOpacity 
                onPress={handleCloseModal}
                style={styles.modalCloseButton}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{selectedTask.title}</Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskSubject}>Mata Pelajaran: {selectedTask.subject}</Text>
                  <Text style={[styles.taskDeadline, isLate(selectedTask.deadline) && styles.late]}>
                    ⏰ Deadline: {new Date(selectedTask.deadline).toLocaleString('id-ID')}
                    {isLate(selectedTask.deadline) && ' (Terlambat)'}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Link Tugas <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.inputHint}>
                Masukkan link Google Drive, Github, atau platform lainnya
              </Text>

              <TextInput
                placeholder="https://drive.google.com/... atau https://github.com/..."
                placeholderTextColor="#9ca3af"
                value={submissionLink}
                onChangeText={setSubmissionLink}
                style={styles.input}
                autoCapitalize="none"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalNote}>
              <Text style={styles.noteText}>
                💡 Pastikan link dapat diakses oleh pengajar. Periksa kembali sebelum mengumpulkan.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, submitting && styles.disabled]}
                disabled={submitting}
                onPress={() =>
                  selectedTask && submitAssignment(selectedTask.id, selectedTask.title)
                }
                activeOpacity={0.85}
              >
                {submitting ? (
                  <View style={styles.buttonLoading}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.buttonLoadingText}>Mengirim...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>📤 Kumpulkan Tugas</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TaskScreen;

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
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
    color: '#6b7280',
    fontWeight: '500',
  },

  /* HEADER BLOK BIRU - SEKARANG DI DALAM LIST */
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

  // List Styles
  list: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  listHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  listTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: 0.3,
  },

  // List Container
  listContainer: {
    paddingTop: 0,
    paddingBottom: 32,
  },

  // Card Styles
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectContainer: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  subject: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  deadline: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  late: {
    color: "#dc2626",
    fontWeight: "700",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  desc: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 20,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#2563eb",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.5,
    fontSize: 14,
  },
  lateBtn: {
    backgroundColor: "#dc2626",
    shadowColor: "#dc2626",
  },
  submittedContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: "#f1f5f9",
  },
  submittedDate: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  linkContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  linkText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
    minHeight: 400,
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
    color: "#d1d5db",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#94a3b8",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#cbd5e1",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 22,
    paddingHorizontal: 40,
    marginBottom: 24,
    letterSpacing: 0.2,
  },
  reloadBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  reloadText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  // Modal Styles
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
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  taskInfo: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#f1f5f9',
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  taskMeta: {
    gap: 6,
  },
  taskSubject: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  taskDeadline: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  required: {
    color: "#ef4444",
    fontWeight: "800",
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#1e293b",
    minHeight: 100,
    fontWeight: '500',
  },
  modalNote: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#dbeafe',
  },
  noteText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.2,
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
    color: '#64748b',
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
  saveButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  buttonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonLoadingText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.7,
  },
});