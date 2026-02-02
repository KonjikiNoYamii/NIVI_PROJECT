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
  ScrollView,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { API } from '../../services/api';
import Ionicons from '@react-native-vector-icons/ionicons';
import FloatingArchiveButton from '../../components/FloatingArchiveButton';

interface Submission {
  id: number;
  status: 'pending' | 'submitted' | 'reviewed' | 'rejected';
  isGraded: boolean;
  linkUrl?: string | null;
  submittedAt: string;
  user: {
    name: string;
    kelasId: number;
    kelas?: {
      id: number;
      namaKelas: string;
    };
  };
  tugas: {
    id: number;
    title: string;
    kelasId: number;
  };
}

interface Kelas {
  id: number;
  namaKelas: string;
}

const PengajarSubmissionScreen = () => {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredData, setFilteredData] = useState<Submission[]>([]);

  const fetchKelas = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API}/kelas/all/pengajar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setKelasList(res.data.data);
      }
    } catch (err) {
      console.log('Fetch kelas error:', err);
    }
  };

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

  // Filter data berdasarkan search query dan kelas yang dipilih
  useEffect(() => {
    let result = data;

    // Filter by kelas jika ada yang dipilih
    if (selectedKelas !== null) {
      result = result.filter(item => {
        // Cek dari user.kelasId atau tugas.kelasId
        const itemKelasId = item.user.kelasId || item.tugas.kelasId;
        return itemKelasId === selectedKelas;
      });
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.user.name.toLowerCase().includes(query) ||
          item.tugas.title.toLowerCase().includes(query),
      );
    }

    setFilteredData(result);
  }, [data, selectedKelas, searchQuery]);

  const softDeleteSubmission = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${API}/submission/${id}/arsip`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert('Berhasil', 'Submission telah diarsipkan');
      fetchSubmission(); // refresh data setelah soft delete
    } catch (err) {
      console.log('Soft delete error:', err);
      Alert.alert('Error', 'Gagal mengarsipkan submission');
    }
  };

  useEffect(() => {
    fetchKelas();
    fetchSubmission();

    // Refresh data setiap kali screen focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSubmission();
    });

    return unsubscribe;
  }, []);

  const renderItem = ({ item }: { item: Submission }) => {
    let statusColor = '#f59e0b';
    if (item.status === 'reviewed') statusColor = '#10b981';
    else if (item.status === 'rejected') statusColor = '#ef4444';
    else if (item.status === 'submitted') statusColor = '#3b82f6';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.santri}>{item.user.name}</Text>
          <Text style={styles.kelasTag}>
            {item.user.kelas?.namaKelas || `Kelas ${item.user.kelasId}`}
          </Text>
        </View>

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
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}15` },
            ]}
          >
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
              <TouchableOpacity
                style={[styles.btn, styles.archive]}
                onPress={() => softDeleteSubmission(item.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>Arsip</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <View style={styles.container}>
        {/* HEADER YANG IKUT SCROLL */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Pengumpulan Tugas Santri</Text>
            <Text style={styles.headerSubtitle}>
              Daftar pengumpulan tugas yang perlu dinilai
            </Text>
          </View>

          {/* SEARCH BAR */}
          <View style={styles.searchContainerWrapper}>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color="#9ca3af"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari nama santri atau judul tugas..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchButton}
                >
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* KELAS BUTTONS HORIZONTAL */}
          <View style={styles.kelasContainer}>
            <Text style={styles.kelasLabel}>Pilih Kelas:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.kelasButtonsContainer}
            >
              {/* Tombol Semua */}
              <TouchableOpacity
                style={[
                  styles.kelasButton,
                  selectedKelas === null && styles.kelasButtonActive,
                ]}
                onPress={() => setSelectedKelas(null)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.kelasButtonText,
                    selectedKelas === null && styles.kelasButtonTextActive,
                  ]}
                >
                  Semua
                </Text>
              </TouchableOpacity>

              {/* Tombol untuk setiap kelas */}
              {kelasList.map(kelas => (
                <TouchableOpacity
                  key={kelas.id}
                  style={[
                    styles.kelasButton,
                    selectedKelas === kelas.id && styles.kelasButtonActive,
                  ]}
                  onPress={() => setSelectedKelas(kelas.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.kelasButtonText,
                      selectedKelas === kelas.id &&
                        styles.kelasButtonTextActive,
                    ]}
                  >
                    {kelas.namaKelas}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* RESULTS INFO */}
          <View style={styles.resultsInfo}>
            <Text style={styles.totalText}>
              Menampilkan {filteredData.length} dari {data.length} pengumpulan
            </Text>
            {selectedKelas !== null && (
              <Text style={styles.selectedKelasText}>
                Kelas: {kelasList.find(k => k.id === selectedKelas)?.namaKelas}
              </Text>
            )}
            {searchQuery && (
              <Text style={styles.searchQueryText}>
                Pencarian: "{searchQuery}"
              </Text>
            )}
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : filteredData.length > 0 ? (
            <View style={styles.listContainer}>
              <FlatList
                data={filteredData}
                keyExtractor={i => i.id.toString()}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={60}
                color="#d1d5db"
              />
              <Text style={styles.emptyTitle}>
                {searchQuery || selectedKelas !== null
                  ? 'Tidak ada hasil ditemukan'
                  : 'Belum ada pengumpulan tugas'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || selectedKelas !== null
                  ? 'Coba dengan kata kunci lain atau pilih kelas berbeda'
                  : 'Santri belum mengumpulkan tugas'}
              </Text>
              {(searchQuery || selectedKelas !== null) && (
                <TouchableOpacity
                  style={styles.resetFilterButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedKelas(null);
                  }}
                >
                  <Text style={styles.resetFilterText}>Reset Filter</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* SPACER UNTUK NAVIGATOR */}
          <View style={styles.spacer} />
        </ScrollView>
      </View>
      <FloatingArchiveButton />
    </SafeAreaView>
  );
};

export default PengajarSubmissionScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  scrollView: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  scrollContent: {
    paddingBottom: 100,
  },

  header: {
    backgroundColor: '#1e3a8a',
    paddingTop: Platform.OS === 'android' ? 48 : 64,
    paddingBottom: 24,
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

  searchContainerWrapper: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#374151',
  },

  clearSearchButton: {
    padding: 4,
  },

  kelasContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  kelasLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  kelasButtonsContainer: {
    paddingRight: 16,
  },

  kelasButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  kelasButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },

  kelasButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },

  kelasButtonTextActive: {
    color: '#ffffff',
  },

  resultsInfo: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  totalText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },

  selectedKelasText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '500',
    marginTop: 4,
  },

  searchQueryText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },

  listContainer: {
    paddingHorizontal: 16,
  },

  card: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  santri: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2933',
    flex: 1,
  },

  kelasTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
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
    fontWeight: '600',
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
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  status: {
    fontWeight: '700',
    fontSize: 11,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },

  accept: {
    backgroundColor: '#10b981',
  },

  reject: {
    backgroundColor: '#ef4444',
  },

  grade: {
    backgroundColor: '#2563eb',
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.3,
  },

  gradedBadge: {
    backgroundColor: '#10b98115',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#10b98130',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    marginTop: 16,
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },

  emptyTitle: {
    textAlign: 'center',
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },

  emptySubtitle: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 20,
  },

  resetFilterButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },

  resetFilterText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },

  spacer: {
    height: 100,
  },

  archive: {
    backgroundColor: '#6b7280', // abu-abu
  },
});
