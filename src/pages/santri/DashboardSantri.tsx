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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { absensiService, Absensi } from "../../services/absensi";
import { absensiSettingService } from "../../services/absensiSetting";
import HeaderDashboard from "../../components/santri/HeaderDashboard";
import AbsensiCard from "../../components/santri/AbsensiCard";
import HistoryCard from "../../components/santri/HistoryCard";
import InfoCard from "../../components/santri/InfoCard";
import { useAiBubble } from "../../context/aiBubbleContext";

const DashboardSantri = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [MAX_ABSEN, setMaxAbsen] = useState<number>(0);
const { bubble, clearBubble } = useAiBubble();


  // Load maxAbsen dari backend
  const loadMaxAbsen = async () => {
    try {
      clearBubble();
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
      Alert.alert(
        "Gagal",
        e.response?.data?.message || "Tidak bisa melakukan absen saat ini"
      );
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
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Memuat data absensi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <HeaderDashboard getTimeStatus={getTimeStatus} />

        <AbsensiCard
          absensi={absensi}
          submitting={submitting}
          handleAbsen={handleAbsen}
          MAX_ABSEN={MAX_ABSEN}
        />

        <HistoryCard absensi={absensi} />
        <InfoCard MAX_ABSEN={MAX_ABSEN} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#64748b" },
});

export default DashboardSantri;