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
import { absensiService } from "../services/absensi";

interface Absensi {
  id: number;
  tanggal: string;
  status: "hadir" | "izin" | "alpha";
}

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

  const handleAbsen = async () => {
    try {
      setSubmitting(true);
      await absensiService.absen();
      Alert.alert("Sukses", "Absen berhasil");
      loadAbsensi();
    } catch (err: any) {
      Alert.alert("Gagal", err.response?.data?.message || "Tidak bisa absen");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadAbsensi();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Absensi Hari Ini</Text>

      {absensi.length < 4 && (
        <TouchableOpacity
          style={styles.absenButton}
          onPress={handleAbsen}
          disabled={submitting}
          
        >
          <Text style={styles.absenText}>
            {submitting ? "Menyimpan..." : "ABSEN HADIR"}
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={absensi}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>
              {new Date(item.tanggal).toLocaleTimeString("id-ID")}
            </Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center" }}>
            Belum ada absensi hari ini
          </Text>
        }
      />
    </View>
  );
};

export default DashboardSantri;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  absenButton: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  absenText: { color: "white", fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
});
