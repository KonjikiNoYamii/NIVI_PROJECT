import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import FloatingArchiveButton from '../../components/FloatingArchiveButton';

/* ================== TYPE ================== */

type StatusIzin = 'menunggu' | 'disetujui' | 'ditolak';

interface IzinData {
  id: number;
  status: StatusIzin;
  tanggal: string;
  alasan: string;
  user?: {
    name: string;
  };
  kelas: {
    namaKelas: string;
  };
}

/* ================== CONSTANT ================== */

const STATUS_COLOR: Record<StatusIzin, string> = {
  menunggu: '#F59E0B',
  disetujui: '#10B981',
  ditolak: '#EF4444',
};

const STATUS_LABEL: Record<StatusIzin, string> = {
  menunggu: 'MENUNGGU',
  disetujui: 'DISETUJUI',
  ditolak: 'DITOLAK',
};

/* ================== HELPER ================== */

const getToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan');
  return token;
};

/* ================== COMPONENT ================== */

export default function PengajarIzinScreen() {
  const [izinList, setIzinList] = useState<IzinData[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(true);
  const [mode, setMode] = useState<'aktif' | 'arsip'>('aktif');

  /* ================== LOAD AUTH ================== */

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('role');
        setRole(storedRole);
      } catch {
        Alert.alert('Error', 'Gagal mengambil data autentikasi');
      } finally {
        setInitLoading(false);
      }
    };

    loadAuth();
  }, []);

  /* ================== FETCH IZIN ================== */
  const fetchIzinAktif = useCallback(async () => {
    if (!role || role !== 'pengajar') return;

    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/izin/all/pengajar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIzinList(res.data.data || []);
    } catch {
      Alert.alert('Error', 'Gagal mengambil izin aktif');
    } finally {
      setLoading(false);
    }
  }, [role]);

  const fetchIzinArsip = useCallback(async () => {
    if (!role || role !== 'pengajar') return;

    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/izin/arsip`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIzinList(res.data.data || []);
    } catch {
      Alert.alert('Error', 'Gagal mengambil izin arsip');
    } finally {
      setLoading(false);
    }
  }, [role]);

  /* ================== UPDATE STATUS ================== */

  const updateStatus = async (id: number, status: StatusIzin) => {
    const actionText = status === 'disetujui' ? 'MENYETUJUI' : 'MENOLAK';

    Alert.alert('Konfirmasi', `Yakin ingin ${actionText} izin ini?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya',
        onPress: async () => {
          setLoading(true);
          try {
            const token = await getToken();

            const res = await axios.put(
              `${API}/izin/${id}`,
              { status },
              { headers: { Authorization: `Bearer ${token}` } },
            );

            const realStatus: StatusIzin = res.data.data.status;

            fetchIzinAktif();

            Alert.alert(
              'Info',
              realStatus === 'disetujui'
                ? 'Izin disetujui'
                : 'Izin ditolak otomatis karena kuota absensi penuh',
            );
          } catch {
            Alert.alert('Error', 'Gagal update status izin');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const archiveIzin = async (id: number) => {
    Alert.alert('Konfirmasi', 'Izin ini akan diarsipkan. Lanjutkan?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya',
        onPress: async () => {
          setLoading(true);
          try {
            const token = await getToken();
            await axios.delete(`${API}/izin/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            fetchIzinAktif(); // refresh list
            Alert.alert('Berhasil', 'Izin berhasil diarsipkan');
          } catch {
            Alert.alert('Error', 'Gagal mengarsipkan izin');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      if (mode === 'aktif') {
        fetchIzinAktif();
      }

      if (mode === 'arsip') {
        fetchIzinArsip();
      }
    }, [mode, fetchIzinAktif, fetchIzinArsip]),
  );

  /* ================== RENDER ITEM ================== */

  const renderItem = ({ item }: { item: IzinData }) => (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user?.name || 'Santri'}</Text>
          <Text style={styles.classText}>
            Kelas: {item.kelas?.namaKelas || '-'}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLOR[item.status] },
          ]}
        >
          <Text style={styles.statusText}>{STATUS_LABEL[item.status]}</Text>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.cardContent}>
        <Text style={styles.dateText}>
          Tanggal:{' '}
          {new Date(item.tanggal).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>Alasan:</Text>
          <Text style={styles.reasonText}>{item.alasan}</Text>
        </View>
      </View>

      {/* ACTIONS */}
      {item.status === 'menunggu' && mode === 'aktif' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => updateStatus(item.id, 'disetujui')}
            activeOpacity={0.85}
          >
            <Icon name="check" type="font-awesome" color="#fff" size={14} />
            <Text style={styles.actionButtonText}>Setujui</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => updateStatus(item.id, 'ditolak')}
            activeOpacity={0.85}
          >
            <Icon name="times" type="font-awesome" color="#fff" size={14} />
            <Text style={styles.actionButtonText}>Tolak</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* ACTION ARSIP */}
      {item.status !== 'menunggu' && mode === 'aktif' && (
        <View style={styles.archiveContainer}>
          <TouchableOpacity
            style={styles.archiveButton}
            onPress={() => archiveIzin(item.id)}
            activeOpacity={0.85}
          >
            <Icon name="archive" type="font-awesome" size={14} color="#fff" />
            <Text style={styles.archiveText}>Arsipkan</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  /* ================== STATE HANDLING ================== */

  if (initLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (role !== 'pengajar') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Akses Ditolak</Text>
          <Text style={styles.errorSubtext}>
            Hanya pengajar yang dapat mengakses halaman ini
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ================== UI ================== */

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manajemen Izin Santri</Text>
          <Text style={styles.headerSubtitle}>
            Kelola pengajuan izin santri dengan mudah
          </Text>
        </View>

        {/* CONTENT */}
        <View style={styles.contentContainer}>
          {loading && izinList.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Memuat data izin...</Text>
            </View>
          ) : (
            <FlatList
              data={izinList}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
              scrollEnabled={false}
              ListHeaderComponent={
                <Text style={styles.totalText}>
                  Total: {izinList.length} pengajuan izin
                </Text>
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Tidak ada pengajuan izin</Text>
                  <Text style={styles.emptySubtext}>
                    Semua izin santri telah diproses
                  </Text>
                </View>
              }
            />
          )}
        </View>

        {/* SPACER UNTUK NAVIGATOR */}
        <View style={styles.spacer} />

        
      </ScrollView>
      <FloatingArchiveButton />
    </SafeAreaView>
  );
}

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  scrollContent: {
    paddingBottom: 100, // DITAMBAHKAN: Padding untuk navigator
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

  contentContainer: {
    paddingHorizontal: 16,
    marginTop: 16, // DITAMBAHKAN: Margin agar tidak nabrak header
  },

  totalText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 16,
  },

  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    marginTop: 20,
  },

  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  userInfo: {
    flex: 1,
    marginRight: 12,
  },

  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },

  classText: {
    fontSize: 13,
    color: '#6b7280',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },

  cardContent: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },

  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  reasonContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  reasonLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: 4,
  },

  reasonText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },

  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  approveButton: {
    backgroundColor: '#10B981',
  },

  rejectButton: {
    backgroundColor: '#EF4444',
  },

  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 13,
    letterSpacing: 0.3,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    marginTop: 20,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 20,
  },

  errorText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: 8,
  },

  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },

  // DITAMBAHKAN: Spacer untuk navigator
  spacer: {
    height: 100,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    marginHorizontal: 4,
  },

  tabActive: {
    backgroundColor: '#2563eb',
  },

  tabText: {
    color: '#fff',
    fontWeight: '700',
  },

  archiveContainer: {
    marginTop: 16,
    alignItems: 'flex-end',
  },

  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#64748b',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  archiveText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 13,
  },
});
