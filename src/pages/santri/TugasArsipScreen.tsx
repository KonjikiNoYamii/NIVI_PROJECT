import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';

interface Tugas {
  id: number;
  judul: string;
  deadline: string;
  archivedAt: string;
  isArchived: boolean;
  mataPelajaran: {
    nama: string;
  };
  submission?: {
    status: string;
    nilai?: {
      nilai: number;
    } | null;
  }[];
}

export default function TugasArsipScreen() {
  const [data, setData] = useState<Tugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchArsip = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const res = await axios.get(`${API}/tugas/santri/arsip`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(res.data.data);
    } catch (e) {
      console.log('Gagal ambil arsip', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchArsip();
      return () => {};
    }, []),
  );

  // Fungsi label status baru
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'belum_submit':
        return 'Belum Dikumpulkan';
      case 'pending':
        return 'Menunggu Penilaian';
      case 'reviewed':
        return 'Diterima';
      case 'rejected':
        return 'Ditolak';
      default:
        return 'Tidak Diketahui';
    }
  };

  // Fungsi warna status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'belum_submit':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      case 'reviewed':
        return '#10B981';
      case 'rejected':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  // Fungsi warna background status
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'belum_submit':
        return '#FEF2F2';
      case 'pending':
        return '#FFFBEB';
      case 'reviewed':
        return '#F0FDF4';
      case 'rejected':
        return '#FEF2F2';
      default:
        return '#F3F4F6';
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Arsip Tugas</Text>
          <Text style={styles.headerSubtitle}>
            {data.length} tugas diarsipkan
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.headerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {data.filter(item => item.submission?.[0]?.status === 'reviewed').length}
          </Text>
          <Text style={styles.statLabel}>Diterima</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {data.filter(item => item.submission?.[0]?.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {data.filter(item => !item.submission?.[0] || item.submission?.[0]?.status === 'belum_submit').length}
          </Text>
          <Text style={styles.statLabel}>Belum Dikumpulkan</Text>
        </View>
      </View>
    </View>
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listTitle}>Semua Arsip Tugas</Text>
      <Text style={styles.listSubtitle}>
        Tugas yang sudah diarsipkan akan disimpan di sini
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: Tugas }) => {
    const submission = item.submission?.[0];
    const status = submission?.status || 'belum_submit';
    const nilai = submission?.nilai?.nilai;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.subjectContainer}>
            <Ionicons name="book-outline" size={14} color="#2563EB" />
            <Text style={styles.subject}>{item.mataPelajaran.nama}</Text>
          </View>
          <View style={styles.archiveInfo}>
            <Ionicons name="archive-outline" size={12} color="#6B7280" />
            <Text style={styles.meta}>
              {new Date(item.archivedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.judul}
        </Text>

        {/* STATUS */}
        <View
          style={[
            styles.statusContainer,
            {
              backgroundColor: getStatusBgColor(status),
              borderColor: getStatusColor(status),
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(status) },
            ]}
          />
          <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
            {getStatusLabel(status)}
          </Text>
        </View>

        {/* NILAI */}
        {nilai !== undefined && (
          <View style={styles.nilaiContainer}>
            <View style={styles.nilaiHeader}>
              <Ionicons name="ribbon-outline" size={16} color="#059669" />
              <Text style={styles.nilaiLabel}>Nilai:</Text>
            </View>
            <Text style={styles.nilaiValue}>{nilai}</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.deadlineContainer}>
            <Ionicons name="time-outline" size={14} color="#DC2626" />
            <Text style={styles.deadlineLabel}>Deadline: </Text>
            <Text style={styles.deadlineValue}>
              {new Date(item.deadline).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Memuat arsip tugas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchArsip}
            colors={['#2563EB']}
            tintColor="#2563EB"
            title="Mengambil data..."
            titleColor="#2563EB"
          />
        }
        contentContainerStyle={
          data.length === 0
            ? styles.emptyListContainer
            : styles.listContainer
        }
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderListHeader()}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="archive-outline" size={72} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Arsip Tugas</Text>
            <Text style={styles.emptySubtitle}>
              Tugas yang sudah diarsipkan akan muncul di sini.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back-outline" size={18} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Kembali ke Tugas</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingTop: Platform.OS === 'android' ? 12 : 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    marginTop: 4,
    color: '#C7D2FE',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  headerStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#C7D2FE',
    fontWeight: '600',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  list: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  listContainer: {
    paddingTop: 0,
    paddingBottom: 32,
  },
  emptyListContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  subject: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  archiveInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 16,
    lineHeight: 22,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nilaiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  nilaiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nilaiLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 6,
  },
  nilaiValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  cardFooter: {
    borderTopWidth: 1.5,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  deadlineValue: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
    minHeight: 400,
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});