import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import axios from 'axios';
import { API } from '../services/api';
import Loading from '../components/loading';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

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
    },

    otpExpired: (title: string, message: string, onResend?: () => void) => {
      getAlertHook().showAlert(
        title,
        message,
        'warning',
        {
          confirmText: 'Minta OTP Baru',
          cancelText: 'Batal',
          onConfirm: onResend,
        }
      );
    },

    emailInfo: (message: string) => {
      getAlertHook().showAlert(
        'Ubah Email',
        message,
        'info'
      );
    }
  };

  return {
    AlertProvider,
    showAlert: showAlertHelper,
  };
};

const { AlertProvider, showAlert } = createAlertHelper();

const ResetPasswordScreen = () => {
  const { email } = useRoute<any>().params;
  const navigation = useNavigation<any>();

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!otp.trim()) {
      showAlert.validation('Kode OTP wajib diisi.');
      return false;
    }

    if (!newPassword.trim()) {
      showAlert.validation('Password baru wajib diisi.');
      return false;
    }

    if (!confirmPassword.trim()) {
      showAlert.validation('Konfirmasi password wajib diisi.');
      return false;
    }

    if (newPassword.length < 6) {
      showAlert.validation('Password minimal 6 karakter.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      showAlert.validation('Password dan konfirmasi password tidak cocok.');
      return false;
    }

    return true;
  };

  const handleResendOTP = () => {
    showAlert.confirm(
      'Kirim Ulang OTP',
      `Kirim ulang kode OTP ke email:\n${email}`,
      async () => {
        try {
          setLoading(true);
          await axios.post(`${API}/auth/request-reset-password`, {
            email,
          });
          
          showAlert.success(
            'OTP Dikirim',
            'Kode OTP baru telah dikirim ke email Anda. Periksa inbox atau spam folder.'
          );
        } catch (err: any) {
          console.log(err.response || err.message);
          const errorMessage = err.response?.data?.message ?? 'Gagal mengirim OTP. Silakan coba lagi.';
          
          if (err.response?.status === 404) {
            showAlert.error(
              'Email Tidak Ditemukan',
              'Email yang dimasukkan belum terdaftar di sistem.'
            );
          } else if (err.response?.status === 429) {
            showAlert.error(
              'Terlalu Banyak Permintaan',
              'Anda sudah meminta OTP. Tunggu beberapa saat sebelum mencoba lagi.'
            );
          } else {
            showAlert.error(
              'Gagal Mengirim',
              errorMessage
            );
          }
        } finally {
          setLoading(false);
        }
      },
      {
        confirmText: 'Kirim Ulang',
        cancelText: 'Batal',
        type: 'info'
      }
    );
  };

  const handleReset = async () => {
    if (!validateForm()) return;

    showAlert.confirm(
      '🔐 Reset Password',
      'Anda akan mengatur ulang password akun Anda. Pastikan data sudah benar.',
      async () => {
        try {
          setLoading(true);
          await axios.post(`${API}/auth/reset-password`, {
            email,
            otp,
            newPassword,
          });

          showAlert.success(
            '✅ Berhasil Direset',
            'Password Anda berhasil direset. Silakan login dengan password baru.',
            () => navigation.replace('Login')
          );
        } catch (err: any) {
          console.log(err.response || err.message);
          const errorMessage = err.response?.data?.message ?? 'Reset password gagal. Silakan coba lagi.';
          
          if (err.response?.status === 400) {
            showAlert.error(
              '⚠️ OTP Tidak Valid',
              'Kode OTP yang dimasukkan salah atau sudah kadaluarsa.'
            );
          } else if (err.response?.status === 404) {
            showAlert.error(
              '👤 Akun Tidak Ditemukan',
              'Email tidak terdaftar atau permintaan reset password tidak ditemukan.'
            );
          } else if (err.response?.status === 410) {
            showAlert.otpExpired(
              '⌛ OTP Kadaluarsa',
              'Kode OTP sudah kadaluarsa. Silakan minta kode baru.',
              handleResendOTP
            );
          } else {
            showAlert.error(
              '⚠️ Gagal Reset',
              errorMessage
            );
          }
        } finally {
          setLoading(false);
        }
      },
      {
        confirmText: 'Reset Sekarang',
        cancelText: 'Periksa Kembali',
        type: 'warning'
      }
    );
  };

  const handleBackToLogin = () => {
    showAlert.confirm(
      'Kembali ke Login',
      'Anda akan kembali ke halaman login. Data yang sudah dimasukkan akan hilang.',
      () => navigation.navigate('Login'),
      {
        confirmText: 'Ya, Kembali',
        cancelText: 'Tetap di Halaman Ini',
        type: 'info'
      }
    );
  };

  const handleEmailInfo = () => {
    showAlert.emailInfo(
      'Email tidak bisa diubah di halaman ini. Kembali ke halaman sebelumnya untuk memasukkan email lain.'
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Render Alert Provider */}
      <AlertProvider />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            {/* Logo Container */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
              />
              <View style={styles.logoBadge}>
                <Icon name="key" type="font-awesome" size={20} color="#2563eb" />
              </View>
            </View>
            
            <Text style={styles.welcomeText}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Masukkan kode OTP dan buat password baru untuk akun Anda
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Form Reset Password</Text>
            
            {/* Email Info */}
            <View style={styles.emailInfoContainer}>
              <Icon name="envelope" type="font-awesome" size={14} color="#2563eb" />
              <Text style={styles.emailInfoText} numberOfLines={1}>
                {email}
              </Text>
              <TouchableOpacity
                onPress={handleEmailInfo}
                style={styles.emailEditButton}
                activeOpacity={0.85}
              >
                <Icon name="info-circle" type="font-awesome" size={12} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* OTP Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="shield" type="font-awesome" size={14} color="#6b7280" />
                <Text style={styles.label}>
                  Kode OTP <Text style={styles.required}>*</Text>
                </Text>
              </View>
              <View style={styles.otpInputContainer}>
                <TextInput
                  placeholder="Masukkan 6 digit kode OTP"
                  placeholderTextColor="#9ca3af"
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={handleResendOTP}
                  style={styles.resendButton}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                  ) : (
                    <>
                      <Icon name="send" type="font-awesome" size={12} color="#2563eb" />
                      <Text style={styles.resendButtonText}>Kirim Ulang</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.hintText}>
                Kode OTP akan kadaluarsa dalam 10 menit
              </Text>
            </View>

            {/* New Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="lock" type="font-awesome" size={14} color="#6b7280" />
                <Text style={styles.label}>
                  Password Baru <Text style={styles.required}>*</Text>
                </Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Minimal 6 karakter, kombinasi huruf dan angka"
                  placeholderTextColor="#9ca3af"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.input}
                  secureTextEntry={!showNewPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.passwordToggle}
                  activeOpacity={0.85}
                >
                  <Icon
                    name={showNewPassword ? 'eye-slash' : 'eye'}
                    type="font-awesome"
                    size={18}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.hintText}>
                Gunakan kombinasi huruf, angka, dan karakter khusus untuk keamanan
              </Text>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="lock" type="font-awesome" size={14} color="#6b7280" />
                <Text style={styles.label}>
                  Konfirmasi Password <Text style={styles.required}>*</Text>
                </Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Ulangi password baru Anda"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.input}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                  activeOpacity={0.85}
                >
                  <Icon
                    name={showConfirmPassword ? 'eye-slash' : 'eye'}
                    type="font-awesome"
                    size={18}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword && newPassword !== confirmPassword && (
                <Text style={styles.errorText}>
                  ❌ Password tidak cocok
                </Text>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <Text style={styles.successText}>
                  Password cocok
                </Text>
              )}
            </View>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <Text style={styles.passwordStrengthLabel}>
                  Kekuatan Password: {
                    newPassword.length < 6 ? 'Lemah' :
                    newPassword.length < 8 ? 'Sedang' : 'Kuat'
                  }
                </Text>
                <View style={styles.strengthBarContainer}>
                  <View style={[
                    styles.strengthBar,
                    { 
                      width: `${Math.min(100, (newPassword.length / 12) * 100)}%`,
                      backgroundColor: newPassword.length < 6 ? '#ef4444' :
                                      newPassword.length < 8 ? '#f59e0b' : '#10b981'
                    }
                  ]} />
                </View>
              </View>
            )}

            {/* Reset Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                loading && styles.resetButtonDisabled,
              ]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <View style={styles.buttonLoading}>
                  <Icon name="spinner" type="font-awesome" size={16} color="#fff" />
                  <Text style={styles.buttonLoadingText}>Memproses...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.resetButtonText}>RESET PASSWORD</Text>
                  <Icon name="check-circle" type="font-awesome" size={18} color="#fff" style={styles.buttonIcon} />
                </View>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Icon name="arrow-left" type="font-awesome" size={16} color="#6b7280" />
              <Text style={styles.backButtonText}>
                Kembali ke Login
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2026 Sistem Absensi Pesantren
            </Text>
            <Text style={styles.versionText}>
              Versi 1.0.0
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Loading visible={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  container: { 
    flex: 1 
  },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center',
    padding: 20,
  },
  
  // Header
  header: { 
    alignItems: 'center', 
    marginBottom: 32,
    marginTop: 20,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logo: { 
    width: 120, 
    height: 120, 
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#f8fafc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: { 
    fontSize: 15, 
    color: '#64748b', 
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  
  // Form Card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  
  // Email Info
  emailInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#dbeafe',
  },
  emailInfoText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
    letterSpacing: 0.2,
  },
  emailEditButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  
  // Input Groups
  inputGroup: { 
    marginBottom: 24 
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  required: {
    color: '#ef4444',
    fontWeight: '800',
  },
  
  // OTP Input
  otpInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  otpInput: { 
    flex: 1, 
    paddingVertical: 16, 
    fontSize: 18, 
    color: '#1e293b',
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
    borderWidth: 1.5,
    borderColor: '#dbeafe',
  },
  resendButtonText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.2,
  },
  
  // Password Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
  },
  input: { 
    flex: 1, 
    paddingVertical: 16, 
    fontSize: 16, 
    color: '#1e293b',
    paddingRight: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  passwordToggle: { 
    padding: 8 
  },
  
  // Hints and Errors
  hintText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 6,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  successText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 6,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  
  // Password Strength
  passwordStrengthContainer: {
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  passwordStrengthLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  strengthBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3,
  },
  
  // Reset Button
  resetButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButtonDisabled: { 
    backgroundColor: '#a7f3d0',
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
  resetButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  buttonLoadingText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600',
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  
  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginTop: 16,
  },
  backButtonText: { 
    fontSize: 15, 
    color: '#64748b', 
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default ResetPasswordScreen;