import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { dashboardService } from '../../services/dashboard';

const { width } = Dimensions.get('window');

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
  },[]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const getAbsensiStats = () => {
    if (!data) return { total: 0, presentPercentage: 0 };
    const total = data.absensi.hadir + data.absensi.izin + data.absensi.sakit + data.absensi.alpha;
    const presentPercentage = total > 0 ? (data.absensi.hadir / total) * 100 : 0;
    return { total, presentPercentage };
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

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Gagal memuat data</Text>
          <TouchableOpacity style={styles.button} onPress={loadDashboard}>
            <Text style={styles.buttonText}>MUAT ULANG</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const absensiStats = getAbsensiStats();

  return (
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
    >
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Pengajar</Text>
        <Text style={styles.headerSubtitle}>
          Ringkasan aktivitas terbaru
        </Text>
      </View>

      {/* STATS CARDS */}
      <View style={styles.statsContainer}>
        {/* Row 1 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#dbeafe' }]}>
              <Icon name="users" type="font-awesome" size={20} color="#1e40af" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{data.totalSantri}</Text>
              <Text style={styles.statLabel}>Total Santri</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#dcfce7' }]}>
              <Icon name="chalkboard-teacher" type="font-awesome-5" size={20} color="#166534" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{data.totalKelas}</Text>
              <Text style={styles.statLabel}>Total Kelas</Text>
            </View>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#f0f9ff' }]}>
              <Icon name="tasks" type="font-awesome" size={18} color="#0369a1" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{data.tugasAktif}</Text>
              <Text style={styles.statLabel}>Tugas Aktif</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#fef3c7' }]}>
              <Icon name="inbox" type="font-awesome" size={18} color="#92400e" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{data.submissionMasuk}</Text>
              <Text style={styles.statLabel}>Pengumpulan</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ABSENSI SECTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Absensi Hari Ini</Text>
        
        <View style={styles.absensiHeader}>
          <Text style={styles.absensiTotalLabel}>Total Santri:</Text>
          <Text style={styles.absensiTotal}>{absensiStats.total}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(absensiStats.presentPercentage, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            <Text style={styles.progressPercent}>{absensiStats.presentPercentage.toFixed(1)}%</Text> Kehadiran
          </Text>
        </View>

        <View style={styles.absensiGrid}>
          <View style={styles.absensiItem}>
            <View style={[styles.absensiBadge, styles.hadirBadge]}>
              <Icon name="check-circle" type="font-awesome" size={14} color="#fff" />
            </View>
            <Text style={styles.absensiCount}>{data.absensi.hadir}</Text>
            <Text style={styles.absensiLabel}>Hadir</Text>
          </View>
          
          <View style={styles.absensiItem}>
            <View style={[styles.absensiBadge, styles.izinBadge]}>
              <Icon name="clock-o" type="font-awesome" size={14} color="#fff" />
            </View>
            <Text style={styles.absensiCount}>{data.absensi.izin}</Text>
            <Text style={styles.absensiLabel}>Izin</Text>
          </View>
          
          <View style={styles.absensiItem}>
            <View style={[styles.absensiBadge, styles.sakitBadge]}>
              <Icon name="heartbeat" type="font-awesome" size={12} color="#fff" />
            </View>
            <Text style={styles.absensiCount}>{data.absensi.sakit}</Text>
            <Text style={styles.absensiLabel}>Sakit</Text>
          </View>
          
          <View style={styles.absensiItem}>
            <View style={[styles.absensiBadge, styles.alphaBadge]}>
              <Icon name="times-circle" type="font-awesome" size={12} color="#fff" />
            </View>
            <Text style={styles.absensiCount}>{data.absensi.alpha}</Text>
            <Text style={styles.absensiLabel}>Alpha</Text>
          </View>
        </View>
      </View>

      {/* IZIN PENDING SECTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Perlu Tindakan</Text>
        
        <TouchableOpacity style={styles.actionCard}>
          <View style={[styles.actionIconContainer, { backgroundColor: '#fef3c7' }]}>
            <Icon name="clock" type="font-awesome" size={20} color="#92400e" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Izin Menunggu Konfirmasi</Text>
            <Text style={styles.actionSubtitle}>Tinjau permintaan izin dari santri</Text>
          </View>
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{data.izinPending}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* SUMMARY SECTION */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Ringkasan</Text>
        
        <View style={styles.summaryContent}>
          <Text style={styles.summaryText}>
            {data.tugasAktif > 0 
              ? `Ada ${data.tugasAktif} tugas aktif dengan ${data.submissionMasuk} pengumpulan yang masuk.`
              : 'Tidak ada tugas aktif saat ini.'}
          </Text>
          <Text style={styles.summaryText}>
            {data.izinPending > 0
              ? `${data.izinPending} permintaan izin perlu dikonfirmasi.`
              : 'Tidak ada izin yang menunggu.'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "android" ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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

  statsContainer: {
    paddingHorizontal: 16,
    marginTop: -28,
    marginBottom: 16,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flex: 0.48,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  statContent: {
    flex: 1,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },

  absensiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  absensiTotalLabel: {
    fontSize: 14,
    color: "#374151",
    marginRight: 8,
  },

  absensiTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563eb",
  },

  progressContainer: {
    marginBottom: 24,
  },

  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 4,
  },

  progressText: {
    fontSize: 13,
    color: "#6b7280",
  },

  progressPercent: {
    fontWeight: "700",
    color: "#10b981",
  },

  absensiGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  absensiItem: {
    alignItems: "center",
    flex: 1,
  },

  absensiBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  hadirBadge: {
    backgroundColor: "#10b981",
  },

  izinBadge: {
    backgroundColor: "#f59e0b",
  },

  sakitBadge: {
    backgroundColor: "#3b82f6",
  },

  alphaBadge: {
    backgroundColor: "#ef4444",
  },

  absensiCount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },

  absensiLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
  },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },

  actionSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },

  actionBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  actionBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400e",
  },

  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },

  summaryContent: {},
  
  summaryText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },

  errorText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ef4444",
    marginBottom: 16,
  },

  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});

export default DashboardPengajar;