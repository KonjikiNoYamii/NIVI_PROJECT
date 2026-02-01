import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API, SOCKET_URL } from '../../services/api';
import { Icon } from 'react-native-elements';
import io from 'socket.io-client';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { Image } from 'react-native';

/* =======================
   INTERFACE
======================= */
interface Kelas {
  id: number;
  namaKelas: string;
}

interface Pengajar {
  id: number;
  email: string;
  name: string;
  profile?: {
    namaLengkap?: string;
    fotoUrl?: string;
  } | null;
}

/* =======================
   SOCKET
======================= */
const socket = io(SOCKET_URL, { transports: ['websocket'] });

/* =======================
   COMPONENT
======================= */
const ManagePengajarScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);

  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<number | null>(null);

  const [allPengajar, setAllPengajar] = useState<Pengajar[]>([]);
  const [pengajarKelas, setPengajarKelas] = useState<Pengajar[]>([]);

  const [loadingAssign, setLoadingAssign] = useState(false);
  const [loadingPengajarKelas, setLoadingPengajarKelas] = useState(false);
  const [fetchingInit, setFetchingInit] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* =======================
     FETCH INITIAL DATA
  ======================= */
  const fetchInitData = async () => {
    try {
      const [kelasRes, pengajarRes] = await Promise.all([
        axios.get(`${API}/kelas`),
        axios.get(`${API}/users/pengajar`),
      ]);
      setKelasList(kelasRes.data.data ?? kelasRes.data ?? []);

      // Format data pengajar agar konsisten
      const pengajarData = pengajarRes.data.data ?? pengajarRes.data ?? [];
      const formattedPengajar = pengajarData.map((p: any) => ({
        id: p.id,
        email: p.email,
        name: p.profile?.namaLengkap || p.name || p.email.split('@')[0],
        profile: p.profile,
      }));

      setAllPengajar(formattedPengajar);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Gagal mengambil data awal');
    } finally {
      setFetchingInit(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInitData();
  }, []);

  /* =======================
     FETCH PENGAJAR BY KELAS
  ======================= */
  useEffect(() => {
    if (!selectedKelasId) {
      setPengajarKelas([]);
      return;
    }
    const fetchPengajarByKelas = async () => {
      setLoadingPengajarKelas(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(
          `${API}/admin/kelas/${selectedKelasId}/pengajar`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const raw = res.data?.data ?? res.data;
        console.log(res.data.data);

        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.pengajar)
          ? raw.pengajar
          : [];

        // Format data pengajar agar konsisten
        const formattedPengajar = list.map((p: any) => ({
          id: p.id,
          email: p.email,
          name: p.profile?.namaLengkap || p.name || p.email.split('@')[0],
          profile: p.profile,
        }));

        setPengajarKelas(formattedPengajar);
      } catch (err) {
        console.log(err);
        Alert.alert('Error', 'Gagal mengambil pengajar kelas');
      } finally {
        setLoadingPengajarKelas(false);
      }
    };
    fetchPengajarByKelas();
  }, [selectedKelasId]);

  /* =======================
     SOCKET LISTENERS
  ======================= */
  useEffect(() => {
    socket.on('kelas-created', (kelas: Kelas) => {
      setKelasList(prev => [...prev, kelas]);
    });

    socket.on('kelas-updated', (kelas: Kelas) => {
      setKelasList(prev => prev.map(k => (k.id === kelas.id ? kelas : k)));
    });

    socket.on('kelas-deleted', ({ id }: { id: number }) => {
      setKelasList(prev => prev.filter(k => k.id !== id));
      if (selectedKelasId === id) setSelectedKelasId(null);
    });

    socket.on(
      'kelas-pengajar-updated',
      (updatedKelas: { id: number; pengajar: Pengajar[] }) => {
        if (selectedKelasId === updatedKelas.id) {
          const formattedPengajar =
            updatedKelas.pengajar?.map(p => ({
              id: p.id,
              email: p.email,
              name: p.profile?.namaLengkap || p.name || p.email.split('@')[0],
              profile: p.profile,
            })) ?? [];
          setPengajarKelas(formattedPengajar);
        }
      },
    );

    return () => {
      socket.off('kelas-created');
      socket.off('kelas-updated');
      socket.off('kelas-deleted');
      socket.off('kelas-pengajar-updated');
    };
  }, [selectedKelasId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInitData();
  };

  /* =======================
     CREATE PENGAJAR
  ======================= */
  const handleCreatePengajar = async () => {
    if (!name || !email) {
      Alert.alert('Validasi', 'Nama dan email wajib diisi');
      return;
    }
    setCreating(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(
        `${API}/admin/pengajar`,
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const newPengajar = res.data.data ?? res.data;
      setAllPengajar(prev => [
        ...prev,
        {
          id: newPengajar.id,
          email: newPengajar.email,
          name: newPengajar.profiles?.name || newPengajar.name || name,
          profile: newPengajar.profiles,
        },
      ]);
      setName('');
      setEmail('');
      Alert.alert('Berhasil', 'Pengajar berhasil dibuat');
    } catch (err: any) {
      console.log(err);
      Alert.alert(
        'Gagal',
        err.response?.data?.message ?? 'Terjadi kesalahan server',
      );
    } finally {
      setCreating(false);
    }
  };

  /* =======================
     ASSIGN PENGAJAR
  ======================= */
  const handleAssignPengajar = async (pengajarIds: number | number[]) => {
    if (!selectedKelasId) return;
    setLoadingAssign(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API}/kelas/${selectedKelasId}/pengajar`,
        { pengajarIds },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update state frontend secara manual
      const newPengajar = allPengajar.filter(p =>
        (Array.isArray(pengajarIds) ? pengajarIds : [pengajarIds]).includes(
          p.id,
        ),
      );
      setPengajarKelas(prev => [...prev, ...newPengajar]);

      Alert.alert('Berhasil', 'Pengajar berhasil ditambahkan ke kelas');
    } catch (err) {
      console.log(err);
      Alert.alert('Gagal', 'Gagal menambahkan pengajar');
    } finally {
      setLoadingAssign(false);
    }
  };

  /* =======================
     REMOVE PENGAJAR
  ======================= */
  const handleRemovePengajar = async (pengajarId: number) => {
    if (!selectedKelasId) return;
    Alert.alert(
      'Konfirmasi',
      'Apakah yakin ingin menghapus pengajar dari kelas ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`${API}/admin/kelas/pengajar`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { kelasId: selectedKelasId, pengajarId },
              });

              socket.emit('kelas-pengajar-changed', {
                kelasId: selectedKelasId,
              });

              setPengajarKelas(prev => prev.filter(p => p.id !== pengajarId));
              Alert.alert('Berhasil', 'Pengajar dihapus dari kelas');
            } catch (err) {
              console.log(err);
              Alert.alert('Gagal', 'Gagal menghapus pengajar');
            }
          },
        },
      ],
    );
  };

  // Fungsi untuk mendapatkan inisial dari nama
  const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const avatarColors = ['#2563eb', '#059669', '#7c3aed', '#f59e0b', '#dc2626'];

  const getRandomColor = (id: number) => avatarColors[id % avatarColors.length];

  if (fetchingInit && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Manajemen Pengajar</Text>
        <Text style={styles.headerSubtitle}>
          Kelola data pengajar dan penugasan kelas
        </Text>
      </View>
      <TouchableOpacity style={styles.headerIcon}>
        <FontAwesome6 name="chalkboard-user" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => (
    <>
      {/* FORM BUAT PENGAJAR CARD */}
      <View style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Icon
              name="user-plus"
              type="font-awesome"
              size={16}
              color="#2563eb"
              style={styles.cardTitleIcon}
            />
            <Text style={styles.cardTitle}>Buat Pengajar Baru</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Tambahkan pengajar baru ke sistem
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput
            placeholder="Masukkan nama pengajar"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!creating}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Masukkan email pengajar"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!creating}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, creating && styles.disabled]}
          onPress={handleCreatePengajar}
          disabled={creating}
          activeOpacity={0.85}
        >
          {creating ? (
            <View style={styles.buttonLoading}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.buttonLoadingText}>Membuat...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Icon
                name="save"
                type="font-awesome"
                size={14}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>BUAT PENGAJAR</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* PILIH KELAS CARD */}
      <View style={[styles.mainCard, styles.kelasCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Icon
              name="group"
              type="font-awesome"
              size={16}
              color="#7c3aed"
              style={styles.cardTitleIcon}
            />
            <Text style={styles.cardTitle}>Pilih Kelas</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Pilih kelas untuk menugaskan pengajar
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.kelasScroll}
          contentContainerStyle={styles.kelasScrollContent}
        >
          {kelasList.length === 0 ? (
            <View style={styles.emptyKelas}>
              <Icon
                name="school"
                type="font-awesome"
                size={20}
                color="#9ca3af"
              />
              <Text style={styles.emptyKelasText}>Tidak ada kelas</Text>
            </View>
          ) : (
            <>
              {kelasList.map(k => (
                <TouchableOpacity
                  key={k.id}
                  style={[
                    styles.kelasButton,
                    selectedKelasId === k.id && styles.kelasButtonActive,
                  ]}
                  onPress={() => setSelectedKelasId(k.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.kelasButtonContent}>
                    <FontAwesome6
                      name="door-open"
                      size={14}
                      color={selectedKelasId === k.id ? '#fff' : '#6b7280'}
                      style={styles.kelasButtonIcon}
                    />
                    <Text
                      style={[
                        styles.kelasButtonText,
                        selectedKelasId === k.id &&
                          styles.kelasButtonTextActive,
                      ]}
                    >
                      {k.namaKelas}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>

        {selectedKelasId && kelasList.find(k => k.id === selectedKelasId) && (
          <View style={styles.selectedKelasInfo}>
            <Icon
              name="check-circle"
              type="font-awesome"
              size={14}
              color="#059669"
            />
            <Text style={styles.selectedKelasText}>
              Terpilih:{' '}
              {kelasList.find(k => k.id === selectedKelasId)?.namaKelas}
            </Text>
          </View>
        )}
      </View>

      {/* Jika kelas dipilih, tampilkan pengajar */}
      {selectedKelasId && (
        <>
          {/* LIST PENGAJAR DI KELAS CARD */}
          <View style={[styles.mainCard, styles.pengajarListCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Icon
                  name="users"
                  type="font-awesome"
                  size={16}
                  color="#059669"
                  style={styles.cardTitleIcon}
                />
                <Text style={styles.cardTitle}>Pengajar di Kelas</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                {pengajarKelas.length} pengajar ditugaskan
              </Text>
            </View>

            {loadingPengajarKelas ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#2563eb" size="small" />
                <Text style={styles.loadingText}>Memuat data pengajar...</Text>
              </View>
            ) : pengajarKelas.length > 0 ? (
              <View style={styles.pengajarList}>
                {pengajarKelas.map(p => (
                  <View key={p.id} style={styles.pengajarItem}>
                    {/* Avatar */}
                    {p.profile?.fotoUrl ? (
                      <Image
                        source={{ uri: `${API}${p.profile.fotoUrl}` }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatarFallback,
                          { backgroundColor: `${getRandomColor(p.id)}15` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarText,
                            { color: getRandomColor(p.id) },
                          ]}
                        >
                          {/* Pakai nama lengkap jika ada, fallback ke name */}
                          {(p.profile?.namaLengkap || p.name)
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>
                    )}

                    {/* Info Pengajar */}
                    <View style={styles.pengajarInfo}>
                      <Text style={styles.pengajarNama} numberOfLines={1}>
                        {p.profile?.namaLengkap || p.name}
                      </Text>
                      <Text style={styles.pengajarEmail} numberOfLines={1}>
                        {p.email}
                      </Text>
                    </View>

                    {/* Tombol Hapus */}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemovePengajar(p.id)}
                      activeOpacity={0.85}
                    >
                      <Icon
                        name="trash"
                        type="font-awesome"
                        size={14}
                        color="#ef4444"
                      />
                      <Text style={styles.removeText}>Hapus</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon
                  name="user-slash"
                  type="font-awesome-5"
                  size={24}
                  color="#d1d5db"
                />
                <Text style={styles.emptyText}>
                  Belum ada pengajar di kelas ini
                </Text>
              </View>
            )}
          </View>

          {/* LIST PENGAJAR TERSEDIA CARD */}
          <View style={[styles.mainCard, styles.availablePengajarCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Icon
                  name="user-plus"
                  type="font-awesome"
                  size={16}
                  color="#f59e0b"
                  style={styles.cardTitleIcon}
                />
                <Text style={styles.cardTitle}>Tambahkan Pengajar</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                Pilih pengajar yang tersedia untuk ditambahkan ke kelas
              </Text>
            </View>

            <View style={styles.availablePengajarList}>
              {allPengajar
                .filter(p => !pengajarKelas.some(pk => pk.id === p.id))
                .map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.availablePengajarItem}
                    onPress={() => handleAssignPengajar(p.id)}
                    disabled={loadingAssign}
                    activeOpacity={0.85}
                  >
                    <View style={styles.availablePengajarContent}>
                      <View style={styles.availablePengajarAvatar}>
                        <Text style={styles.availablePengajarAvatarText}>
                          {getInitials(p.name)}
                        </Text>
                      </View>
                      <View style={styles.availablePengajarInfo}>
                        <Text
                          style={styles.availablePengajarNama}
                          numberOfLines={1}
                        >
                          {p.name}
                        </Text>
                        <Text
                          style={styles.availablePengajarEmail}
                          numberOfLines={1}
                        >
                          {p.email}
                        </Text>
                      </View>
                    </View>
                    {loadingAssign ? (
                      <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                      <View style={styles.addButton}>
                        <Icon
                          name="plus-circle"
                          type="font-awesome"
                          size={14}
                          color="#2563eb"
                          style={styles.addButtonIcon}
                        />
                        <Text style={styles.addText}>Tambah</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
            </View>

            {allPengajar.filter(p => !pengajarKelas.some(pk => pk.id === p.id))
              .length === 0 && (
              <View style={styles.emptyContainer}>
                <Icon
                  name="check-circle"
                  type="font-awesome-5"
                  size={24}
                  color="#d1d5db"
                />
                <Text style={styles.emptyText}>
                  Semua pengajar sudah ditugaskan
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* SPACER UNTUK NAVIGATOR */}
      <View style={styles.spacer} />
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <ScrollView
        style={styles.scrollView}
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
    </SafeAreaView>
  );
};

/* ================== STYLE ================== */

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  scrollContent: {
    paddingBottom: 100, // Spacer untuk navigator
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },

  /* HEADER - SEKARANG DALAM SCROLLVIEW */
  header: {
    backgroundColor: '#1e3a8a',
    paddingTop: Platform.OS === 'android' ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },

  headerSubtitle: {
    color: '#c7d2fe',
    fontSize: 14,
    fontWeight: '500',
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 12,
    marginTop: 4,
  },

  /* MAIN CARD STYLES */
  mainCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  kelasCard: {
    marginTop: 0,
  },

  pengajarListCard: {
    marginTop: 0,
  },

  availablePengajarCard: {
    marginTop: 0,
  },

  /* CARD HEADER */
  cardHeader: {
    marginBottom: 20,
  },

  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  cardTitleIcon: {
    marginRight: 10,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
  },

  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },

  /* FORM STYLES */
  formGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },

  /* BUTTON STYLES */
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },

  disabled: {
    opacity: 0.7,
  },

  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonIcon: {
    marginRight: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  buttonLoadingText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },

  /* KELAS SELECTION STYLES */
  kelasScroll: {
    marginHorizontal: -4,
  },

  kelasScrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },

  kelasButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 12,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    minWidth: 100,
  },

  kelasButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  kelasButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  kelasButtonIcon: {
    marginRight: 8,
  },

  kelasButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },

  kelasButtonTextActive: {
    color: '#fff',
  },

  emptyKelas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },

  emptyKelasText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    marginLeft: 10,
  },

  selectedKelasInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },

  selectedKelasText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 10,
  },

  /* PENGAJAR LIST STYLES */
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginLeft: 12,
  },

  pengajarList: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },

  pengajarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  pengajarAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  pengajarAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },

  pengajarInfo: {
    flex: 1,
    marginRight: 12,
  },

  pengajarNama: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },

  pengajarEmail: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },

  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },

  removeText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '700',
    marginLeft: 6,
  },

  /* AVAILABLE PENGAJAR STYLES */
  availablePengajarList: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },

  availablePengajarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  availablePengajarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },

  availablePengajarAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  availablePengajarAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },

  availablePengajarInfo: {
    flex: 1,
  },

  availablePengajarNama: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },

  availablePengajarEmail: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },

  addButtonIcon: {
    marginRight: 6,
  },

  addText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '700',
  },

  /* EMPTY STATES */
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },

  /* SPACER UNTUK NAVIGATOR */
  spacer: {
    height: 100,
  },

  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
  },

  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
});

export default ManagePengajarScreen;
