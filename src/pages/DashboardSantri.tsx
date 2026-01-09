import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { absensiService, Absensi } from "../services/absensi";
import { ProgressBar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const MAX_ABSEN = 4;

// Dummy data untuk santri
const SANTRI_DATA = {
  mataPelajaran: "Fiqih",
  deadline: "25 Apr 2024",
};

interface DashboardSantriProps {
  userData: {
    name: string;
    kelas: string;
    kehadiran: number;
  };
}

const DashboardSantri = ({ userData }: DashboardSantriProps) => {
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

  const sisaAbsen = MAX_ABSEN - absensi.length;
  const sudahAbsen = absensi.length > 0;

  const handleAbsen = async () => {
    try {
      setSubmitting(true);
      await absensiService.absen("hadir");
      loadAbsensi();
      Alert.alert("Berhasil", "Absensi berhasil dikirim");
    } catch (e: any) {
      Alert.alert("Gagal", e.response?.data?.message || "Tidak bisa absen");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadAbsensi();
  }, []);

  // Fungsi render progress bar untuk kehadiran
  const renderProgressBar = (percentage: number) => {
    let color = "#2ecc71"; // Hijau default
    if (percentage < 70) color = "#e74c3c"; // Merah jika < 70%
    else if (percentage < 85) color = "#f39c12"; // Orange jika < 85%

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Kehadiran</Text>
          <Text style={styles.progressPercentage}>{percentage}%</Text>
        </View>
        <ProgressBar
          progress={percentage / 100}
          color={color}
          style={styles.progressBar}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Beranda</Text>
        <Text style={styles.greeting}>
          Assalamualaikum,{"\n"}
          <Text style={styles.userName}>Santri {userData.name}</Text>
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Card Informasi Kelas */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="book-open-variant" size={20} color="#3498db" />
            <Text style={styles.cardTitle}>Informasi Kelas</Text>
          </View>
          <Text style={styles.kelasText}>Kelas: {userData.kelas}</Text>
          {renderProgressBar(userData.kehadiran)}
        </View>

        {/* Card Absensi Hari Ini */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="calendar-check" size={20} color="#3498db" />
            <Text style={styles.cardTitle}>Absensi Hari Ini</Text>
          </View>
          
          <View style={styles.absensiInfo}>
            <Text style={styles.lessonLabel}>Mata Pelajaran:</Text>
            <Text style={styles.lessonName}>{SANTRI_DATA.mataPelajaran}</Text>
            
            <View style={styles.deadlineContainer}>
              <Icon name="clock-outline" size={16} color="#e74c3c" />
              <Text style={styles.deadlineText}>
                Batas Pengumpulan: {SANTRI_DATA.deadline}
              </Text>
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            </View>
            
            <Text style={styles.absensiStatus}>
              Status: {sudahAbsen ? "Sudah Absen" : "Belum Absen"}
            </Text>
          </View>

          {/* Tombol Kirim Absensi */}
          {!sudahAbsen && sisaAbsen > 0 && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAbsen}
              disabled={submitting}
            >
              <Icon name="send-check" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                {submitting ? "Menyimpan..." : "Kirim Absensi"}
              </Text>
            </TouchableOpacity>
          )}
          
          {sudahAbsen ? (
            <View style={styles.successMessage}>
              <Icon name="check-circle" size={20} color="#2ecc71" />
              <Text style={styles.successText}>Anda sudah absen hari ini</Text>
            </View>
          ) : (
            <Text style={styles.remainingText}>
              {sisaAbsen > 0 ? `(${sisaAbsen}x tersisa)` : "Kuota absen habis"}
            </Text>
          )}
        </View>

        {/* Daftar Absensi Hari Ini */}
        {absensi.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="history" size={20} color="#3498db" />
              <Text style={styles.cardTitle}>Riwayat Absensi Hari Ini</Text>
            </View>
            <FlatList
              data={absensi}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.absensiItem}>
                  <View style={styles.absensiItemLeft}>
                    <Icon 
                      name="check-circle" 
                      size={20} 
                      color="#2ecc71" 
                    />
                    <Text style={styles.absensiStatusItem}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.absensiTime}>
                    {new Date(item.tanggal).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default DashboardSantri;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  contentContainer: {
    paddingBottom: 20,
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: {
    marginTop: 10,
    color: "#7f8c8d",
    fontSize: 14,
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  greeting: {
    fontSize: 18,
    color: "#7f8c8d",
    lineHeight: 24,
  },
  userName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2c3e50",
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  kelasText: {
    fontSize: 15,
    color: "#34495e",
    marginBottom: 12,
    fontWeight: "500",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ecf0f1",
  },
  absensiInfo: {
    marginBottom: 16,
  },
  lessonLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  lessonName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
  },
  deadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  deadlineText: {
    fontSize: 14,
    color: "#e74c3c",
    marginLeft: 6,
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgentText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  absensiStatus: {
    fontSize: 15,
    color: "#2c3e50",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#3498db",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#d5f4e6",
    borderRadius: 8,
    marginBottom: 8,
  },
  successText: {
    color: "#27ae60",
    fontWeight: "500",
    marginLeft: 8,
  },
  remainingText: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
  },
  absensiItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  absensiItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  absensiStatusItem: {
    fontWeight: "600",
    color: "#27ae60",
    marginLeft: 8,
    fontSize: 14,
  },
  absensiTime: {
    fontSize: 14,
    color: "#7f8c8d",
  },
});