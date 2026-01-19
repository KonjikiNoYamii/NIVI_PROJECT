import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
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
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={NIVI.primary} />
          <Text style={styles.loadingText}>Memuat Dashboard…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard Admin</Text>
            <Text style={styles.subtitle}>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* STAT CARDS */}
        <View style={styles.grid}>
          <StatCard
            title="Total Santri"
            value={data?.totalSantri || 0}
            icon="user-o"
            color={NIVI.primary}
          />
          <StatCard
            title="Total Pengajar"
            value={data?.totalPengajar || 0}
            icon="chalkboard-teacher"
            color={NIVI.success}
          />
          <StatCard
            title="Total Kelas"
            value={data?.totalKelas || 0}
            icon="graduation-cap"
            color={NIVI.secondary}
          />
          <StatCard
            title="Total Admin"
            value={data?.totalAdmin || 0}
            icon="user-lock"
            color={NIVI.warning}
          />
        </View>

        {/* ATTENDANCE */}
        <View style={styles.section}>
          <AttendanceStats data={data?.absensi} />
        </View>

        {/* ACTIVITY */}
        <View style={styles.section}>
          <SectionCard title="Aktivitas Terkini" icon="clock">
            <ActivityList data={data} />
          </SectionCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: NIVI.background,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: NIVI.textSecondary,
    fontWeight: "500",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: NIVI.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: NIVI.textMuted,
    marginTop: 4,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${NIVI.primary}1A`,
    justifyContent: "center",
    alignItems: "center",
  },

  /* GRID */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  section: {
    marginBottom: 24,
  },
});
