import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { absensiService, Absensi } from "../services/absensi";
import { SafeAreaView } from "react-native-safe-area-context";

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
      Alert.alert("Error", "Gagal mengambil absensi");
    } finally {
      setLoading(false);
    }
  };

  const sisaAbsen = MAX_ABSEN - absensi.length;

  const handleAbsen = async () => {
    try {
      setSubmitting(true);
      await absensiService.absen("hadir");
      loadAbsensi();
    } catch (e: any) {
      Alert.alert("Gagal", e.response?.data?.message || "Tidak bisa absen");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadAbsensi();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Assalamualaikum,</Text>
        <Text style={styles.santriName}>Santri Ahmad</Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Kelas:</Text>
            <Text style={styles.infoValue}>8A</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Kehadiran:</Text>
            <Text style={styles.infoValue}>85%</Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Absensi Section */}
      <View style={styles.absensiSection}>
        <Text style={styles.sectionTitle}>Absensi Hari Ini</Text>
        
        <View style={styles.lessonInfo}>
          <Text style={styles.lessonLabel}>Mata Pelajaran:</Text>
          <Text style={styles.lessonName}>Fiqih</Text>
        </View>
        
        <View style={styles.dueDate}>
          <Text style={styles.dueDateText}>☉ Uogem 24 3ap11</Text>
          <Text style={styles.dueDateText}>☉ Batas Pengumpulan: 25 Apr 2024</Text>
        </View>

        {/* Tombol Kirim Absensi */}
        {sisaAbsen > 0 && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleAbsen}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? "Menyimpan..." : "Kirim Absensi"}
            </Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.remainingText}>
          {sisaAbsen > 0 ? `(${sisaAbsen}x tersisa)` : "Absensi selesai untuk hari ini"}
        </Text>
      </View>

      {/* Daftar Absensi */}
      <FlatList
        data={absensi}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.absensiCard}>
            <Text style={styles.absensiStatus}>{item.status.toUpperCase()}</Text>
            <Text style={styles.absensiTime}>
              {new Date(item.tanggal).toLocaleString("id-ID")}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada absensi hari ini</Text>
        }
        style={styles.absensiList}
      />

    </SafeAreaView>
  );
};

export default DashboardSantri;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  santriName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flexDirection: "row",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  absensiSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  lessonInfo: {
    marginBottom: 12,
  },
  lessonLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  lessonName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  dueDate: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  dueDateText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  remainingText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  absensiList: {
    flex: 1,
    padding: 20,
  },
  absensiCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  absensiStatus: {
    fontWeight: "700",
    color: "#2ecc71",
    fontSize: 16,
  },
  absensiTime: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
    fontSize: 16,
  },
});