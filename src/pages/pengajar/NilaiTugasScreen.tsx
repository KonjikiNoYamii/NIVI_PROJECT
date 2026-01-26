import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API } from '../../services/api';

interface RouteParams {
  submissionId: number;
}

const NilaiScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { submissionId } = route.params as RouteParams;

  const [nilai, setNilai] = useState('');
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);

  const submitNilai = async () => {
    if (!nilai) return Alert.alert('Error', 'Nilai wajib diisi');

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');

      await axios.post(
        `${API}/nilai`,
        {
          submissionId,
          nilai: Number(nilai),
          catatan: catatan || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Sukses', 'Nilai berhasil dikirim', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Gagal mengirim nilai');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Input Nilai</Text>

      <Text style={styles.label}>Nilai</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={nilai}
        onChangeText={setNilai}
        placeholder="Masukkan nilai"
      />

      <Text style={styles.label}>Catatan (Opsional)</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={catatan}
        onChangeText={setCatatan}
        placeholder="Masukkan catatan..."
      />

      <TouchableOpacity style={styles.btn} onPress={submitNilai} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Kirim Nilai</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default NilaiScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, color: '#2c3e50' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#34495e' },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: '#3498db',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
