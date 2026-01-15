import React, { useEffect, useState } from "react";
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
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Icon } from "react-native-elements";
import { API } from "../../services/api";

interface Santri {
  id: number;
  name: string;
}

interface Absensi {
  id: number;
  userId: number;
  tanggal: string;
  status: "hadir" | "izin" | "sakit" | "alpha";
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

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get<{ success: boolean; data: Kelas[] }>(
        `${API}/kelas`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setKelasList(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchKelas();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hadir': return 'check-circle';
      case 'izin': return 'user-clock';
      case 'sakit': return 'heartbeat';
      case 'alpha': return 'times-circle';
      default: return 'question-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir': return '#10b981';
      case 'izin': return '#f59e0b';
      case 'sakit': return '#3b82f6';
      case 'alpha': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'hadir': return 'Hadir';
      case 'izin': return 'Izin';
      case 'sakit': return 'Sakit';
      case 'alpha': return 'Alpha';
      default: return 'Tidak Hadir';
    }
  };

  const renderKelasItem = ({ item }: { item: Kelas }) => (
    <TouchableOpacity
      style={styles.kelasCard}
      onPress={() => setSelectedKelas(item)}
      activeOpacity={0.8}
    >
      <View style={styles.kelasIconContainer}>
        <Icon name="users" type="font-awesome" size={24} color="#3498db" />
      </View>
      <View style={styles.kelasContent}>
        <Text style={styles.kelasTitle}>{item.namaKelas}</Text>
        <View style={styles.kelasInfo}>
          <View style={styles.kelasInfoItem}>
            <Icon name="user" type="font-awesome" size={12} color="#64748b" />
            <Text style={styles.kelasInfoText}>
              {item.santri.length} Santri
            </Text>
          </View>
          <View style={styles.kelasInfoItem}>
            <Icon name="calendar" type="font-awesome" size={12} color="#64748b" />
            <Text style={styles.kelasInfoText}>
              {item.absensi.length} Absensi
            </Text>
          </View>
        </View>
      </View>
      <Icon name="chevron-right" type="font-awesome" size={16} color="#cbd5e1" />
    </TouchableOpacity>
  );

