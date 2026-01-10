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
  const interval = setInterval(() => {
    loadDashboard();
  }, 5000); 

  return () => clearInterval(interval);
}, []);


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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Memuat dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Icon name="exclamation-circle" type="font-awesome" size={48} color="#e74c3c" />
          </View>
          <Text style={styles.errorTitle}>Gagal memuat data</Text>
          <Text style={styles.errorSubtitle}>Periksa koneksi internet Anda</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
            <Icon name="refresh" type="font-awesome" size={16} color="#fff" />
            <Text style={styles.retryText}>Muat Ulang</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const absensiStats = getAbsensiStats();

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
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard Pengajar</Text>
            <Text style={styles.subtitle}>Ringkasan aktivitas terbaru</Text>
          </View>
        </View>

        {/* Stats Grid - Row 1 */}
        <View style={styles.statsRow}>
          {/* Santri Card */}
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#e3f2fd' }]}>
              <Icon name="users" type="font-awesome" size={20} color="#1976d2" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{data.totalSantri}</Text>
              <Text style={styles.statLabel}>Total Santri</Text>
            </View>
          </View>

          {/* Kelas Card */}
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#e8f5e9' }]}>
              <Icon name="chalkboard-teacher" type="font-awesome-5" size={20} color="#388e3c" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{data.totalKelas}</Text>
              <Text style={styles.statLabel}>Total Kelas</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid - Row 2 */}
        <View style={styles.statsRow}>
          {/* Tugas Card */}
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#f3e5f5' }]}>
              <Icon name="tasks" type="font-awesome" size={18} color="#7b1fa2" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{data.tugasAktif}</Text>
              <Text style={styles.statLabel}>Tugas Aktif</Text>
            </View>
          </View>

          {/* Submission Card */}
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#fff3e0' }]}>
              <Icon name="inbox" type="font-awesome" size={18} color="#f57c00" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{data.submissionMasuk}</Text>
              <Text style={styles.statLabel}>Pengumpulan</Text>
            </View>
          </View>
        </View>

        {/* Absensi Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Absensi Hari Ini</Text>
            <View style={styles.absensiSummary}>
              <Text style={styles.absensiTotalLabel}>Total:</Text>
              <Text style={styles.absensiTotal}>{absensiStats.total}</Text>
            </View>
          </View>
          
          <View style={styles.absensiCard}>
            <View style={styles.absensiProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(absensiStats.presentPercentage, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                Kehadiran: <Text style={styles.progressPercent}>{absensiStats.presentPercentage.toFixed(1)}%</Text>
              </Text>
            </View>
            
            <View style={styles.absensiGrid}>
              <View style={styles.absensiItem}>
                <View style={[styles.absensiBadge, styles.hadirBadge]}>
                  <Icon name="check-circle" type="font-awesome" size={14} color="#fff" />
                </View>
                <View style={styles.absensiItemContent}>
                  <Text style={styles.absensiCount}>{data.absensi.hadir}</Text>
                  <Text style={styles.absensiLabel}>Hadir</Text>
                </View>
              </View>
              
              <View style={styles.absensiItem}>
                <View style={[styles.absensiBadge, styles.izinBadge]}>
                  <Icon name="clock-o" type="font-awesome" size={20} color="#fff" />
                </View>
                <View style={styles.absensiItemContent}>
                  <Text style={styles.absensiCount}>{data.absensi.izin}</Text>
                  <Text style={styles.absensiLabel}>Izin</Text>
                </View>
              </View>
              
              <View style={styles.absensiItem}>
                <View style={[styles.absensiBadge, styles.sakitBadge]}>
                  <Icon name="heartbeat" type="font-awesome" size={12} color="#fff" />
                </View>
                <View style={styles.absensiItemContent}>
                  <Text style={styles.absensiCount}>{data.absensi.sakit}</Text>
                  <Text style={styles.absensiLabel}>Sakit</Text>
                </View>
              </View>
              
              <View style={styles.absensiItem}>
                <View style={[styles.absensiBadge, styles.alphaBadge]}>
                  <Icon name="times-circle" type="font-awesome" size={12} color="#fff" />
                </View>
                <View style={styles.absensiItemContent}>
                  <Text style={styles.absensiCount}>{data.absensi.alpha}</Text>
                  <Text style={styles.absensiLabel}>Alpha</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Izin Pending Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perlu Tindakan</Text>
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIconContainer}>
              <Icon name="clock" type="font-awesome" size={20} color="#f39c12" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Izin Menunggu Konfirmasi</Text>
              <Text style={styles.actionSubtitle}>Tinjau permintaan izin dari santri</Text>
            </View>
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>{data.izinPending}</Text>
            </View>
            <Icon name="chevron-right" type="font-awesome" size={16} color="#95a5a6" />
          </TouchableOpacity>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryHeader}>
            <Icon name="chart-line" type="font-awesome-5" size={20} color="#3498db" />
            <Text style={styles.summaryTitle}>Ringkasan</Text>
          </View>
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
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#f8fafc',
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
  // Stats Grid
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  // Absensi
  absensiSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  absensiTotalLabel: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 4,
  },
  absensiTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3498db',
  },
  absensiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  absensiProgress: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: '#64748b',
  },
  progressPercent: {
    fontWeight: '700',
    color: '#10b981',
  },
  absensiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  absensiItem: {
    alignItems: 'center',
    flex: 1,
  },
  absensiBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  hadirBadge: {
    backgroundColor: '#10b981',
  },
  izinBadge: {
    backgroundColor: '#f59e0b',
  },
  sakitBadge: {
    backgroundColor: '#3b82f6',
  },
  alphaBadge: {
    backgroundColor: '#ef4444',
  },
  absensiItemContent: {
    alignItems: 'center',
  },
  absensiCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  absensiLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  // Action Card
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fffbeb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  actionBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  // Summary Section
  summarySection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 10,
  },
  summaryContent: {
    paddingLeft: 2,
  },
  summaryText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 8,
  },
});

export default DashboardPengajar;