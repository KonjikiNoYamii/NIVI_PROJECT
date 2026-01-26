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
      <View style={styles.header}>
        <Text style={styles.title}>Lupa Password</Text>
        <Text style={styles.subtitle}>
          Masukkan email Anda yang terdaftar untuk mendapatkan OTP
        </Text>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Alamat Email</Text>
          <TextInput
            placeholder="contoh@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSendOtp}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Kirim OTP</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Kembali ke Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Butuh bantuan?{' '}
          <Text 
            style={styles.footerLink}
            onPress={() => Alert.alert('Bantuan', 'Hubungi tim support kami')}
          >
            Hubungi Support
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: { 
    fontSize: 14, 
    color: '#7f8c8d', 
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3498db',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#95a5a6',
    textAlign: 'center',
  },
  footerLink: {
    color: '#3498db',
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;