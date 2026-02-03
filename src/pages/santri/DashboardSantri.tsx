// DashboardSantri.tsx
import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { absensiService, Absensi } from '../../services/absensi';
import { absensiSettingService } from '../../services/absensiSetting';
import AbsensiCard from '../../components/santri/AbsensiCard';
import HistoryCard from '../../components/santri/HistoryCard';
import InfoCard from '../../components/santri/InfoCard';

const DashboardSantri = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [MAX_ABSEN, setMaxAbsen] = useState<number>(0);

  // Load maxAbsen dari backend
  const loadMaxAbsen = async () => {
    try {
      const max = await absensiSettingService.getMaxAbsen();
      if (max !== null) setMaxAbsen(max);
    } catch {
      Alert.alert('Error', 'Gagal mengambil setting absensi');
    }
  };

  const loadAbsensi = async () => {
    try {
      const data = await absensiService.getToday();
      setAbsensi(data);
    } catch {
      Alert.alert('Error', 'Gagal mengambil data absensi');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadMaxAbsen(), loadAbsensi()]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAbsen = async () => {
    try {
      setSubmitting(true);
      await absensiService.absen('hadir');
      await loadAbsensi();
      Alert.alert('Berhasil', 'Absensi berhasil dikirim');
    } catch (e: any) {
      Alert.alert(
        'Gagal',
        e.response?.data?.message || 'Terjadi kesalahan server',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeStatus = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Pagi';
    if (hour < 15) return 'Siang';
    if (hour < 18) return 'Sore';
    return 'Malam';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

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
        {/* HEADER YANG IKUT SCROLL */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard Santri</Text>
          <Text style={styles.headerSubtitle}>
            Selamat {getTimeStatus().toLowerCase()}!
          </Text>
        </View>

        {/* CONTENT */}
        <View style={styles.contentContainer}>
          {/* ABSENSI CARD */}
          <View style={styles.card}>
            <AbsensiCard
              absensi={absensi}
              submitting={submitting}
              handleAbsen={handleAbsen}
              MAX_ABSEN={MAX_ABSEN}
            />
          </View>

          {/* HISTORY CARD */}
          <View style={styles.listCard}>
            <HistoryCard absensi={absensi} />
          </View>

          {/* INFO CARD */}
          <View style={styles.listCard}>
            <InfoCard MAX_ABSEN={MAX_ABSEN} />
          </View>
        </View>

        {/* SPACER UNTUK NAVIGATOR */}
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

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
    paddingBottom: 100, // Padding bottom untuk navigator
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },

  /* HEADER BLOK BIRU */
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
    paddingTop: 20,
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  listCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  // DITAMBAHKAN: Spacer untuk navigator
  spacer: {
    height: 100,
  },
});

export default DashboardSantri;
