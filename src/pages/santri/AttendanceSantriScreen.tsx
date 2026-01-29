// SantriAbsensiScreen.tsx - Fokus pada tombol tanpa shadow
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../../components/loading';
import { API } from '../../services/api';
import { NIVI } from '../../theme/niviTheme';
import { Icon } from 'react-native-elements';
import { TextInput } from 'react-native-gesture-handler';
import { socket } from '../../services/socket';
import { useAiBubble } from '../../context/aiBubbleContext';

const getToken = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan');
  return token;
};

type StatusAbsensi = 'hadir' | 'izin' | 'sakit';

const statusColors: any = {
  hadir: '#10B981',
  izin: '#F59E0B',
  sakit: '#EF4444',
};

export default function SantriAbsensiScreen() {
  const [absensiHariIni, setAbsensiHariIni] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusAbsen, setStatusAbsen] = useState<StatusAbsensi | null>(null);
  const [showIzinModal, setShowIzinModal] = useState(false);
  const [alasanIzin, setAlasanIzin] = useState('');
  const [izinPending, setIzinPending] = useState(false);
  const { bubble, clearBubble } = useAiBubble();

  const statusOptions: StatusAbsensi[] = ['hadir', 'izin', 'sakit'];

  // ==================== FETCH ABSENSI ====================
  const fetchAbsensiHariIni = useCallback(async () => {
    setLoading(true);
    try {
      clearBubble();

      const token = await getToken();
      const res = await axios.get(`${API}/absensi/me/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAbsensiHariIni(res.data.data || []);
    } catch {
      Alert.alert('Error', 'Gagal mengambil data absensi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ==================== FETCH IZIN PENDING ====================
  const fetchIzinPending = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/izin/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIzinPending(res.data.some((i: any) => i.status === 'menunggu'));
    } catch {}
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([fetchAbsensiHariIni(), fetchIzinPending()]);
  }, [fetchAbsensiHariIni, fetchIzinPending]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log('WEBSOCKET CONNECTED:', socket.id);
    });

    // Ambil kelas user dari AsyncStorage atau dari state user
    const joinKelas = async () => {
      const kelasStr = await AsyncStorage.getItem('kelasIds');
      const kelasIds = kelasStr ? JSON.parse(kelasStr) : [];
      if (kelasIds.length) {
        socket.emit('join-kelas', kelasIds);
        console.log('Joined kelas:', kelasIds);
      }
    };

    joinKelas();

    socket.on('absensi-update', data => {
      console.log('Realtime absensi:', data);
      setAbsensiHariIni(data);
    });

    return () => {
      socket.off('connect');
      socket.off('absensi-update');
      socket.disconnect();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ==================== SUBMIT ABSEN ====================
  const submitAbsen = async (status: StatusAbsensi) => {
    setLoading(true);
    try {
      const token = await getToken();
      await axios.post(
        `${API}/absensi/absen`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStatusAbsen(status);
      Alert.alert('Berhasil', 'Absen berhasil');

      // Refresh data
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Gagal absen');
    } finally {
      setLoading(false);
    }
  };

  // ==================== SUBMIT IZIN ====================
  const submitIzin = async () => {
    if (!alasanIzin.trim()) {
      Alert.alert('Validasi', 'Alasan izin wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      await axios.post(
        `${API}/izin`,
        {
          alasan: alasanIzin,
          tanggal: new Date(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Alert.alert('Berhasil', 'Izin berhasil diajukan dan menunggu persetujuan');

      setShowIzinModal(false);
      setAlasanIzin('');

      // Refresh izin pending & absensi
      await loadData();
    } catch (err: any) {
      Alert.alert('Gagal', err.response?.data?.message || 'Terjadi kesalahan server');
    } finally {
      setLoading(false);
    }
  };

  // ==================== STATISTIK ====================
  const stats: any = { hadir: 0, izin: 0, sakit: 0 };
  absensiHariIni.forEach(a => {
    stats[a.status] = (stats[a.status] || 0) + 1;
  });
  const total = absensiHariIni.length;
  const percent = (v: number) =>
    total === 0 ? 0 : Math.round((v / total) * 100);

  // ==================== RENDER ====================
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Absensi Hari Ini</Text>
      <Text style={styles.headerSubtitle}>
        Lakukan absensi sesuai status Anda
      </Text>
    </View>
  );

  const renderContent = () => (
    <>
      {/* ==================== BUTTON ABSEN CARD ==================== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status Absensi</Text>
        
        <View style={styles.buttonGroup}>
          {statusOptions.map(s => {
            const bgColor = statusColors[s];
            const isActive = statusAbsen === s;
            const isDisabled = s === 'izin' && izinPending;

            return (
              <TouchableOpacity
                key={s}
                activeOpacity={0.85}
                onPress={() => {
                  if (s === 'izin') {
                    if (!izinPending) {
                      setShowIzinModal(true);
                    } else {
                      Alert.alert('Peringatan', 'Masih ada izin menunggu, tunggu persetujuan');
                    }
                  } else {
                    submitAbsen(s);
                  }
                }}
                disabled={isDisabled}
                style={[
                  styles.btn,
                  isActive && styles.btnActive,
                  {
                    backgroundColor: isActive
                      ? bgColor
                      : isDisabled
                      ? '#f3f4f6'
                      : `${bgColor}0A`,
                    borderColor: isActive
                      ? bgColor
                      : isDisabled
                      ? '#e5e7eb'
                      : `${bgColor}30`,
                  },
                ]}
              >
                <View style={[
                  styles.btnIconContainer,
                  isActive && styles.btnIconContainerActive,
                  isDisabled && styles.btnIconContainerDisabled,
                ]}>
                  <Icon
                    name={
                      s === 'hadir'
                        ? 'check-circle'
                        : s === 'izin'
                        ? 'clock'
                        : 'heartbeat'
                    }
                    type="font-awesome"
                    color={
                      isActive
                        ? '#FFFFFF'
                        : isDisabled
                        ? '#d1d5db'
                        : bgColor
                    }
                    size={24}
                  />
                </View>
                <Text style={[
                  styles.btnText,
                  isActive && styles.btnTextActive,
                  isDisabled && styles.btnTextDisabled,
                  { color: isActive ? '#FFFFFF' : isDisabled ? '#9ca3af' : bgColor }
                ]}>
                  {s.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ==================== STATISTIK CARD ==================== */}
      <View style={[styles.listCard, styles.statistikCard]}>
        <Text style={styles.listTitle}>Statistik Absensi</Text>
        
        {total === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada absensi hari ini</Text>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {statusOptions.map(key => (
              <View 
                key={key} 
                style={styles.statCard}
              >
                <View style={[
                  styles.statIconContainer,
                  { backgroundColor: `${statusColors[key]}15` }
                ]}>
                  <Icon
                    name={
                      key === 'hadir'
                        ? 'check-circle'
                        : key === 'izin'
                        ? 'clock'
                        : 'heartbeat'
                    }
                    type="font-awesome"
                    color={statusColors[key]}
                    size={20}
                  />
                </View>
                <Text style={[styles.statValue, { color: statusColors[key] }]}>
                  {stats[key as keyof typeof stats]}
                </Text>
                <Text style={styles.statLabel}>{key.toUpperCase()}</Text>
                <View style={styles.bar}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${percent(stats[key as keyof typeof stats])}%`,
                        backgroundColor: statusColors[key],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.percent}>
                  {percent(stats[key as keyof typeof stats])}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ==================== RIWAYAT ABSENSI CARD ==================== */}
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Riwayat Absensi</Text>
        
        {absensiHariIni.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada absensi hari ini</Text>
          </View>
        ) : (
          <FlatList
            data={absensiHariIni}
            keyExtractor={i => i.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: `${statusColors[item.status]}15` }
                ]}>
                  <Icon
                    name={
                      item.status === 'hadir'
                        ? 'check-circle'
                        : item.status === 'izin'
                        ? 'clock'
                        : 'heartbeat'
                    }
                    type="font-awesome"
                    color={statusColors[item.status]}
                    size={16}
                  />
                </View>
                <View style={styles.listItemContent}>
                  <Text
                    style={[
                      styles.jadwal,
                      item.status === 'izin' || item.status === 'disetujui'
                        ? { color: '#F59E0B' }
                        : {},
                    ]}
                  >
                    {item.status === 'izin' || item.status === 'disetujui'
                      ? `Izin | ${new Date(item.tanggal).toLocaleDateString('id-ID')}`
                      : `${item.jadwal?.hari || 'Tidak ada jadwal'} | ${item.jadwal?.jamMulai || ''}-${item.jadwal?.jamSelesai || ''}`}
                  </Text>
                  <Text
                    style={[styles.status, { color: statusColors[item.status] }]}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* SPACER UNTUK NAVIGATOR */}
      <View style={styles.spacer} />
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <Loading visible={loading} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderContent()}
      </ScrollView>

      {/* ==================== MODAL IZIN ==================== */}
      <Modal
        visible={showIzinModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajukan Izin</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowIzinModal(false);
                  setAlasanIzin('');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Alasan Izin</Text>
            <TextInput
              value={alasanIzin}
              onChangeText={setAlasanIzin}
              placeholder="Contoh: Keperluan keluarga"
              placeholderTextColor="#9ca3af"
              multiline
              style={styles.textArea}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowIzinModal(false);
                  setAlasanIzin('');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCancelButtonText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={submitIzin}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSubmitButtonText}>AJUKAN IZIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  scrollContent: {
    paddingBottom: 100, // Spacer untuk navigator
  },

  // HEADER - SEKARANG DI DALAM SCROLLVIEW
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "android" ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },

  headerSubtitle: {
    marginTop: 6,
    color: "#c7d2fe",
    fontSize: 14,
  },

  // CARD - Untuk Status Absensi
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 24, // Tambah margin bawah agar berjarak dengan statistik
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },

  // LIST CARD - Untuk Statistik dan Riwayat
  listCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  // Statistik Card khusus dengan margin atas
  statistikCard: {
    marginTop: 0, // Jaga jarak dari card status absensi
  },

  listTitle: { // ← TAMBAHKAN INI
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111827",
  },

  // BUTTON GROUP
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  btn: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 0,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    borderWidth: 2,
  },

  btnActive: {
    // No shadow
  },

  btnIconContainer: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  btnIconContainerActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  btnIconContainerDisabled: {
    backgroundColor: '#f3f4f6',
  },

  btnText: { 
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
    marginTop: 2,
  },

  btnTextActive: {
    fontWeight: '800',
  },

  btnTextDisabled: {
    opacity: 0.5,
  },

  // STATISTICS
  statsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: 12,
  },

  statCard: { 
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  statValue: { 
    fontSize: 24, 
    fontWeight: '800', 
    marginBottom: 4,
  },

  statLabel: { 
    fontSize: 12, 
    color: '#6b7280', 
    marginBottom: 10,
    fontWeight: '600',
  },

  bar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 6,
  },

  fill: { 
    height: '100%', 
    borderRadius: 2,
  },

  percent: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    color: '#9ca3af',
  },

  // LIST ITEMS
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: 'row',
    alignItems: 'center',
  },

  listItemContent: {
    flex: 1,
  },

  statusIndicator: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  jadwal: { 
    fontSize: 14, 
    color: '#4b5563', 
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: '500',
  },

  status: { 
    fontSize: 13, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // EMPTY STATE
  emptyContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
  },

  // MODAL
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },

  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  modalCloseButtonText: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '700',
  },

  modalLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 10,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    textAlignVertical: 'top',
    marginHorizontal: 20,
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 12,
  },

  modalCancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 14,
  },

  modalSubmitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },

  modalSubmitButtonText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // SPACER UNTUK NAVIGATOR
  spacer: {
    height: 100,
  },
});