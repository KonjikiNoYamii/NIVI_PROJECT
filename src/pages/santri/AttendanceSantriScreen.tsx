import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { absensiService, Absensi } from '../../services/absensi';
import { useFocusEffect } from '@react-navigation/native';

const MAX_ABSEN = 4;

const STATUS: ('hadir' | 'izin' | 'sakit')[] = ['hadir', 'izin', 'sakit'];

const AttendanceSantriScreen = () => {
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<
    'hadir' | 'izin' | 'sakit' | null
  >(null);
  const [loading, setLoading] = useState(true);

  const loadAbsensi = async () => {
    try {
      setLoading(true);
      const data = await absensiService.getToday();
      setAbsensi(data);
    } finally {
      setLoading(false);
    }
  };

 useFocusEffect(
  useCallback(() => {
    loadAbsensi();
  }, [])
);

  const sisaAbsen = MAX_ABSEN - absensi.length;

  const submit = async () => {
    if (!selectedStatus) return;

    try {
      await absensiService.absen(selectedStatus);
      setSelectedStatus(null);
      loadAbsensi();
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message || 'Error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Absensi Hari Ini</Text>

      <Text style={styles.info}>Sisa absen: {sisaAbsen}x</Text>

      {STATUS.map(status => (
        <TouchableOpacity
          key={status}
          style={[
            styles.option,
            selectedStatus === status && styles.optionActive,
          ]}
          onPress={() => setSelectedStatus(status)}
        >
          <Text style={styles.optionText}>{status.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[
          styles.submit,
          (!selectedStatus || sisaAbsen <= 0) && styles.disabled,
        ]}
        disabled={!selectedStatus || sisaAbsen <= 0}
        onPress={submit}
      >
        <Text style={styles.submitText}>SIMPAN ABSENSI</Text>
      </TouchableOpacity>

      <FlatList
        data={absensi}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.status}>{item.status.toUpperCase()}</Text>
            <Text>{new Date(item.tanggal).toLocaleString('id-ID')}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default AttendanceSantriScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  info: { marginBottom: 12 },
  option: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionActive: {
    backgroundColor: '#dff9fb',
    borderColor: '#0984e3',
  },
  optionText: { fontWeight: '600' },
  submit: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 10,
    marginVertical: 16,
  },
  disabled: {
    backgroundColor: '#b2bec3',
  },
  submitText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  card: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  status: { fontWeight: '700' },
});