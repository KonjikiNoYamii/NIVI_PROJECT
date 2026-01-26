import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { API } from '../services/api';
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation<any>();

  const handleSendOtp = async () => {
    if (!email.trim()) {
      return Alert.alert('Error', 'Email wajib diisi');
    }

    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      Alert.alert('Berhasil', 'OTP dikirim ke email', [
        { text: 'Lanjutkan', onPress: () => navigation.navigate('ResetPassword', { email }) },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Gagal kirim OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lupa Password</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
        <Text style={styles.buttonText}>Kirim OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;


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

