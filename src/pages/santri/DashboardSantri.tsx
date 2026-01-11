// DashboardSantri.tsx
import React, { useCallback, useState } from "react";
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
import HeaderDashboard from "../../components/santri/HeaderDashboard";
import AbsensiCard from "../../components/santri/AbsensiCard";
import HistoryCard from "../../components/santri/HistoryCard";
import InfoCard from "../../components/santri/InfoCard";

const MAX_ABSEN = 4;

const DashboardSantri = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [absensi, setAbsensi] = useState<Absensi[]>([]);

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
      loadAbsensi();
    }, [])
  );

  const sisaAbsen = MAX_ABSEN - absensi.length;
  const sudahAbsen = absensi.length > 0;
  const progressAbsen = absensi.length / MAX_ABSEN;

  const handleAbsen = async () => {
    try {
      setSubmitting(true);
      await absensiService.absen("hadir");
      loadAbsensi();
      Alert.alert("Berhasil", "Absensi berhasil dikirim");
    } catch (e: any) {
      Alert.alert("Gagal", e.response?.data?.message || "Tidak bisa melakukan absen saat ini");
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeStatus = () => {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours < 12) return "Pagi";
    if (hours < 15) return "Siang";
    if (hours < 18) return "Sore";
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
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        <HeaderDashboard getTimeStatus={getTimeStatus}/>
        
        <AbsensiCard
          absensi={absensi}
          progressAbsen={progressAbsen}
          sudahAbsen={sudahAbsen}
          sisaAbsen={sisaAbsen}
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
  safe: {
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
});

export default DashboardSantri;