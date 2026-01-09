import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { dashboardService } from '../../services/dashboard';

interface DashboardData {
  totalSantri: number;
  totalKelas: number;
  absensi: {
    hadir: number;
    izin: number;
    sakit: number;
    alpha: number;
  };
  tugasAktif: number;
  submissionMasuk: number;
  izinPending: number;
}

const DashboardPengajar = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      console.log('📊 LOAD DASHBOARD');

      const response = await dashboardService.getPengajarDashboard();
      console.log('✅ DASHBOARD DATA:', response.data);

      setData(response.data);
    } catch (err) {
      console.log('❌ DASHBOARD ERROR:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Memuat dashboard...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Gagal memuat dashboard</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Dashboard Pengajar</Text>

      <View style={styles.card}>
        <Text>Total Kelas</Text>
        <Text style={styles.value}>{data.totalKelas}</Text>
      </View>

      <View style={styles.card}>
        <Text>Total Santri</Text>
        <Text style={styles.value}>{data.totalSantri}</Text>
      </View>

      <View style={styles.card}>
        <Text>Absensi Hari Ini</Text>
        <Text>Hadir: {data.absensi.hadir}</Text>
        <Text>Izin: {data.absensi.izin}</Text>
        <Text>Sakit: {data.absensi.sakit}</Text>
        <Text>Alpha: {data.absensi.alpha}</Text>
      </View>

      <View style={styles.card}>
        <Text>Tugas Aktif</Text>
        <Text style={styles.value}>{data.tugasAktif}</Text>
      </View>

      <View style={styles.card}>
        <Text>Submission Masuk</Text>
        <Text style={styles.value}>{data.submissionMasuk}</Text>
      </View>

      <View style={styles.card}>
        <Text>Izin Pending</Text>
        <Text style={styles.value}>{data.izinPending}</Text>
      </View>
    </ScrollView>
  );
};

export default DashboardPengajar;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
