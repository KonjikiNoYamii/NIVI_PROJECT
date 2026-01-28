// DashboardSantri.tsx
import React, { useCallback, useState, useEffect } from "react";
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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { absensiService, Absensi } from "../../services/absensi";
import { absensiSettingService } from "../../services/absensiSetting";
import HeaderDashboard from "../../components/santri/HeaderDashboard";
import AbsensiCard from "../../components/santri/AbsensiCard";
import HistoryCard from "../../components/santri/HistoryCard";
import InfoCard from "../../components/santri/InfoCard";

const DashboardSantri = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [MAX_ABSEN, setMaxAbsen] = useState<number>(0);

  // Load maxAbsen dari backend
  const loadMaxAbsen = async () => {
    try {
      const max = await absensiSettingService.getMaxAbsen();
      if (max !== null) setMaxAbsen(max);
    } catch {
      Alert.alert("Error", "Gagal mengambil setting absensi");
    }
  };

  const loadAbsensi = async () => {
    try {
      setLoading(true);
      const data = await absensiService.getToday();
      setAbsensi(data);
    } catch {
      Alert.alert("Error", "Gagal mengambil data absensi");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMaxAbsen();
      loadAbsensi();
    }, [])
  );

  const handleAbsen = async () => {
    try {
      setSubmitting(true);
      await absensiService.absen("hadir");
      await loadAbsensi();
      Alert.alert("Berhasil", "Absensi berhasil dikirim");
    } catch (e: any) {
      Alert.alert("Gagal", e.response?.data?.message || "Terjadi kesalahan server");
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeStatus = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Pagi";
    if (hour < 15) return "Siang";
    if (hour < 18) return "Sore";
    return "Malam";
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Santri</Text>
        <Text style={styles.headerSubtitle}>
          Selamat {getTimeStatus().toLowerCase()}!
        </Text>
      </View>

      <View style={styles.card}>
        <AbsensiCard
          absensi={absensi}
          submitting={submitting}
          handleAbsen={handleAbsen}
          MAX_ABSEN={MAX_ABSEN}
        />
      </View>

      <View style={styles.listCard}>
        <HistoryCard absensi={absensi} />
      </View>

      <View style={styles.listCard}>
        <InfoCard MAX_ABSEN={MAX_ABSEN} />
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -28,
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },

  listCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
});

export default DashboardSantri;