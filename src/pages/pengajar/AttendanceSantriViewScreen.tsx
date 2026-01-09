import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Santri {
  id: number;
  name: string;
}

interface Absensi {
  id: number;
  userId: number;
  tanggal: string;
  status: "hadir" | "izin" | "sakit" | "alpha";
}

interface Kelas {
  id: number;
  namaKelas: string;
  santri: Santri[];
  absensi: Absensi[];
}

const API_BASE_URL = "https://nivi-production.up.railway.app/api";

const KelasScreen: React.FC = () => {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAbsensi, setLoadingAbsensi] = useState<boolean>(false);

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get<{ success: boolean; data: Kelas[] }>(
        `${API_BASE_URL}/kelas`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setKelasList(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderKelasItem = ({ item }: { item: Kelas }) => (
    <TouchableOpacity
      style={styles.kelasCard}
      onPress={() => setSelectedKelas(item)}
    >
      <Text style={styles.kelasTitle}>{item.namaKelas}</Text>
      <Text style={styles.kelasSubtitle}>
        Jumlah santri: {item.santri.length}
      </Text>
    </TouchableOpacity>
  );

  const renderAbsensi = ({ item }: { item: Santri }) => {
    const absensiUser = selectedKelas?.absensi.filter(
      (a) => a.userId === item.id
    );

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        {absensiUser && absensiUser.length > 0 ? (
          absensiUser.map((a) => (
            <View
              key={a.id}
              style={[styles.badge, styles[a.status]]}
            >
              <Text style={styles.badgeText}>
                {a.status.toUpperCase()} - {new Date(a.tanggal).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>Belum ada absensi</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
      </SafeAreaView>
    );
  }

  if (!selectedKelas) {
    // Pilih kelas
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Pilih Kelas</Text>
        <FlatList
          data={kelasList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderKelasItem}
        />
      </SafeAreaView>
    );
  }

  // Tampilan absensi per kelas yang dipilih
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setSelectedKelas(null)}
      >
        <Text style={styles.backText}>⬅ Kembali ke daftar kelas</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Absensi Kelas: {selectedKelas.namaKelas}</Text>

      {selectedKelas.santri.length > 0 ? (
        <FlatList
          data={selectedKelas.santri}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAbsensi}
        />
      ) : (
        <Text>Tidak ada santri di kelas ini</Text>
      )}
    </SafeAreaView>
  );
};

export default KelasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f7ff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 12,
  },
  kelasCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
  kelasTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  kelasSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    color: "#3498db",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#1f2937",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginVertical: 2,
    alignSelf: "flex-start",
  },
  hadir: { backgroundColor: "#bbf7d0" },
  izin: { backgroundColor: "#fde68a" },
  sakit: { backgroundColor: "#fca5a5" },
  alpha: { backgroundColor: "#fecaca" },
  badgeText: { fontWeight: "700", fontSize: 12, color: "#1f2937" },
  noDataText: { color: "#64748b", fontStyle: "italic" },
});
