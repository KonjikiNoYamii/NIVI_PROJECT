import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  AlertButton,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { santriService } from '../../services/santriService';
import { Santri, SantriStatistics } from '../../types/santri';

type AdminStackParamList = {
  SantriList: undefined;
  SantriDetail: { santriId: string };
  AddSantri: undefined;
  EditSantri: { santriId: string };
};

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const SantriListScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [filteredSantri, setFilteredSantri] = useState<Santri[]>([]);
  const [stats, setStats] = useState<SantriStatistics>({
    total: 0,
    aktif: 0,
    lakiLaki: 0,
    perempuan: 0,
    perKelas: {},
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [data, statistics] = await Promise.all([
        santriService.getAll(searchText, filterKelas, filterStatus),
        santriService.getStatistics(),
      ]);

      setSantriList(data);
      setFilteredSantri(data);
      setStats(statistics);
    } catch {
      Alert.alert('Error', 'Gagal memuat data santri');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText, filterKelas, filterStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let filtered = santriList;

    if (searchText) {
      filtered = filtered.filter(
        s =>
          s.nama.toLowerCase().includes(searchText.toLowerCase()) ||
          s.nis.includes(searchText)
      );
    }

    if (filterKelas) {
      filtered = filtered.filter(s => s.kelas === filterKelas);
    }

    if (filterStatus) {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    setFilteredSantri(filtered);
  }, [searchText, filterKelas, filterStatus, santriList]);

  const handleDelete = (id: string, nama: string) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus santri ${nama}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await santriService.delete(id);
              Alert.alert('Berhasil', 'Santri berhasil dihapus');
              loadData();
            } catch {
              Alert.alert('Error', 'Gagal menghapus santri');
            }
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    try {
      const result = await santriService.exportToExcel();
      Alert.alert('Berhasil', result);
    } catch {
      Alert.alert('Error', 'Gagal mengexport data');
    }
  };

  const showKelasFilter = () => {
    const kelasOptions = [
      'Kelas 1','Kelas 2','Kelas 3','Kelas 4','Kelas 5','Kelas 6',
      'Kelas 7','Kelas 8','Kelas 9','Kelas 10','Kelas 11','Kelas 12',
    ];

    const buttons: AlertButton[] = kelasOptions.map(kelas => ({
      text: kelas,
      onPress: () => setFilterKelas(kelas),
    }));

    buttons.push(
      { text: 'Semua', onPress: () => setFilterKelas('') },
      { text: 'Batal', style: 'cancel' }
    );

    Alert.alert('Filter Kelas', 'Pilih kelas:', buttons);
  };

  const showStatusFilter = () => {
    const buttons: AlertButton[] = [
      { text: 'Aktif', onPress: () => setFilterStatus('Aktif') },
      { text: 'Non-Aktif', onPress: () => setFilterStatus('Non-Aktif') },
      { text: 'Lulus', onPress: () => setFilterStatus('Lulus') },
      { text: 'Semua', onPress: () => setFilterStatus('') },
      { text: 'Batal', style: 'cancel' },
    ];

    Alert.alert('Filter Status', 'Pilih status:', buttons);
  };

  const renderItem = ({ item }: { item: Santri }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('SantriDetail', { santriId: item.id })
      }
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.avatar,
            item.jenisKelamin === 'L'
              ? styles.avatarMale
              : styles.avatarFemale,
          ]}
        >
          <Icon
            name={item.jenisKelamin === 'L' ? 'gender-male' : 'gender-female'}
            size={24}
            color="#fff"
          />
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.nama}</Text>
          <Text style={styles.cardSubtitle}>NIS: {item.nis}</Text>

          <View style={styles.cardDetails}>
            <Text style={styles.detailText}>Kelas: {item.kelas}</Text>
            <View
              style={[
                styles.statusBadge,
                item.status === 'Aktif'
                  ? styles.statusActive
                  : item.status === 'Lulus'
                  ? styles.statusGraduated
                  : styles.statusInactive,
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('EditSantri', { santriId: item.id })
          }
        >
          <Icon name="pencil" size={20} color="#3498db" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id, item.nama)}
        >
          <Icon name="delete" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Memuat data santri...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Data Santri</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Icon name="file-export" size={20} color="#fff" />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
      >
        <View style={styles.statCard}>
          <Icon name="account-group" size={24} color="#3498db" />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Santri</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="account-check" size={24} color="#2ecc71" />
          <Text style={styles.statNumber}>{stats.aktif}</Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="gender-male" size={24} color="#3498db" />
          <Text style={styles.statNumber}>{stats.lakiLaki}</Text>
          <Text style={styles.statLabel}>Laki-laki</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="gender-female" size={24} color="#e84393" />
          <Text style={styles.statNumber}>{stats.perempuan}</Text>
          <Text style={styles.statLabel}>Perempuan</Text>
        </View>
      </ScrollView>

      <View style={styles.filterContainer}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#7f8c8d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau NIS..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterKelas && styles.filterButtonActive,
            ]}
            onPress={showKelasFilter}
          >
            <Icon
              name="school"
              size={16}
              color={filterKelas ? '#fff' : '#3498db'}
            />
            <Text
              style={[
                styles.filterText,
                filterKelas && styles.filterTextActive,
              ]}
            >
              {filterKelas || 'Kelas'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus && styles.filterButtonActive,
            ]}
            onPress={showStatusFilter}
          >
            <Icon
              name="filter-variant"
              size={16}
              color={filterStatus ? '#fff' : '#3498db'}
            />
            <Text
              style={[
                styles.filterText,
                filterStatus && styles.filterTextActive,
              ]}
            >
              {filterStatus || 'Status'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredSantri}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
          />
        }
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddSantri')}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default SantriListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#7f8c8d' },

  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pageTitle: { fontSize: 24, fontWeight: 'bold' },
  exportButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    padding: 8,
    borderRadius: 8,
  },
  exportText: { color: '#fff', marginLeft: 5 },

  statsContainer: { backgroundColor: '#fff', paddingVertical: 15 },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
  },

  statNumber: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 12 },

  filterContainer: { backgroundColor: '#fff', padding: 15 },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f2f6',
    borderRadius: 10,
    padding: 10,
  },
  searchInput: { flex: 1, marginLeft: 10 },

  filterRow: { flexDirection: 'row', marginTop: 10 },
  filterButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
    marginHorizontal: 5,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  filterButtonActive: { backgroundColor: '#3498db' },
  filterText: { marginLeft: 5, color: '#3498db' },
  filterTextActive: { color: '#fff' },

  listContainer: { padding: 15, paddingBottom: 80 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row' },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarMale: { backgroundColor: '#3498db' },
  avatarFemale: { backgroundColor: '#e84393' },

  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { color: '#7f8c8d' },

  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  detailText: { fontSize: 13 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10 },
  statusActive: { backgroundColor: '#d5f4e6' },
  statusInactive: { backgroundColor: '#ffeaea' },
  statusGraduated: { backgroundColor: '#e8f4fc' },
  statusText: { fontSize: 12 },

  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: { marginLeft: 10 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
