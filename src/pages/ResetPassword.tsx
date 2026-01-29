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
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import axios from 'axios';
import { API } from '../services/api';
import Loading from '../components/loading';

const ResetPasswordScreen = () => {
  const { email } = useRoute<any>().params;
  const navigation = useNavigation<any>();

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      return Alert.alert('Error', 'Semua field wajib diisi');
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'Password dan konfirmasi password tidak cocok');
    }

    if (newPassword.length < 6) {
      return Alert.alert('Error', 'Password minimal 6 karakter');
    }

    try {
      setLoading(true);
      await axios.post(`${API}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });

      Alert.alert(
        'Berhasil',
        'Password berhasil direset. Silakan login dengan password baru Anda.',
        [
          { 
            text: 'Login', 
            onPress: () => navigation.replace('Login') 
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Reset password gagal. Periksa OTP dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />
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
              Masukkan OTP yang dikirim ke email Anda dan buat password baru
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Reset Password</Text>
            
            {/* Email Info */}
            <View style={styles.emailInfoContainer}>
              <Icon name="envelope" type="font-awesome" size={14} color="#2563eb" />
              <Text style={styles.emailInfoText} numberOfLines={1}>
                {email}
              </Text>
            </View>

            {/* OTP Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="shield" type="font-awesome" size={14} color="#6b7280" />
                <Text style={styles.label}>Kode OTP</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Masukkan 6 digit OTP"
                  placeholderTextColor="#9ca3af"
                  value={otp}
                  onChangeText={setOtp}
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.resendButton}
                  activeOpacity={0.85}
                >
                  <Text style={styles.resendButtonText}>Kirim Ulang</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="lock" type="font-awesome" size={14} color="#6b7280" />
                <Text style={styles.label}>Password Baru</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Minimal 6 karakter"
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
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="lock" type="font-awesome" size={14} color="#6b7280" />
                <Text style={styles.label}>Konfirmasi Password</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Ulangi password baru"
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
            </View>

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
              <Text style={styles.resetButtonText}>RESET PASSWORD</Text>
              <Icon name="check-circle" type="font-awesome" size={18} color="#fff" style={styles.buttonIcon} />
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Login')}
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
    backgroundColor: '#f1f5f9' 
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
    borderColor: '#f1f5f9',
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
  },
  subtitle: { 
    fontSize: 15, 
    color: '#64748b', 
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  
  // Form Card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Email Info
  emailInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  emailInfoText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  
  // Input Groups
  inputGroup: { 
    marginBottom: 20 
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
  },
  input: { 
    flex: 1, 
    paddingVertical: 16, 
    fontSize: 16, 
    color: '#111827',
    paddingRight: 10,
  },
  passwordToggle: { 
    padding: 8 
  },
  
  // Resend OTP Button
  resendButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  resendButtonText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  
  // Reset Button
  resetButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonDisabled: { 
    backgroundColor: '#a7f3d0' 
  },
  resetButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 10,
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
    color: '#6b7280', 
    fontWeight: '600',
    marginLeft: 10,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
});

export default ResetPasswordScreen;