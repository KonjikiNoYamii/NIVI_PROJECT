import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { API } from '../../services/api';

interface Submission {
  id: number;
  status: 'pending' | 'submitted' | 'reviewed' | 'rejected';
  isGraded: boolean;
  linkUrl?: string | null;
  submittedAt: string;
  user: {
    name: string;
  };
  tugas: {
    id: number;
    title: string;
  };
}

const PengajarSubmissionScreen = () => {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API}/submission/pengajar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Map status dan cek apakah sudah dinilai
      const submissions = res.data.data.map((s: any) => ({
        ...s,
        isGraded: s.nilai !== undefined && s.nilai !== null,
      }));
      setData(submissions);
    } catch (err) {
      console.log('Fetch error:', err);
      Alert.alert('Error', 'Gagal memuat pengumpulan tugas');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: 'reviewed' | 'rejected') => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${API}/submission/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchSubmission();
    } catch (err) {
      console.log('Update error:', err);
      Alert.alert('Error', 'Gagal memperbarui status');
    }
  };

  const openLink = async (url?: string | null) => {
    if (!url) return Alert.alert('Error', 'URL tidak ditemukan');
    try {
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      await Linking.openURL(finalUrl);
    } catch {
      Alert.alert('Error', 'Gagal membuka URL');
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, []);

  const renderItem = ({ item }: { item: Submission }) => {
    let statusColor = '#f39c12';
    if (item.status === 'reviewed') statusColor = '#2ecc71';
    else if (item.status === 'rejected') statusColor = '#e74c3c';
    else if (item.status === 'submitted') statusColor = '#3498db';

    return (
      <View style={styles.card}>
        <Text style={styles.santri}>{item.user.name}</Text>
        <Text style={styles.task}>{item.tugas.title}</Text>
        <Text style={styles.date}>
          {new Date(item.submittedAt).toLocaleString('id-ID')}
        </Text>

        {item.linkUrl && (
          <TouchableOpacity onPress={() => openLink(item.linkUrl)}>
            <Text style={styles.link}>📎 Buka Tugas</Text>
          </TouchableOpacity>
        )}

        <View style={styles.statusRow}>
          <Text style={[styles.status, { color: statusColor }]}>
            {item.status.toUpperCase()}
          </Text>

          <View style={styles.actionRow}>
            {item.status === 'pending' && (
              <>
                <TouchableOpacity
                  style={[styles.btn, styles.reject]}
                  onPress={() => updateStatus(item.id, 'rejected')}
                >
                  <Text style={styles.btnText}>Tolak</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.accept]}
                  onPress={() => updateStatus(item.id, 'reviewed')}
                >
                  <Text style={styles.btnText}>Terima</Text>
                </TouchableOpacity>
              </>
            )}

            {item.status === 'reviewed' && !item.isGraded && (
              <TouchableOpacity
                style={[styles.btn, styles.grade]}
                onPress={() =>
                  navigation.navigate('Nilai', {
                    submissionId: item.id,
                    santriName: item.user.name,
                    tugasTitle: item.tugas.title,
                  })
                }
              >
                <Text style={styles.btnText}>Nilai</Text>
              </TouchableOpacity>
            )}

            {item.isGraded && (
              <Text style={styles.gradedLabel}>✅ Sudah Dinilai</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Pengumpulan Tugas Santri</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={i => i.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>Belum ada pengumpulan</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default PengajarSubmissionScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#2c3e50',
  },
  empty: { textAlign: 'center', marginTop: 40, color: '#95a5a6' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  santri: { fontSize: 16, fontWeight: '700', color: '#34495e' },
  task: { fontSize: 14, color: '#7f8c8d', marginBottom: 6 },
  date: { fontSize: 12, color: '#95a5a6', marginBottom: 10 },
  link: { color: '#2980b9', fontWeight: '600', marginBottom: 12 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: { fontWeight: '700', fontSize: 13 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 6,
  },
  accept: { backgroundColor: '#2ecc71' },
  reject: { backgroundColor: '#e74c3c' },
  grade: { backgroundColor: '#3498db' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  gradedLabel: { marginLeft: 10, color: '#27ae60', fontWeight: '700' },
});
