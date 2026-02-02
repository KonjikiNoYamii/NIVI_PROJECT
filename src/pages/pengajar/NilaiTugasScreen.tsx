import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API } from '../../services/api';
import { Icon } from 'react-native-elements';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

interface RouteParams {
  submissionId: number;
  santriName: string;
  tugasTitle: string;
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

const NilaiScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { submissionId, santriName, tugasTitle } = route.params as RouteParams;

  const [nilai, setNilai] = useState('');
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    nilai: false,
  });

  const validateInputs = () => {
    const errors = {
      nilai: nilai.trim() === '',
    };
    setInputErrors(errors);
    return !errors.nilai;
  };

  const submitNilai = async () => {
    if (!validateInputs()) {
      showAlert.validation('Harap isi semua field yang wajib diisi.');
      return;
    }

    const nilaiNumber = Number(nilai);
    if (isNaN(nilaiNumber)) {
      showAlert.validation('Nilai harus berupa angka.');
      return;
    }

    if (nilaiNumber < 0 || nilaiNumber > 100) {
      showAlert.validation('Nilai harus antara 0 - 100.');
      return;
    }

    showAlert.confirm(
      '📝 Konfirmasi Penilaian',
      `Anda akan memberikan nilai ${nilaiNumber} untuk tugas "${tugasTitle}" dari ${santriName}.`,
      async () => {
        setLoading(true);

        try {
          const token = await AsyncStorage.getItem('token');

          await axios.post(
            `${API}/nilai`,
            {
              submissionId,
              nilai: nilaiNumber,
              catatan: catatan.trim() || undefined,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          showAlert.success(
            '✅ Berhasil Dikirim',
            `Nilai ${nilaiNumber} berhasil diberikan kepada ${santriName}.`,
            () => navigation.goBack()
          );
        } catch (err: any) {
          console.log(err.response || err.message);
          const errorMessage = err.response?.data?.message ?? 'Gagal mengirim nilai. Silakan coba lagi.';
          
          if (err.response?.status === 409) {
            showAlert.error(
              '⚠️ Sudah Dinilai',
              'Tugas ini sudah dinilai sebelumnya.'
            );
          } else if (err.response?.status === 400) {
            showAlert.error(
              '⚠️ Data Tidak Valid',
              errorMessage
            );
          } else {
            showAlert.error(
              '⚠️ Gagal Mengirim',
              errorMessage
            );
          }
        } finally {
          setLoading(false);
        }
      },
      {
        confirmText: 'Kirim Nilai',
        cancelText: 'Periksa Kembali',
        type: 'info'
      }
    );
  };

  const handleBackPress = () => {
    showAlert.confirm(
      '❌ Batalkan Penilaian',
      'Apakah Anda yakin ingin membatalkan penilaian? Data yang sudah dimasukkan akan hilang.',
      () => navigation.goBack(),
      {
        confirmText: 'Ya, Batalkan',
        cancelText: 'Lanjutkan Menilai',
        type: 'warning'
      }
    );
  };

  const showHintAlert = () => {
    showAlert.info(
      '💡 Panduan Nilai',
      '• Skala: 0 - 100\n• 90-100: Sangat Baik\n• 80-89: Baik\n• 70-79: Cukup\n• 60-69: Perlu Perbaikan\n• 0-59: Tidak Memenuhi'
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* Render Alert Provider */}
      <AlertProvider />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.85}
          >
            <View style={styles.backButtonContent}>
              <Icon name="arrow-left" type="font-awesome" size={18} color="#fff" />
              <Text style={styles.backText}>Kembali</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Input Nilai</Text>
            <Text style={styles.headerSubtitle}>
              Tugas: {tugasTitle}
            </Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* INFO CARD */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <View style={styles.infoIconContainer}>
                <Icon name="user" type="font-awesome" size={18} color="#2563eb" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoCardTitle}>Detail Santri</Text>
                <Text style={styles.infoCardSubtitle}>Data penerima nilai</Text>
              </View>
            </View>
            
            <View style={styles.infoDetails}>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Icon name="user" type="font-awesome" size={12} color="#64748b" />
                  <Text style={styles.infoLabel}>Nama Santri</Text>
                </View>
                <Text style={styles.infoValue}>{santriName}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Icon name="book" type="font-awesome" size={12} color="#64748b" />
                  <Text style={styles.infoLabel}>Judul Tugas</Text>
                </View>
                <Text style={styles.infoValue}>{tugasTitle}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Icon name="hashtag" type="font-awesome" size={12} color="#64748b" />
                  <Text style={styles.infoLabel}>ID Pengumpulan</Text>
                </View>
                <Text style={styles.infoValue}>#{submissionId}</Text>
              </View>
            </View>
          </View>

          {/* FORM CARD */}
          <View style={styles.card}>
            <View style={styles.formHeader}>
              <View style={styles.formIconContainer}>
                <Icon name="edit" type="font-awesome" size={20} color="#2563eb" />
              </View>
              <View style={styles.formHeaderContent}>
                <Text style={styles.formTitle}>Form Penilaian</Text>
                <Text style={styles.formSubtitle}>
                  Berikan nilai dan feedback untuk santri
                </Text>
              </View>
            </View>

            {/* INPUT NILAI */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>
                  Nilai Akhir <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={styles.hintButton}
                  onPress={showHintAlert}
                  activeOpacity={0.85}
                >
                  <Icon name="question-circle" type="font-awesome" size={12} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.labelHint}>Masukkan nilai antara 0 - 100</Text>
              
              <View style={[
                styles.inputContainer,
                inputErrors.nilai && styles.inputError
              ]}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={nilai}
                  onChangeText={(text) => {
                    // Hanya angka 0-100
                    const numericText = text.replace(/[^0-9]/g, '');
                    if (numericText === '' || (parseInt(numericText, 10) >= 0 && parseInt(numericText, 10) <= 100)) {
                      setNilai(numericText);
                      if (numericText.trim() !== '') {
                        setInputErrors(prev => ({...prev, nilai: false}));
                      }
                    }
                  }}
                  placeholder="Contoh: 85"
                  placeholderTextColor="#94a3b8"
                  maxLength={3}
                />
                <View style={styles.inputSuffix}>
                  <Text style={styles.suffixText}>/ 100</Text>
                </View>
              </View>
              
              {inputErrors.nilai ? (
                <View style={styles.errorContainer}>
                  <Icon name="exclamation-circle" type="font-awesome" size={12} color="#ef4444" />
                  <Text style={styles.errorText}>Nilai wajib diisi</Text>
                </View>
              ) : nilai.trim() !== '' && (
                <View style={styles.scoreIndicator}>
                  <Text style={styles.scoreText}>Nilai: {nilai}/100</Text>
                  <View style={styles.scoreBarContainer}>
                    <View 
                      style={[
                        styles.scoreBar, 
                        { 
                          width: `${Math.min(100, (parseInt(nilai, 10) || 0))}%`,
                          backgroundColor: (parseInt(nilai, 10) || 0) >= 70 ? '#10b981' : 
                                         (parseInt(nilai, 10) || 0) >= 50 ? '#f59e0b' : 
                                         '#ef4444'
                        }
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>

            {/* INPUT CATATAN */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>
                  Catatan & Feedback
                </Text>
                <Text style={styles.optional}> (Opsional)</Text>
              </View>
              
              <Text style={styles.labelHint}>
                Berikan feedback, saran, atau pujian untuk santri
              </Text>
              
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={[styles.textArea, { height: 120 }]}
                  multiline
                  value={catatan}
                  onChangeText={(text) => {
                    if (text.length <= 500) {
                      setCatatan(text);
                    }
                  }}
                  placeholder="Contoh: Kerja bagus! Perhatikan konsistensi penulisan untuk tugas berikutnya..."
                  placeholderTextColor="#94a3b8"
                  textAlignVertical="top"
                  numberOfLines={4}
                />
                <View style={styles.charCountContainer}>
                  <Icon name="table" type="font-awesome" size={10} color="#9ca3af" />
                  <Text style={styles.charCount}>
                    {catatan.length}/500 karakter
                  </Text>
                </View>
              </View>
            </View>

            {/* INFO BOX */}
            <View style={styles.noteBox}>
              <Icon name="info-circle" type="font-awesome" size={16} color="#2563eb" style={styles.noteIcon} />
              <Text style={styles.noteText}>
                Nilai akan langsung tersimpan dan dapat dilihat oleh santri. Pastikan data sudah benar sebelum mengirim.
              </Text>
            </View>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={handleBackPress}
              activeOpacity={0.85}
            >
              <Icon name="times" type="font-awesome" size={14} color="#64748b" />
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.submitButton,
                (!nilai.trim() || loading) && styles.buttonDisabled
              ]} 
              onPress={submitNilai} 
              disabled={!nilai.trim() || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <View style={styles.buttonLoading}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.buttonLoadingText}>Mengirim...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Icon name="check" type="font-awesome" size={14} color="#fff" />
                  <Text style={styles.submitButtonText}>Kirim Nilai</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NilaiScreen;

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  
  container: {
    flex: 1,
  },

  /* HEADER */
  header: {
    backgroundColor: "#1e3a8a",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === "android" ? 12 : 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  headerContent: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: 0.3,
  },

  headerSubtitle: {
    color: "#c7d2fe",
    fontSize: 12,
    fontWeight: "500",
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  headerSpacer: {
    width: 80,
  },

  /* CONTENT */
  content: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  /* INFO CARD */
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#bfdbfe',
  },

  infoTextContainer: {
    flex: 1,
  },

  infoCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 4,
    letterSpacing: 0.2,
  },

  infoCardSubtitle: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },

  infoDetails: {
    gap: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    marginLeft: 8,
    letterSpacing: 0.2,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    letterSpacing: 0.2,
  },

  /* FORM CARD */
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  formIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#bfdbfe',
  },

  formHeaderContent: {
    flex: 1,
  },

  formTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 4,
    letterSpacing: 0.3,
  },

  formSubtitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },

  /* INPUT GROUPS */
  inputGroup: {
    marginBottom: 24,
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    letterSpacing: 0.2,
  },

  required: {
    color: "#ef4444",
    fontWeight: "800",
  },

  optional: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "400",
    marginLeft: 4,
  },

  hintButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  labelHint: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    overflow: 'hidden',
  },

  inputError: {
    borderColor: "#ef4444",
    backgroundColor: '#fef2f2',
  },

  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: "#1e293b",
    letterSpacing: 0.5,
  },

  inputSuffix: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f1f5f9',
    borderLeftWidth: 1.5,
    borderLeftColor: '#e2e8f0',
  },

  suffixText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.2,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginLeft: 6,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  scoreIndicator: {
    marginTop: 12,
  },

  scoreText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },

  scoreBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },

  scoreBar: {
    height: '100%',
    borderRadius: 3,
  },

  textAreaContainer: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    overflow: 'hidden',
  },

  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#1e293b",
    fontWeight: '500',
    textAlignVertical: 'top',
  },

  charCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },

  charCount: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: '500',
    marginLeft: 6,
    letterSpacing: 0.2,
  },

  /* NOTE BOX */
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#dbeafe',
    marginTop: 8,
  },

  noteIcon: {
    marginTop: 2,
  },

  noteText: {
    flex: 1,
    fontSize: 12,
    color: "#0369a1",
    marginLeft: 12,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  /* ACTION BUTTONS */
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },

  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.3,
    marginLeft: 8,
  },

  submitButton: {
    backgroundColor: "#2563eb",
  },

  buttonDisabled: {
    backgroundColor: "#93c5fd",
    opacity: 0.8,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  buttonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  buttonLoadingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 10,
    letterSpacing: 0.3,
  },

  submitButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    marginLeft: 8,
    letterSpacing: 0.3,
  },
});