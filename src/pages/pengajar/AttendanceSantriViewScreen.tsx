import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Image,
  Modal,
  StatusBar,
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from 'react-native-elements';
import { API } from '../../services/api';
import { socket } from '../../services/socket';

interface Santri {
  id: number;
  name: string;
  profile?: {
    fotoUrl?: string | null;
  } | null;
}

interface Absensi {
  id: number;
  userId: number;
  tanggal: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
}

interface Kelas {
  id: number;
  namaKelas: string;
  santri: Santri[];
  absensi: Absensi[];
}

const KelasScreen: React.FC = () => {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedAbsensi, setSelectedAbsensi] = useState<Absensi | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'hadir' | 'izin' | 'sakit' | 'alpha'>('hadir');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  const sortedAbsensi = useMemo(() => {
  if (!Array.isArray(selectedKelas?.absensi)) return []; // <- pastikan benar-benar array
  return [...selectedKelas.absensi].sort((a, b) => {
    const timeA = new Date(a.tanggal).getTime();
    const timeB = new Date(b.tanggal).getTime();
    return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
  });
}, [selectedKelas?.absensi, sortOrder]);


  useEffect(() => {
    fetchKelas();
  }, []);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchKelas = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const res = await axios.get<{ success: boolean; data: Kelas[] }>(
        `${API}/kelas`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setKelasList(res.data.data);

        if (selectedKelas) {
          const updated = res.data.data.find(k => k.id === selectedKelas.id);
          if (updated) {
            setSelectedKelas(updated);
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    if (!kelasList.length) return;

    const kelasIds = kelasList.map(k => k.id);
    socket.emit('join-kelas', kelasIds);
  }, [kelasList]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchKelas();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hadir':
        return 'check-circle';
      case 'izin':
        return 'user-clock';
      case 'sakit':
        return 'heartbeat';
      case 'alpha':
        return 'times-circle';
      default:
        return 'question-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir':
        return '#059669';
      case 'izin':
        return '#f59e0b';
      case 'sakit':
        return '#2563eb';
      case 'alpha':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'hadir':
        return 'Hadir';
      case 'izin':
        return 'Izin';
      case 'sakit':
        return 'Sakit';
      case 'alpha':
        return 'Alpha';
      default:
        return 'Tidak Hadir';
    }
  };

  const getRandomColor = (id: number) => {
    const colors = ['#2563eb', '#7c3aed', '#059669', '#f59e0b', '#dc2626'];
    return colors[id % colors.length];
  };

  const renderKelasItem = ({ item }: { item: Kelas }) => (
    <TouchableOpacity
      style={styles.kelasCard}
      onPress={() => setSelectedKelas(item)}
      activeOpacity={0.85}
    >
      <View style={[styles.kelasIconContainer, { backgroundColor: `${getRandomColor(item.id)}15` }]}>
        <Icon
          name="users"
          type="font-awesome"
          size={22}
          color={getRandomColor(item.id)}
        />
      </View>
      <View style={styles.kelasContent}>
        <Text style={styles.kelasTitle}>{item.namaKelas}</Text>
        <View style={styles.kelasInfo}>
          <View style={styles.kelasInfoItem}>
            <Icon
              name="user-graduate"
              type="font-awesome"
              size={12}
              color="#6b7280"
            />
            <Text style={styles.kelasInfoText}>
              {item.santri.length} Santri
            </Text>
          </View>
          <View style={styles.kelasInfoItem}>
            <Icon
              name="calendar-check"
              type="font-awesome"
              size={12}
              color="#6b7280"
            />
            <Text style={styles.kelasInfoText}>
              {item.absensi.length} Absensi
            </Text>
          </View>
        </View>
      </View>
      <Icon
        name="chevron-right"
        type="font-awesome"
        size={14}
        color="#9ca3af"
      />
    </TouchableOpacity>
  );

  const renderAbsensiItem = ({ item }: { item: Santri }) => {
    const absensiUser = sortedAbsensi.filter(a => a.userId === item.id);

    return (
      <View style={styles.absensiCard}>
        <View style={styles.absensiHeader}>
          <View style={styles.avatarContainer}>
            {item.profile?.fotoUrl ? (
              <Image
                source={{ uri: `${API}${item.profile.fotoUrl}` }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: `${getRandomColor(item.id)}15` }]}>
                <Text style={[styles.avatarText, { color: getRandomColor(item.id) }]}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.santriInfo}>
            <Text style={styles.santriName}>{item.name}</Text>
            <Text style={styles.santriId}>ID: {item.id}</Text>
          </View>
        </View>

        <View style={styles.absensiContent}>
          {absensiUser && absensiUser.length > 0 ? (
            <FlatList
              data={absensiUser}
              scrollEnabled={false}
              keyExtractor={a => a.id.toString()}
              renderItem={({ item: absen }) => (
                <View style={styles.absensiRecord}>
                  <View style={styles.absensiRecordLeft}>
                    <View
                      style={[styles.statusBadge, { backgroundColor: `${getStatusColor(absen.status)}15` }]}
                    >
                      <Icon
                        name={getStatusIcon(absen.status)}
                        type="font-awesome"
                        size={14}
                        color={getStatusColor(absen.status)}
                      />
                      <Text
                        style={[styles.statusText, { color: getStatusColor(absen.status) }]}
                      >
                        {getStatusText(absen.status)}
                      </Text>
                    </View>
                    <Text style={styles.absensiDate}>
                      {new Date(absen.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setSelectedAbsensi(absen);
                      setSelectedStatus(absen.status);
                      setEditModal(true);
                    }}
                    activeOpacity={0.85}
                  >
                    <Icon
                      name="edit"
                      type="font-awesome"
                      size={14}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <View style={styles.noAbsensiContainer}>
              <Icon
                name="calendar-times"
                type="font-awesome"
                size={16}
                color="#d1d5db"
              />
              <Text style={styles.noAbsensiText}>
                Belum ada catatan absensi
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const getAbsensiSummary = () => {
    if (!selectedKelas) return { hadir: 0, izin: 0, sakit: 0, alpha: 0 };

    const today = new Date().toDateString();
    const todayAbsensi = selectedKelas.absensi.filter(
      a => new Date(a.tanggal).toDateString() === today,
    );

    return {
      hadir: todayAbsensi.filter(a => a.status === 'hadir').length,
      izin: todayAbsensi.filter(a => a.status === 'izin').length,
      sakit: todayAbsensi.filter(a => a.status === 'sakit').length,
      alpha: todayAbsensi.filter(a => a.status === 'alpha').length,
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Memuat data kelas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedKelas) {
    // Pilih kelas - HEADER SAMA PERSIS DENGAN DASHBOARD
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER - SAMA DENGAN DASHBOARD PENGASAR */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Daftar Kelas</Text>
            <Text style={styles.headerSubtitle}>
              {kelasList.length} kelas tersedia
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              activeOpacity={0.85}
            >
              <Icon
                name="refresh"
                type="font-awesome"
                size={16}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {kelasList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon
                name="school"
                type="font-awesome"
                size={56}
                color="#e5e7eb"
              />
              <Text style={styles.emptyText}>Tidak ada kelas</Text>
              <Text style={styles.emptySubtitle}>
                Belum ada data kelas yang tersedia
              </Text>
            </View>
          ) : (
            <View style={styles.kelasListContainer}>
              {kelasList.map(item => renderKelasItem({ item }))}
            </View>
          )}

          {/* SPACER UNTUK NAVIGATOR */}
          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const absensiSummary = getAbsensiSummary();
  const totalAbsensiToday =
    absensiSummary.hadir +
    absensiSummary.izin +
    absensiSummary.sakit +
    absensiSummary.alpha;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
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
        {/* HEADER - SAMA DENGAN DASHBOARD PENGASAR */}
        <View style={styles.header}>
          <View style={styles.headerBackContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedKelas(null)}
              activeOpacity={0.85}
            >
              <View style={styles.backButtonContent}>
                <Icon
                  name="arrow-left"
                  type="font-awesome"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.backText}>Kembali</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              activeOpacity={0.85}
            >
              <Icon
                name="refresh"
                type="font-awesome"
                size={16}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.absensiTitle}>{selectedKelas.namaKelas}</Text>
          <View style={styles.absensiSubtitleContainer}>
            <View style={styles.subtitleItem}>
              <Icon
                name="user"
                type="font-awesome"
                size={13}
                color="#c7d2fe"
              />
              <Text style={styles.absensiSubtitle}>
                {selectedKelas.santri.length} Santri
              </Text>
            </View>
            <View style={styles.subtitleItem}>
              <Icon
                name="calendar"
                type="font-awesome"
                size={13}
                color="#c7d2fe"
              />
              <Text style={styles.absensiSubtitle}>
                {totalAbsensiToday} Absensi Hari Ini
              </Text>
            </View>
          </View>
        </View>

        {/* Summary Section */}
        <View style={styles.card}>
          <Text style={styles.label}>Rekap Absensi Hari Ini</Text>

          <View style={styles.summaryGrid}>
            {[
              { key: 'hadir', label: 'Hadir', color: '#059669' },
              { key: 'izin', label: 'Izin', color: '#f59e0b' },
              { key: 'sakit', label: 'Sakit', color: '#2563eb' },
              { key: 'alpha', label: 'Alpha', color: '#dc2626' },
            ].map(({ key, label, color }) => (
              <View key={key} style={styles.summaryItem}>
                <View style={[styles.summaryBadge, { backgroundColor: `${color}15` }]}>
                  <Text style={[styles.summaryNumber, { color }]}>
                    {absensiSummary[key as keyof typeof absensiSummary]}
                  </Text>
                </View>
                <Text style={styles.summaryLabel}>{label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setSortOrder(sortOrder === 'latest' ? 'oldest' : 'latest')}
            style={styles.sortButton}
            activeOpacity={0.85}
          >
            <Icon
              name={sortOrder === 'latest' ? 'sort-amount-down' : 'sort-amount-up'}
              type="font-awesome"
              size={14}
              color="#2563eb"
            />
            <Text style={styles.sortButtonText}>
              Urutkan: {sortOrder === 'latest' ? 'Terbaru' : 'Terlama'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Santri List */}
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Daftar Santri</Text>

          {selectedKelas.santri.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada santri di kelas ini</Text>
          ) : (
            <>
              <Text style={styles.listSubtitle}>
                Total: {selectedKelas.santri.length} santri
              </Text>
              <FlatList
                data={selectedKelas.santri}
                keyExtractor={item => item.id.toString()}
                renderItem={renderAbsensiItem}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={styles.absensiList}
              />
            </>
          )}
        </View>

        {/* SPACER UNTUK NAVIGATOR */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Modal Edit Absensi */}
      <Modal
        visible={editModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Icon
                  name="edit"
                  type="font-awesome"
                  size={18}
                  color="#2563eb"
                  style={styles.modalTitleIcon}
                />
                <Text style={styles.modalTitle}>Ubah Status Absensi</Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditModal(false)}
                style={styles.modalCloseButton}
                activeOpacity={0.85}
              >
                <Icon
                  name="times"
                  type="font-awesome"
                  size={16}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Pilih status baru untuk absensi ini
            </Text>

            <View style={styles.statusOptionsContainer}>
              {['hadir', 'izin', 'sakit', 'alpha'].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusOption,
                    selectedStatus === s && {
                      backgroundColor: `${getStatusColor(s)}15`,
                      borderColor: getStatusColor(s),
                    },
                  ]}
                  onPress={() => setSelectedStatus(s as any)}
                  activeOpacity={0.85}
                >
                  <Icon
                    name={getStatusIcon(s)}
                    type="font-awesome"
                    size={16}
                    color={selectedStatus === s ? getStatusColor(s) : '#6b7280'}
                    style={styles.statusOptionIcon}
                  />
                  <Text style={[
                    styles.statusOptionText,
                    selectedStatus === s && { color: getStatusColor(s), fontWeight: '700' }
                  ]}>
                    {s.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabled]}
                onPress={async () => {
                  const token = await AsyncStorage.getItem('token');

                  await axios.put(
                    `${API}/absensi/${selectedAbsensi?.id}`,
                    { status: selectedStatus },
                    { headers: { Authorization: `Bearer ${token}` } },
                  );

                  setEditModal(false);
                  fetchKelas();
                }}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon
                      name="check"
                      type="font-awesome"
                      size={14}
                      color="#FFFFFF"
                      style={styles.saveButtonIcon}
                    />
                    <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9"
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Loading State
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  // HEADER - SAMA DENGAN DASHBOARD PENGASAR
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "android" ? 48 : 64, // SAMA DENGAN DASHBOARD
    paddingBottom: 32, // SAMA DENGAN DASHBOARD
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
  },
  headerBackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshButton: {
    position: 'absolute',
    top: Platform.OS === "android" ? 58 : 74,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  backButton: {
    marginTop: Platform.OS === "android" ? 8 : 12,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    color: '#fff',
    marginLeft: 10,
    fontWeight: '600',
  },
  
  // Header untuk detail kelas
  absensiTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  absensiSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 20,
  },
  subtitleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  absensiSubtitle: {
    fontSize: 15,
    color: '#c7d2fe',
    marginLeft: 8,
    fontWeight: '500',
  },

  // Kelas List
  kelasListContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    paddingBottom: 16,
  },
  kelasCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kelasIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  kelasContent: {
    flex: 1,
  },
  kelasTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2933',
    marginBottom: 8,
  },
  kelasInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kelasInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  kelasInfoText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '500',
  },

  // Empty States
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
    paddingHorizontal: 40,
  },

  // Card (Summary) - DITEMPAKKAN DI BAWAH HEADER
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignSelf: 'flex-start',
  },
  sortButtonText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 8,
  },

  // Santri List Card
  listCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111827",
  },
  listSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
    fontWeight: "500",
  },

  // Absensi List
  absensiList: {
    paddingBottom: 40,
  },
  absensiCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  absensiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  santriInfo: {
    flex: 1,
  },
  santriName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2933',
    marginBottom: 4,
  },
  santriId: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  absensiContent: {
    paddingTop: 4,
  },
  absensiRecord: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  absensiRecordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 100,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  absensiDate: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 16,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noAbsensiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  noAbsensiText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 10,
    fontWeight: '500',
    fontStyle: 'italic',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitleIcon: {
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
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
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    fontWeight: '500',
    lineHeight: 20,
  },
  statusOptionsContainer: {
    marginBottom: 24,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  statusOptionIcon: {
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.7,
  },

  // DITAMBAHKAN: Spacer untuk navigator
  spacer: {
    height: 100,
  },
});

export default KelasScreen;