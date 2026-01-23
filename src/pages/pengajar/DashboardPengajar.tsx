import React from 'react';
import { SafeAreaView, ScrollView, RefreshControl, View, Text } from 'react-native';
import { useDashboardPengajar } from '../../hooks/useDashboardPengajar';
import styles from '../../styles/dashboard.pengajar';
import { StatCard } from '../../components/pengajar/dashboard/StatCard';
import { AbsensiSection } from '../../components/pengajar/dashboard/AbsensiSection';
import { ActionCard } from '../../components/pengajar/dashboard/ActionCard';
import { SummarySection } from '../../components/pengajar/dashboard/SummarySection';


const DashboardPengajar = () => {
  const { data, loading, refreshing, onRefresh } = useDashboardPengajar();

  if (loading || !data) return null;

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

    {/* Stats Row 1 */}
    <View style={styles.statsRow}>
      <StatCard
        icon="users"
        type="font-awesome"
        value={data.totalSantri}
        label="Total Santri"
        bg="#e3f2fd"
        color="#1976d2"
      />

      <StatCard
        icon="chalkboard-teacher"
        type="font-awesome-5"
        value={data.totalKelas}
        label="Total Kelas"
        bg="#e8f5e9"
        color="#388e3c"
      />
    </View>

    {/* Stats Row 2 */}
    <View style={styles.statsRow}>
      <StatCard
        icon="tasks"
        value={data.tugasAktif}
        label="Tugas Aktif"
        bg="#f3e5f5"
        color="#7b1fa2"
      />

      <StatCard
        icon="inbox"
        value={data.submissionMasuk}
        label="Pengumpulan"
        bg="#fff3e0"
        color="#f57c00"
      />
    </View>

    {/* Absensi */}
    <AbsensiSection data={data} />

    {/* Action */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Perlu Tindakan</Text>
      <ActionCard total={data.izinPending} />
    </View>

    {/* Summary */}
<SummarySection
  tugasAktif={data.tugasAktif}
  submissionMasuk={data.submissionMasuk}
  izinPending={data.izinPending}
/>

  </ScrollView>
</SafeAreaView>

  );
};

export default DashboardPengajar;
