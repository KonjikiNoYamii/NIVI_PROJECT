import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { absensiService, Absensi } from '../../services/absensi';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_ABSEN = 4;

const DashboardSantri = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [absensi, setAbsensi] = useState<Absensi[]>([]);

  const loadAbsensi = async () => {
    try {
      setLoading(true);
      const data = await absensiService.getToday();
      setAbsensi(data);
    } catch {
      Alert.alert('Error', 'Gagal mengambil absensi');
    } finally {
      setLoading(false);
    }
  };

  const sisaAbsen = MAX_ABSEN - absensi.length;

  const handleAbsen = async () => {
    try {
      setSubmitting(true);
      await absensiService.absen('hadir');
      loadAbsensi();
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message || 'Tidak bisa absen');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadAbsensi();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Absensi Hari Ini</Text>

      {sisaAbsen > 0 && (
        <TouchableOpacity
          style={styles.button}
          onPress={handleAbsen}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting
              ? 'Menyimpan...'
              : `ABSEN HADIR (${sisaAbsen}x tersisa)`}
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={absensi}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.status}>{item.status.toUpperCase()}</Text>
            <Text>{new Date(item.tanggal).toLocaleString('id-ID')}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada absensi</Text>}
      />
    </SafeAreaView>
  );
};

export default DashboardSantri;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  button: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  card: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  status: { fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 40 },
});
