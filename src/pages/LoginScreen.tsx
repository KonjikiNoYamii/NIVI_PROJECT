import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API } from '../services/api';
import Loading from '../components/loading';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<any>();

  const MIN_LOADING_TIME = 2000;
  const sleep = (ms: number) => new Promise(resolve => setTimeout<any>(resolve, ms));

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email tidak boleh kosong');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Password tidak boleh kosong');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Format email tidak valid');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/auth/login`, { email, password });

      const { status, user, token } = data.data;
      if (status === 'NEED_ACTIVATION') {
        // langsung navigasi ke aktivasi dengan email
        console.log(data);
        
        return navigation.navigate('ActivateAccount', { email });
      }

      await AsyncStorage.multiSet([
        ['token', token],
        ['role', user.role],
        ['userId', String(user.id)],
        ['kelasId', user.kelasId?.toString() || ''],
        ['userName', user.name || ''],
        ['userEmail', user.email || ''],
      ]);

      navigation.replace('AuthGate');
    } catch (err: any) {
      Alert.alert('Login Gagal', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Request OTP tanpa Authorization
  const handleRequestActivation = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Masukkan email untuk request OTP');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API}/auth/request-activation-otp`, { email}); // header bebas
      Alert.alert('Berhasil', 'OTP berhasil dikirim ke email Anda', [
        { text: 'Lanjutkan', onPress: () => navigation.navigate('ActivateAccount', { email }) },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Gagal request OTP');
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
            </View>
            
            <Text style={styles.welcomeText}>Selamat Datang!</Text>
            <Text style={styles.subtitle}>
              Masuk ke akun Anda untuk melanjutkan
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Login</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="envelope" type="font-awesome" size={14} color="#6b7280" />
                <Text style={styles.label}>Email</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Masukkan email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="lock" type="font-awesome" size={14} color="#6b7280" />
                <Text style={styles.label}>Password</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Masukkan password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  activeOpacity={0.85}
                >
                  <Icon
                    name={showPassword ? 'eye-slash' : 'eye'}
                    type="font-awesome"
                    size={18}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>MASUK</Text>
              <Icon name="sign-in" type="font-awesome" size={18} color="#fff" style={styles.buttonIcon} />
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ATAU</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.activationButton}
              onPress={handleRequestActivation}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Icon name="key" type="font-awesome" size={16} color="#2563eb" />
              <Text style={styles.activationButtonText}>
                Belum Aktivasi? Request OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.85}
            >
              <Icon name="question-circle" type="font-awesome" size={16} color="#6b7280" />
              <Text style={styles.forgotButtonText}>
                Lupa Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © NIVI PROJECT
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
    marginBottom: 24,
    textAlign: 'center',
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
  
  // Login Button
  loginButton: {
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: { 
    backgroundColor: '#93c5fd' 
  },
  loginButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  
  // Activation Button
  activationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    marginBottom: 12,
  },
  activationButtonText: { 
    fontSize: 15, 
    color: '#2563eb', 
    fontWeight: '600',
    marginLeft: 10,
  },
  
  // Forgot Password Button
  forgotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  forgotButtonText: { 
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

export default LoginScreen;