import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { API } from "../../services/api";
import StatChartCard from "../../components/admin/StatChartCard";


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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Memuat dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Dashboard Admin</Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>

        <View style={styles.statsGrid}>
          <StatChartCard
            title="Total Santri"
            value={data?.totalSantri || 0}
            icon="users"
            color="#3b82f6"
            data={[10, 20, 30, 25, 40]}
            onPress={() =>
              Alert.alert("Detail Santri", "Statistik santri ditampilkan")
            }
          />

          <StatChartCard
            title="Total Pengajar"
            value={data?.totalPengajar || 0}
            icon="chalkboard-teacher"
            color="#22c55e"
            data={[3, 5, 6, 5, 8]}
            onPress={() =>
              Alert.alert("Detail Pengajar", "Statistik pengajar ditampilkan")
            }
          />

          <StatChartCard
            title="Total Kelas"
            value={data?.totalKelas || 0}
            icon="graduation-cap"
            color="#ef4444"
            data={[2, 3, 4, 5, 6]}
            onPress={() =>
              Alert.alert("Detail Kelas", "Statistik kelas ditampilkan")
            }
          />

          <StatChartCard
            title="Total Admin"
            value={data?.totalAdmin || 0}
            icon="user-shield"
            color="#f59e0b"
            data={[1, 1, 2, 2, 3]}
            onPress={() =>
              Alert.alert("Detail Admin", "Statistik admin ditampilkan")
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
