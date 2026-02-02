import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../context/UserContext';
import Ionicons from '@react-native-vector-icons/ionicons';

interface Submission {
  id: number;
  status: 'pending' | 'submitted' | 'reviewed' | 'rejected';
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
  nilai?: {
    id: number;
    submissionId: number;
    nilai: number;
    catatan?: string | null;
    createdAt: string;
  };
  // <- tambahkan ini untuk menampung nilai dari backend
}

type StatusIzin = 'menunggu' | 'disetujui' | 'ditolak';

interface IzinData {
  id: number;
  status: StatusIzin;
  tanggal: string;
  alasan: string;
  user?: {
    name: string;
    kelas?: {
      namaKelas: string;
    };
  };
  kelas: {
    id?: number;
    namaKelas: string;
  };
}

const ArsipScreen = () => {
  const navigation = useNavigation<any>();
  const { role } = useContext(UserContext);
  const [submissionData, setSubmissionData] = useState<Submission[]>([]);
  const [izinData, setIzinData] = useState<IzinData[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil arsip submission
  const fetchSubmissionArsip = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API}/submission/tugas/arsip`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissionData(res.data.data);
      console.log(JSON.stringify(res.data.data, null, 2));
    } catch (err) {
      console.log('Fetch submission error:', err);
    }
  };

  // Ambil arsip izin
  const fetchIzinArsip = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API}/izin/arsip`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Hanya arsip: status bukan menunggu
      const arsip = res.data.data.filter(
        (i: IzinData) => i.status !== 'menunggu',
      );
      setIzinData(arsip);
    } catch (err) {
      console.log('Fetch izin error:', err);
    }
  };

  useEffect(() => {
    if (role !== 'pengajar') {
      Alert.alert('Akses Ditolak', 'Halaman ini hanya untuk pengajar');
      navigation.goBack();
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSubmissionArsip(), fetchIzinArsip()]);
      setLoading(false);
    };

    loadData();
  }, [role]);

  const openLink = async (url?: string | null) => {
    if (!url) return Alert.alert('Error', 'URL tidak ditemukan');
    try {
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      await Linking.openURL(finalUrl);
    } catch {
      Alert.alert('Error', 'Gagal membuka URL');
    }
  };

  // Fungsi untuk mendapatkan warna status submission
  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return {
          bg: '#3b82f615',
          text: '#3b82f6',
          icon: 'paper-plane-outline',
        };
      case 'reviewed':
        return {
          bg: '#10b98115',
          text: '#10b981',
          icon: 'checkmark-done-outline',
        };
      case 'rejected':
        return {
          bg: '#ef444415',
          text: '#765a5a',
          icon: 'close-circle-outline',
        };
      case 'pending':
      default:
        return { bg: '#f59e0b15', text: '#f59e0b', icon: 'time-outline' };
    }
  };

  const renderSubmissionItem = ({ item }: { item: Submission }) => {
    const statusColor = getSubmissionStatusColor(item.status);
    const kelasName = item.user.kelas?.namaKelas;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-outline" size={16} color="#3b82f6" />
            </View>
            <View style={styles.userText}>
              <Text style={styles.santri}>{item.user.name}</Text>
              <Text style={styles.kelasInfo}>{kelasName}</Text>
            </View>
          </View>
          <Text style={styles.taskId}>ID: {item.id}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.taskInfo}>
          <Ionicons
            name="document-text-outline"
            size={14}
            color="#6b7280"
            style={styles.taskIcon}
          />
          <Text style={styles.task} numberOfLines={2}>
            {item.tugas.title}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
          <Text style={styles.date}>
            {new Date(item.submittedAt).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="book-outline" size={12} color="#9ca3af" />
          <Text style={styles.kelasDetail}>Tugas untuk: {kelasName}</Text>
        </View>

        {item.linkUrl && (
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => openLink(item.linkUrl)}
          >
            <Ionicons name="link-outline" size={14} color="#3b82f6" />
            <Text style={styles.link}>Buka Tugas</Text>
            <Ionicons
              name="open-outline"
              size={12}
              color="#3b82f6"
              style={styles.openIcon}
            />
          </TouchableOpacity>
        )}

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusColor.bg,
                borderColor: statusColor.text,
              },
            ]}
          >
            <Ionicons
              name={statusColor.icon}
              size={12}
              color={statusColor.text}
            />
            <Text style={[styles.status, { color: statusColor.text }]}>
              {' '}
              {item.status.toUpperCase()}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: '#6b728015', borderColor: '#6b7280' },
            ]}
          >
            <Ionicons name="archive-outline" size={12} color="#6b7280" />
            <Text style={[styles.status, { color: '#6b7280' }]}> ARSIP</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.nilai ? '#10b98115' : '#f59e0b15',
                borderColor: item.nilai ? '#10b981' : '#f59e0b',
              },
            ]}
          >
            <Ionicons
              name={item.nilai ? 'ribbon' : 'ribbon-outline'}
              size={16}
              color={item.nilai ? '#10b981' : '#f59e0b'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.status,
                { color: item.nilai ? '#10b981' : '#f59e0b' },
              ]}
            >
              {item.nilai ? item.nilai.nilai : '-'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderIzinItem = ({ item }: { item: IzinData }) => {
    const kelasName = item.kelas?.namaKelas || 'Tidak diketahui';
    const userName = item.user?.name || 'Santri';
    const userKelas = item.user?.kelas?.namaKelas || kelasName;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: '#10b98110' },
              ]}
            >
              <Ionicons name="person-outline" size={16} color="#10b981" />
            </View>
            <View style={styles.userText}>
              <Text style={styles.santri}>{userName}</Text>
              <Text style={styles.kelasInfo}>{userKelas}</Text>
            </View>
          </View>
          <Text style={styles.taskId}>ID: {item.id}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.izinReason}>
          <Ionicons
            name="chatbubble-outline"
            size={14}
            color="#6b7280"
            style={styles.taskIcon}
          />
          <Text style={styles.izinReasonText}>{item.alasan}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
          <Text style={styles.date}>
            Tanggal Izin:{' '}
            {new Date(item.tanggal).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="school-outline" size={12} color="#9ca3af" />
          <Text style={styles.kelasDetail}>Kelas: {kelasName}</Text>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === 'disetujui'
                    ? '#10b98115'
                    : item.status === 'ditolak'
                    ? '#ef444415'
                    : '#6b728015',
                borderColor:
                  item.status === 'disetujui'
                    ? '#10b981'
                    : item.status === 'ditolak'
                    ? '#ef4444'
                    : '#6b7280',
              },
            ]}
          >
            <Ionicons
              name={
                item.status === 'disetujui'
                  ? 'checkmark-circle-outline'
                  : item.status === 'ditolak'
                  ? 'close-circle-outline'
                  : 'time-outline'
              }
              size={12}
              color={
                item.status === 'disetujui'
                  ? '#10b981'
                  : item.status === 'ditolak'
                  ? '#ef4444'
                  : '#6b7280'
              }
            />
            <Text
              style={[
                styles.status,
                {
                  color:
                    item.status === 'disetujui'
                      ? '#10b981'
                      : item.status === 'ditolak'
                      ? '#ef4444'
                      : '#6b7280',
                },
              ]}
            >
              {' '}
              {item.status.toUpperCase()}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: '#6b728015', borderColor: '#6b7280' },
            ]}
          >
            <Ionicons name="archive-outline" size={12} color="#6b7280" />
            <Text style={[styles.status, { color: '#6b7280' }]}> ARSIP</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Arsip</Text>
            <Text style={styles.headerSubtitle}>
              Tugas & Izin yang telah diarsipkan
            </Text>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="document-text-outline" size={20} color="#c7d2fe" />
            <Text style={styles.statNumber}>{submissionData.length}</Text>
            <Text style={styles.statLabel}>Submission</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={20} color="#c7d2fe" />
            <Text style={styles.statNumber}>{izinData.length}</Text>
            <Text style={styles.statLabel}>Izin</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Ionicons name="archive-outline" size={20} color="#c7d2fe" />
            <Text style={styles.statNumber}>
              {submissionData.length + izinData.length}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Memuat data arsip...</Text>
          </View>
        ) : (
          <>
            {/* Submission Section */}
            {submissionData.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.sectionIcon,
                      { backgroundColor: '#3b82f610' },
                    ]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color="#3b82f6"
                    />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Submission</Text>
                    <Text style={styles.sectionSubtitle}>
                      {submissionData.length} tugas telah diarsipkan
                    </Text>
                  </View>
                </View>
                <FlatList
                  data={submissionData}
                  keyExtractor={i => `sub-${i.id}`}
                  renderItem={renderSubmissionItem}
                  scrollEnabled={false}
                  contentContainerStyle={styles.listContent}
                />
              </View>
            )}

            {/* Izin Section */}
            {izinData.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.sectionIcon,
                      { backgroundColor: '#10b98110' },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#10b981"
                    />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Izin</Text>
                    <Text style={styles.sectionSubtitle}>
                      {izinData.length} permohonan izin telah diarsipkan
                    </Text>
                  </View>
                </View>
                <FlatList
                  data={izinData}
                  keyExtractor={i => `izin-${i.id}`}
                  renderItem={renderIzinItem}
                  scrollEnabled={false}
                  contentContainerStyle={styles.listContent}
                />
              </View>
            )}

            {/* Empty State */}
            {submissionData.length === 0 && izinData.length === 0 && (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="archive-outline" size={80} color="#d1d5db" />
                </View>
                <Text style={styles.emptyTitle}>Belum ada arsip</Text>
                <Text style={styles.emptySubtitle}>
                  Semua submission dan izin yang telah diarsipkan akan muncul di
                  sini
                </Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={() => {
                    setLoading(true);
                    Promise.all([
                      fetchSubmissionArsip(),
                      fetchIzinArsip(),
                    ]).then(() => setLoading(false));
                  }}
                >
                  <Ionicons name="refresh-outline" size={16} color="#3b82f6" />
                  <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ArsipScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  },
  headerSubtitle: {
    marginTop: 4,
    color: '#c7d2fe',
    fontSize: 14,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    color: '#c7d2fe',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2933',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    padding: 20,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    textAlign: 'center',
    color: '#4b5563',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  refreshText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  spacer: {
    height: 40,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userText: {
    flex: 1,
  },
  santri: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2933',
    marginBottom: 2,
  },
  kelasInfo: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  taskId: {
    fontSize: 11,
    color: '#9ca3af',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 14,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  task: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  izinReason: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  izinReasonText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
    flex: 1,
  },
  kelasDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  link: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  openIcon: {
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    minWidth: 60,
  },
  status: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
