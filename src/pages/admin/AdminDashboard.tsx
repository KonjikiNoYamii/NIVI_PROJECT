// screens/admin/DashboardAdmin.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { Icon } from 'react-native-elements';
import { API } from "../../services/api";
import StatCard from "../../components/admin/Card";
import AttendanceStats from "../../components/admin/AttedanceChart";
import SectionCard from "../../components/admin/Section";
import ActivityList from "../../components/admin/ActivityList";



export default function DashboardAdmin() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${API}/panel/dashboard/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(res.data);
    } catch (err) {
      console.log("Gagal mengambil dashboard admin", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, []);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Memuat dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard Admin</Text>
            <Text style={styles.subtitle}>
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Santri"
            value={data?.totalSantri || 0}
            icon="user-o"
            color="#3498db"
          />
          <StatCard
            title="Total Pengajar"
            value={data?.totalPengajar || 0}
            icon="chalkboard-teacher"
            color="#2ecc71"
          />
          <StatCard
            title="Total Kelas"
            value={data?.totalKelas || 0}
            icon="school"
            color="#e74c3c"
          />
          <StatCard
            title="Total Admin"
            value={data?.totalAdmin || 0}
            icon="user-shield"
            color="#f39c12"
          />
        </View>

        {/* Attendance Section */}
        <View style={styles.attendanceSection}>
          <AttendanceStats data={data?.absensi} />
        </View>

        {/* Activity Section */}
        <View style={styles.activitySection}>
          <SectionCard title="Aktivitas Terkini" icon="clock-o">
            <ActivityList data={data} />
          </SectionCard>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: '#e8f4fc' }]}>
              <Icon name="tasks" type="font-awesome" size={20} color="#3498db" />
            </View>
            <View style={styles.quickStatContent}>
              <Text style={styles.quickStatValue}>{data?.tugasAktif || 0}</Text>
              <Text style={styles.quickStatLabel}>Tugas Aktif</Text>
            </View>
          </View>

          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: '#f0f9f0' }]}>
              <Icon name="inbox" type="font-awesome" size={20} color="#2ecc71" />
            </View>
            <View style={styles.quickStatContent}>
              <Text style={styles.quickStatValue}>{data?.submissionMasuk || 0}</Text>
              <Text style={styles.quickStatLabel}>Submission</Text>
            </View>
          </View>

          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: '#fef6e6' }]}>
              <Icon name="clipboard-list" type="font-awesome" size={20} color="#f39c12" />
            </View>
            <View style={styles.quickStatContent}>
              <Text style={styles.quickStatValue}>{data?.izinPending || 0}</Text>
              <Text style={styles.quickStatLabel}>Izin Pending</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    padding: 16,
  },
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  attendanceSection: {
    marginBottom: 24,
  },
  activitySection: {
    marginBottom: 24,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickStatContent: {
    flex: 1,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  systemStatus: {
    marginBottom: 32,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#475569',
  },
});