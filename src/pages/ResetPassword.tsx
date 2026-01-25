import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { API } from '../services/api';
import { useRoute, useNavigation } from '@react-navigation/native';

const ResetPasswordScreen = () => {
  const { email } = useRoute<any>().params;
  const navigation = useNavigation<any>();

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleReset = async () => {
    if (!otp || !newPassword) {
      return Alert.alert('Error', 'OTP dan password wajib diisi');
    }

    try {
      await axios.post(`${API}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });

      Alert.alert('Berhasil', 'Password berhasil direset', [
        { text: 'Login', onPress: () => navigation.replace('Login') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Reset gagal');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        placeholder="OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        style={styles.input}
      />
      <TextInput
        placeholder="Password Baru"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
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

export default ResetPasswordScreen;
