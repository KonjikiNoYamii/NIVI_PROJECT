import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  StatusBar,
} from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

import { ApiResponse } from '../../types/task';
import { API } from '../../services/api';

/* =======================
   TYPES
======================= */
interface Kelas {
  id: number;
  namaKelas: string;
}

interface MataPelajaran {
  id: number;
  nama: string;
  kode: string;
}

interface CreateTaskRequest {
  title: string;
  description: string;
  mapelId: number | null;
  deadline: string;
  kelasId: number | null;
  attachment_url?: string;
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

/* =======================
   COMPONENT
======================= */
const TaskPengajar: React.FC = () => {
  const navigation = useNavigation();

  const [submitting, setSubmitting] = useState(false);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [loadingMapel, setLoadingMapel] = useState(true);
  const [showMapelModal, setShowMapelModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );

  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    mapelId: null,
    deadline: selectedDate.toISOString(),
    kelasId: null,
    attachment_url: '',
  });

  /* =======================
     FETCH DATA
  ======================= */
  const fetchKelasList = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        showAlert.error(
          "Autentikasi Gagal",
          "Sesi Anda telah berakhir. Silakan login kembali."
        );
        return;
      }

      const res = await axios.get<ApiResponse<Kelas[]>>(
        `${API}/kelas`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setKelasList(res.data.data);
      } else {
        showAlert.error(
          "Gagal Memuat Data",
          "Tidak dapat mengambil data kelas."
        );
      }
    } catch (err: any) {
      console.log(err.response || err.message);
      showAlert.error(
        "Gagal Memuat Data",
        "Tidak dapat mengambil data kelas. Periksa koneksi internet Anda."
      );
    } finally {
      setLoadingKelas(false);
    }
  }, []);

  const fetchMapel = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        showAlert.error(
          "Autentikasi Gagal",
          "Sesi Anda telah berakhir. Silakan login kembali."
        );
        return;
      }

      const res = await axios.get<ApiResponse<MataPelajaran[]>>(
        `${API}/mapel`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMapelList(res.data.data);
      } else {
        showAlert.error(
          "Gagal Memuat Data",
          "Tidak dapat mengambil data mata pelajaran."
        );
      }
    } catch (err: any) {
      console.log(err.response || err.message);
      showAlert.error(
        "Gagal Memuat Data",
        "Tidak dapat mengambil data mata pelajaran. Periksa koneksi internet Anda."
      );
    } finally {
      setLoadingMapel(false);
    }
  }, []);

  useEffect(() => {
    fetchKelasList();
    fetchMapel();
  }, []);

  /* =======================
     HANDLER
  ======================= */
  const handleInputChange = (
    field: keyof CreateTaskRequest,
    value: any
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowDateModal(false);
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        deadline: date.toISOString(),
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showAlert.validation("Judul tugas wajib diisi.");
      return false;
    }
    if (!formData.description.trim()) {
      showAlert.validation("Deskripsi tugas wajib diisi.");
      return false;
    }
    if (!formData.mapelId) {
      showAlert.validation("Pilih mata pelajaran untuk tugas ini.");
      return false;
    }
    if (!formData.kelasId) {
      showAlert.validation("Pilih kelas untuk tugas ini.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    showAlert.confirm(
      "Buat Tugas Baru",
      "Anda akan membuat tugas baru untuk santri. Pastikan data sudah benar.",
      async () => {
        try {
          setSubmitting(true);
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            showAlert.error(
              "Autentikasi Gagal",
              "Sesi Anda telah berakhir. Silakan login kembali."
            );
            setSubmitting(false);
            return;
          }

          await axios.post(`${API}/tugas`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          showAlert.success(
            "Berhasil Dibuat",
            `Tugas "${formData.title}" berhasil dibuat untuk santri.`,
            () => navigation.goBack()
          );
        } catch (error: any) {
          console.log(error.response || error.message);
          const errorMessage = error.response?.data?.message ?? "Gagal membuat tugas. Silakan coba lagi.";
          
          if (error.response?.status === 400) {
            showAlert.error(
              "Data Tidak Valid",
              errorMessage
            );
          } else if (error.response?.status === 401) {
            showAlert.error(
              "Autentikasi Gagal",
              "Sesi Anda telah berakhir. Silakan login kembali."
            );
          } else {
            showAlert.error(
              "Gagal Membuat Tugas",
              errorMessage
            );
          }
        } finally {
          setSubmitting(false);
        }
      },
      {
        confirmText: "Buat Sekarang",
        cancelText: "Periksa Kembali",
        type: "info"
      }
    );
  };

  const selectedMapel = mapelList.find(
    m => m.id === formData.mapelId
  );

  /* =======================
     RENDER
  ======================= */
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
            <Text style={styles.headerTitle}>Buat Tugas Baru</Text>
            <Text style={styles.headerSubtitle}>
              Form pembuatan tugas untuk santri
            </Text>
          </View>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon
              name="tasks"
              type="font-awesome"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* FORM CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Icon
                name="edit"
                type="font-awesome"
                size={16}
                color="#2563eb"
                style={styles.cardTitleIcon}
              />
              <Text style={styles.cardTitle}>Detail Tugas</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              Isi detail tugas yang akan diberikan
            </Text>
          </View>

          {/* JUDUL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Judul Tugas <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              placeholder="Masukkan judul tugas"
              placeholderTextColor="#9ca3af"
              value={formData.title}
              onChangeText={t => handleInputChange('title', t)}
              style={styles.input}
              maxLength={100}
            />
            <Text style={styles.charCount}>
              {formData.title.length}/100 karakter
            </Text>
          </View>

          {/* MATA PELAJARAN */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Mata Pelajaran <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.selectInput,
                !formData.mapelId && styles.selectInputEmpty
              ]}
              onPress={() => setShowMapelModal(true)}
              activeOpacity={0.85}
            >
              <View style={styles.selectContent}>
                {selectedMapel ? (
                  <View style={styles.selectedSubject}>
                    <View style={styles.subjectIconSmall}>
                      <Icon 
                        name="book" 
                        type="font-awesome" 
                        size={14} 
                        color="#2563eb" 
                      />
                    </View>
                    <Text style={styles.selectText}>
                      {selectedMapel.nama}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>
                    Pilih mata pelajaran
                  </Text>
                )}
              </View>
              <Icon 
                name="chevron-down" 
                type="font-awesome" 
                size={16} 
                color="#6b7280" 
              />
            </TouchableOpacity>
          </View>

          {/* DESKRIPSI */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Deskripsi <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={5}
              value={formData.description}
              onChangeText={t => handleInputChange('description', t)}
              placeholder="Tulis deskripsi tugas secara lengkap..."
              placeholderTextColor="#9ca3af"
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>
              {formData.description.length}/500 karakter
            </Text>
          </View>

          {/* DEADLINE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Deadline <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDateModal(true)}
              activeOpacity={0.85}
            >
              <Icon 
                name="calendar" 
                type="font-awesome" 
                size={16} 
                color="#2563eb" 
                style={styles.dateIcon}
              />
              <View style={styles.dateContent}>
                <Text style={styles.dateText}>
                  {selectedDate.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <Text style={styles.dateSubtext}>
                  Batas pengumpulan tugas
                </Text>
              </View>
              <Icon 
                name="chevron-right" 
                type="font-awesome" 
                size={16} 
                color="#9ca3af" 
              />
            </TouchableOpacity>
          </View>

          {/* KELAS */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>
                Pilih Kelas <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.kelasCount}>
                {kelasList.length} kelas tersedia
              </Text>
            </View>
            {loadingKelas ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#2563eb" size="small" />
                <Text style={styles.loadingText}>Memuat data kelas...</Text>
              </View>
            ) : (
              <View style={styles.kelasGrid}>
                {kelasList.map(k => (
                  <TouchableOpacity
                    key={k.id}
                    style={[
                      styles.kelasCard,
                      formData.kelasId === k.id && styles.kelasCardSelected,
                    ]}
                    onPress={() => handleInputChange('kelasId', k.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.kelasCardContent}>
                      <Icon
                        name="users"
                        type="font-awesome"
                        size={14}
                        color={formData.kelasId === k.id ? "#fff" : "#6b7280"}
                        style={styles.kelasIcon}
                      />
                      <Text style={[
                        styles.kelasText,
                        formData.kelasId === k.id && styles.kelasTextSelected
                      ]}>
                        {k.namaKelas}
                      </Text>
                    </View>
                    {formData.kelasId === k.id && (
                      <View style={styles.checkIcon}>
                        <Icon
                          name="check"
                          type="font-awesome"
                          size={12}
                          color="#fff"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[
              styles.button,
              submitting && styles.disabled
            ]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <View style={styles.buttonLoading}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.buttonLoadingText}>Membuat...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Icon
                  name="plus-circle"
                  type="font-awesome"
                  size={14}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>BUAT TUGAS</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            ⓘ Tugas akan langsung terkirim ke santri setelah dibuat
          </Text>
        </View>

        {/* SPACER UNTUK NAVIGATOR */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* MAPEL MODAL */}
      <Modal 
        visible={showMapelModal} 
        transparent 
        animationType="slide"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Icon
                  name="book"
                  type="font-awesome"
                  size={18}
                  color="#1e293b"
                  style={styles.modalTitleIcon}
                />
                <Text style={styles.modalTitle}>Pilih Mata Pelajaran</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowMapelModal(false)}
                style={styles.modalCloseButton}
                activeOpacity={0.85}
              >
                <Icon name="times" type="font-awesome" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalSubtitleContainer}>
              <Text style={styles.modalSubtitle}>
                {mapelList.length} mata pelajaran tersedia
              </Text>
            </View>
            <ScrollView 
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {mapelList.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.subjectItem,
                    formData.mapelId === m.id && styles.subjectItemSelected
                  ]}
                  onPress={() => {
                    handleInputChange('mapelId', m.id);
                    setShowMapelModal(false);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={styles.subjectInfo}>
                    <View style={[
                      styles.subjectIcon,
                      { backgroundColor: formData.mapelId === m.id ? '#2563eb' : '#f3f4f6' }
                    ]}>
                      <Icon 
                        name="book" 
                        type="font-awesome" 
                        size={16} 
                        color={formData.mapelId === m.id ? '#fff' : '#6b7280'} 
                      />
                    </View>
                    <View style={styles.subjectDetails}>
                      <Text style={[
                        styles.subjectName,
                        formData.mapelId === m.id && styles.subjectNameSelected
                      ]}>
                        {m.nama}
                      </Text>
                      <Text style={styles.subjectCode}>{m.kode}</Text>
                    </View>
                  </View>
                  {formData.mapelId === m.id && (
                    <View style={styles.subjectCheck}>
                      <Icon 
                        name="check" 
                        type="font-awesome" 
                        size={16} 
                        color="#2563eb" 
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DATE PICKER */}
      {showDateModal && (
        <Modal
          transparent
          animationType="fade"
          visible={showDateModal}
          onRequestClose={() => setShowDateModal(false)}
        >
          <View style={styles.dateModalOverlay}>
            <View style={styles.dateModalContent}>
              <View style={styles.dateModalHeader}>
                <View style={styles.dateModalTitleContainer}>
                  <Icon
                    name="calendar"
                    type="font-awesome"
                    size={18}
                    color="#1e293b"
                    style={styles.dateModalTitleIcon}
                  />
                  <Text style={styles.dateModalTitle}>📅 Pilih Deadline</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowDateModal(false)}
                  style={styles.dateModalClose}
                  activeOpacity={0.85}
                >
                  <Icon name="times" type="font-awesome" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <Text style={styles.dateModalSubtitle}>
                Pilih batas waktu pengumpulan tugas
              </Text>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                minimumDate={new Date()}
                onChange={handleDateChange}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                style={styles.datePicker}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.dateConfirmButton}
                  onPress={() => setShowDateModal(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.dateConfirmText}>PILIH TANGGAL</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

/* =======================
   STYLES
======================= */
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

  /* MAIN CARD */
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
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
    marginBottom: 24,
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
  inputGroup: {
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

  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  kelasCount: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
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

  selectInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectInputEmpty: {
    borderColor: "#d1d5db",
  },

  selectContent: {
    flex: 1,
  },

  selectedSubject: {
    flexDirection: "row",
    alignItems: "center",
  },

  subjectIconSmall: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  selectText: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
    flex: 1,
  },

  placeholderText: {
    fontSize: 15,
    color: "#9ca3af",
    fontWeight: "500",
  },

  textArea: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1e293b",
    minHeight: 120,
    textAlignVertical: "top",
    fontWeight: "500",
  },

  charCount: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 4,
    fontWeight: "500",
  },

  dateInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  dateIcon: {
    marginRight: 12,
  },

  dateContent: {
    flex: 1,
  },

  dateText: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "600",
    marginBottom: 2,
  },

  dateSubtext: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },

  /* LOADING STYLES */
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },

  loadingText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginLeft: 12,
  },

  /* KELAS GRID STYLES */
  kelasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },

  kelasCard: {
    width: "47%",
    marginHorizontal: "1.5%",
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  kelasCardSelected: {
    backgroundColor: "#dbeafe",
    borderColor: "#2563eb",
  },

  kelasCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  kelasIcon: {
    marginRight: 8,
  },

  kelasText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },

  kelasTextSelected: {
    color: "#1e40af",
    fontWeight: "700",
  },

  checkIcon: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },

  /* BUTTON STYLES */
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 16,
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

  footerNote: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },

  /* SPACER */
  spacer: {
    height: 100,
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  modalTitleIcon: {
    marginRight: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: 0.3,
  },

  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },

  modalSubtitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },

  modalScroll: {
    padding: 20,
  },

  subjectItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  subjectItemSelected: {
    borderBottomColor: "#e5e7eb",
  },

  subjectInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  subjectDetails: {
    flex: 1,
  },

  subjectName: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: 0.2,
  },

  subjectNameSelected: {
    color: "#1e40af",
  },

  subjectCode: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },

  subjectCheck: {
    marginLeft: 8,
  },

  /* DATE MODAL STYLES */
  dateModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  dateModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: Platform.OS === 'ios' ? 340 : 320,
    overflow: "hidden",
  },

  dateModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  dateModalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  dateModalTitleIcon: {
    marginRight: 10,
  },

  dateModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.3,
  },

  dateModalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
  },

  dateModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },

  datePicker: {
    height: Platform.OS === 'ios' ? 200 : undefined,
  },

  dateConfirmButton: {
    padding: 16,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },

  dateConfirmText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});

export default TaskPengajar;