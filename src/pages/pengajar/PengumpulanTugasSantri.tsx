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
  StatusBar,
  Platform,
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
    let statusColor = '#f59e0b';
    if (item.status === 'reviewed') statusColor = '#10b981';
    else if (item.status === 'rejected') statusColor = '#ef4444';
    else if (item.status === 'submitted') statusColor = '#3b82f6';

    return (
      <View style={styles.card}>
        <Text style={styles.santri}>{item.user.name}</Text>
        <Text style={styles.task}>{item.tugas.title}</Text>
        <Text style={styles.date}>
          {new Date(item.submittedAt).toLocaleString('id-ID')}
        </Text>

        {item.linkUrl && (
          <TouchableOpacity 
            onPress={() => openLink(item.linkUrl)}
            activeOpacity={0.85}
          >
            <Text style={styles.link}>📎 Buka Tugas</Text>
          </TouchableOpacity>
        )}

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.status, { color: statusColor }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>

          <View style={styles.actionRow}>
            {item.status === 'pending' && (
              <>
                <TouchableOpacity
                  style={[styles.btn, styles.reject]}
                  onPress={() => updateStatus(item.id, 'rejected')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnText}>Tolak</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.accept]}
                  onPress={() => updateStatus(item.id, 'reviewed')}
                  activeOpacity={0.85}
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
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>Nilai</Text>
              </TouchableOpacity>
            )}

            {item.isGraded && (
              <View style={styles.gradedBadge}>
                <Text style={styles.gradedLabel}>✅ Sudah Dinilai</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pengumpulan Tugas Santri</Text>
        <Text style={styles.headerSubtitle}>
          Daftar pengumpulan tugas yang perlu dinilai
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={i => i.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada pengumpulan tugas</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default PengajarSubmissionScreen;

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#f1f5f9' 
  },
  
  header: {
    backgroundColor: '#1e3a8a',
    paddingTop: Platform.OS === 'android' ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  
  headerSubtitle: {
    marginTop: 6,
    color: '#c7d2fe',
    fontSize: 14,
  },
  
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  
  card: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 20,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  
  santri: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#1f2933',
    marginBottom: 4,
  },
  
  task: { 
    fontSize: 14, 
    color: '#6b7280',
    marginBottom: 8,
  },
  
  date: { 
    fontSize: 12, 
    color: '#9ca3af', 
    marginBottom: 12,
  },
  
  link: { 
    color: '#3b82f6', 
    fontWeight: '700', 
    marginBottom: 16,
    fontSize: 14,
  },
  
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  
  status: { 
    fontWeight: '800', 
    fontSize: 12,
  },
  
  actionRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  
  accept: { 
    backgroundColor: '#10b981' 
  },
  
  reject: { 
    backgroundColor: '#ef4444' 
  },
  
  grade: { 
    backgroundColor: '#2563eb' 
  },
  
  btnText: { 
    color: '#fff', 
    fontWeight: '800', 
    fontSize: 12,
    letterSpacing: 0.3,
  },
  
  gradedBadge: {
    backgroundColor: '#10b98115',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  
  gradedLabel: { 
    color: '#10b981', 
    fontWeight: '800', 
    fontSize: 12,
  },
  
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    padding: 20,
  },
  
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
});