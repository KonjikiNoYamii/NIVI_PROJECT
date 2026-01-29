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

    const kelasIds = user.kelasId ? [user.kelasId] : [];


    await AsyncStorage.multiSet([
  ['token', token],
  ['role', user.role],
  ['userId', String(user.id)],
  ['kelasId', kelasIds[0]?.toString() || ''],
  ['kelasIds', JSON.stringify(kelasIds)],
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
            <Image
              source={require('../assets/logo.png')}
              style={{ width: 120, height: 120, borderRadius: 60 }}
            />
            <Text style={styles.welcomeText}>Selamat Datang!!</Text>
            <Text style={styles.subtitle}>
              Masuk ke akun Anda untuk melanjutkan
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="envelope"
                  type="font-awesome"
                  size={18}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Masukkan email"
                  placeholderTextColor="#bdc3c7"
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
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="lock"
                  type="font-awesome"
                  size={20}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Masukkan password"
                  placeholderTextColor="#bdc3c7"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Icon
                    name={showPassword ? 'eye-slash' : 'eye'}
                    type="font-awesome"
                    size={18}
                    color="#fcffff"
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
            >
              <Text style={styles.loginButtonText}>Masuk</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.requestButton}
              onPress={handleRequestActivation}
              disabled={loading}
            >
              <Text style={styles.requestButtonText}>
                Belum Aktivasi? Request OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
  style={styles.requestButton}
  onPress={() => navigation.navigate('ForgotPassword')}
>
  <Text style={styles.requestButtonText}>
    Lupa Password?
  </Text>
</TouchableOpacity>

          </View>

          
        </ScrollView>
      </KeyboardAvoidingView>
      <Loading visible={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffffe8' },
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: { fontSize: 16, color: '#7f8c8d', textAlign: 'center' },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: '#2c3e50' },
  passwordToggle: { padding: 8 },
  loginButton: {
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: { backgroundColor: '#b0d4f0' },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  requestButton: { marginTop: 16, paddingVertical: 14, alignItems: 'center' },
  requestButtonText: { fontSize: 15, color: '#3498db', fontWeight: '600' },
});

export default LoginScreen;
