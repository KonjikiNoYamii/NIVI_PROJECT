import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { Icon } from "react-native-elements";

import { API } from "../../services/api";
import { NIVI } from "../../theme/niviTheme";
import StatCard from "../../components/admin/Card";
import AttendanceStats from "../../components/admin/AttedanceChart";
import SectionCard from "../../components/admin/Section";
import ActivityList from "../../components/admin/ActivityList";

export default function DashboardAdmin() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API}/panel/dashboard/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(res.data);
    } catch (err) {
      console.log("Dashboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Memuat Dashboard…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        contentContainerStyle={styles.container}
      >
        {/* HEADER YANG IKUT SCROLL */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Dashboard Admin</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon
              name="user"
              type="font-awesome"
              size={20}
              color="#fff"
            />
          </View>
        </View>

        {/* STAT CARDS */}
        <View style={styles.grid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${NIVI.primary || '#2563eb'}15` }]}>
              <Icon
                name="user-o"
                type="font-awesome"
                size={20}
                color={NIVI.primary || '#2563eb'}
              />
            </View>
            <Text style={styles.statValue}>{data?.totalSantri || 0}</Text>
            <Text style={styles.statTitle}>Total Santri</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${NIVI.success || '#059669'}15` }]}>
              <Icon
                name="users"
                type="font-awesome"
                size={20}
                color={NIVI.success || '#059669'}
              />
            </View>
            <Text style={styles.statValue}>{data?.totalPengajar || 0}</Text>
            <Text style={styles.statTitle}>Total Pengajar</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${NIVI.secondary || '#7c3aed'}15` }]}>
              <Icon
                name="graduation-cap"
                type="font-awesome"
                size={20}
                color={NIVI.secondary || '#7c3aed'}
              />
            </View>
            <Text style={styles.statValue}>{data?.totalKelas || 0}</Text>
            <Text style={styles.statTitle}>Total Kelas</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${NIVI.warning || '#f59e0b'}15` }]}>
              <Icon
                name="user"
                type="font-awesome"
                size={20}
                color={NIVI.warning || '#f59e0b'}
              />
            </View>
            <Text style={styles.statValue}>{data?.totalAdmin || 0}</Text>
            <Text style={styles.statTitle}>Total Admin</Text>
          </View>
        </View>

        {/* ATTENDANCE */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Statistik Absensi</Text>
            <Text style={styles.cardSubtitle}>Rekap kehadiran terbaru</Text>
          </View>
          {data?.absensi ? (
            <AttendanceStats data={data.absensi} />
          ) : (
            <Text style={styles.emptyText}>Tidak ada data absensi</Text>
          )}
        </View>

        {/* ACTIVITY */}
        <View style={styles.listCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.listTitle}>Aktivitas Terkini</Text>
            <Text style={styles.cardSubtitle}>Update terbaru sistem</Text>
          </View>
          
          {data ? (
            <ActivityList data={data} />
          ) : (
            <Text style={styles.emptyText}>Tidak ada aktivitas</Text>
          )}
        </View>

        {/* SPACER UNTUK NAVIGATOR */}
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  
  scrollView: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  
  container: {
    paddingBottom: 100, // DITAMBAHKAN: Padding untuk navigator
  },
  
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  /* HEADER - SEKARANG BAGIAN DARI SCROLLVIEW */
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "android" ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  
  headerContent: {
    flex: 1,
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
  
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  /* STAT GRID */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 24,
  },
  
  statCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  
  statTitle: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
    textAlign: "center",
  },

  /* CARD */
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
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  
  cardHeader: {
    marginBottom: 16,
  },
  
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  
  cardSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },

  /* LIST CARD */
  listCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  
  listTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
    color: "#111827",
  },

  /* EMPTY TEXT */
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
    paddingVertical: 20,
  },

  /* SPACER UNTUK NAVIGATOR */
  spacer: {
    height: 100,
  },
});