  const renderAbsensiItem = ({ item }: { item: Santri }) => {
    const absensiUser = selectedKelas?.absensi.filter(
      (a) => a.userId === item.id
    );

    return (
      <View style={styles.absensiCard}>
        <View style={styles.absensiHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
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
              keyExtractor={(a) => a.id.toString()}
              renderItem={({ item: absen }) => (
                <View style={styles.absensiRecord}>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(absen.status)}20` }]}>
                    <Icon 
                      name={getStatusIcon(absen.status)} 
                      type="font-awesome" 
                      size={14} 
                      color={getStatusColor(absen.status)} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(absen.status) }]}>
                      {getStatusText(absen.status)}
                    </Text>
                  </View>
                  <Text style={styles.absensiDate}>
                    {new Date(absen.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.noAbsensiContainer}>
              <Icon name="calendar-times" type="font-awesome" size={20} color="#cbd5e1" />
              <Text style={styles.noAbsensiText}>Belum ada catatan absensi</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const getAbsensiSummary = () => {
    if (!selectedKelas) return { hadir: 0, izin: 0, sakit: 0, alpha: 0 };
    
    const today = new Date().toDateString();
    const todayAbsensi = selectedKelas.absensi.filter(a => 
      new Date(a.tanggal).toDateString() === today
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Memuat data kelas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedKelas) {
    // Pilih kelas
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView 
          style={styles.container}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#3498db']}
              tintColor="#3498db"
            />
          }
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Daftar Kelas</Text>
              <Text style={styles.subtitle}>
                {kelasList.length} kelas tersedia
              </Text>
            </View>
          </View>

          {kelasList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="school" type="font-awesome" size={60} color="#e2e8f0" />
              <Text style={styles.emptyTitle}>Tidak ada kelas</Text>
              <Text style={styles.emptySubtitle}>
                Belum ada data kelas yang tersedia
              </Text>
            </View>
          ) : (
            <FlatList
              data={kelasList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderKelasItem}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Tampilan absensi per kelas yang dipilih
  const absensiSummary = getAbsensiSummary();
  const totalAbsensiToday = absensiSummary.hadir + absensiSummary.izin + absensiSummary.sakit + absensiSummary.alpha;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.absensiHeaderr}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedKelas(null)}
          >
            <Icon name="arrow-left" type="font-awesome" size={20} color="#64748b" />
            <Text style={styles.backText}>Kembali</Text>
          </TouchableOpacity>
          
          <View style={styles.kelasTitleContainer}>
            <Text style={styles.absensiTitle}>{selectedKelas.namaKelas}</Text>
            <Text style={styles.absensiSubtitle}>
              {selectedKelas.santri.length} Santri • {totalAbsensiToday} Absensi Hari Ini
            </Text>
          </View>
        </View>

        {/* Absensi Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Rekap Hari Ini</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryBadge, { backgroundColor: '#10b98120' }]}>
                <Text style={[styles.summaryNumber, { color: '#10b981' }]}>
                  {absensiSummary.hadir}
                </Text>
              </View>
              <Text style={styles.summaryLabel}>Hadir</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <View style={[styles.summaryBadge, { backgroundColor: '#f59e0b20' }]}>
                <Text style={[styles.summaryNumber, { color: '#f59e0b' }]}>
                  {absensiSummary.izin}
                </Text>
              </View>
              <Text style={styles.summaryLabel}>Izin</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <View style={[styles.summaryBadge, { backgroundColor: '#3b82f620' }]}>
                <Text style={[styles.summaryNumber, { color: '#3b82f6' }]}>
                  {absensiSummary.sakit}
                </Text>
              </View>
              <Text style={styles.summaryLabel}>Sakit</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <View style={[styles.summaryBadge, { backgroundColor: '#ef444420' }]}>
                <Text style={[styles.summaryNumber, { color: '#ef4444' }]}>
                  {absensiSummary.alpha}
                </Text>
              </View>
              <Text style={styles.summaryLabel}>Alpha</Text>
            </View>
          </View>
        </View>

        {/* List Absensi */}
        {selectedKelas.santri.length > 0 ? (
          <FlatList
            data={selectedKelas.santri}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderAbsensiItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.absensiList}
            ListHeaderComponent={
              <Text style={styles.listTitle}>Daftar Santri</Text>
            }
            ListEmptyComponent={
              <View style={styles.emptyAbsensiContainer}>
                <Icon name="users" type="font-awesome" size={50} color="#e2e8f0" />
                <Text style={styles.emptyAbsensiText}>Tidak ada santri di kelas ini</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyAbsensiContainer}>
            <Icon name="users" type="font-awesome" size={60} color="#e2e8f0" />
            <Text style={styles.emptyAbsensiTitle}>Tidak ada santri</Text>
            <Text style={styles.emptyAbsensiSubtitle}>
              Belum ada santri yang terdaftar di kelas ini
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Kelas List
  kelasCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  kelasIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#ebf5fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  kelasContent: {
    flex: 1,
  },
  kelasTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  kelasInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kelasInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  kelasInfoText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  // Empty States
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#cbd5e1',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Absensi Header
  absensiHeader: {
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    fontWeight: '500',
  },
  kelasTitleContainer: {
    paddingLeft: 4,
  },
  absensiTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  absensiSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  // Summary Container
  summaryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  // Absensi List
  absensiList: {
    paddingBottom: 20,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  absensiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  absensiHeaderr: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  santriInfo: {
    flex: 1,
  },
  santriName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  santriId: {
    fontSize: 12,
    color: '#64748b',
  },
  absensiContent: {
    paddingTop: 4,
  },
  absensiRecord: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  absensiDate: {
    fontSize: 12,
    color: '#64748b',
  },
  noAbsensiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  noAbsensiText: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  emptyAbsensiContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyAbsensiText: {
    fontSize: 16,
    color: '#cbd5e1',
    marginTop: 16,
  },
  emptyAbsensiTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#cbd5e1',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyAbsensiSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default KelasScreen;