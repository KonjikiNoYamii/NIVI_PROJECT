import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loading from '../components/loading';
import { API } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ActivateAccountScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { email } = route.params;

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

const handleActivate = async () => {
  if (!otp.trim() || !password.trim()) {
    Alert.alert('Error', 'OTP dan password wajib diisi');
    return;
  }

  try {
    setLoading(true);
    // aktivasi tanpa Authorization
    await axios.post(`${API}/auth/activate-with-otp`, { email, otp, password });

    // setelah sukses, langsung login otomatis
    const { data } = await axios.post(`${API}/auth/login`, { email, password });
    const { token, user } = data.data;

    await AsyncStorage.multiSet([
      ['token', token],
      ['role', user.role],
      ['userId', String(user.id)],
      ['kelasId', user.kelasId?.toString() || ''],
      ['userName', user.name || ''],
      ['userEmail', user.email || ''],
    ]);

    Alert.alert('Berhasil', 'Akun berhasil diaktivasi dan login', [
      { text: 'Lanjut', onPress: () => navigation.replace('AuthGate') },
    ]);
  } catch (err: any) {
    Alert.alert('Error', err.response?.data?.message || 'Gagal aktivasi');
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
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Text style={styles.title}>Aktivasi Akun</Text>
            <Text style={styles.subtitle}>
              Masukkan OTP yang dikirim ke email Anda dan buat password pertama
            </Text>

            <TextInput
              placeholder="OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              style={styles.input}
            />

            <TextInput
              placeholder="Password Baru"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={handleActivate}>
              <Text style={styles.buttonText}>Aktivasi Akun</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Loading visible={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  form: { backgroundColor: '#f8f9fa', padding: 24, borderRadius: 20 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ActivateAccountScreen;
