// SantriAbsensiScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../../components/loading";
import { API } from "../../services/api";
import { NIVI } from "../../theme/niviTheme";
import { Icon } from "react-native-elements";
import { TextInput } from "react-native-gesture-handler";

const getToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Token tidak ditemukan");
  return token;
};

type StatusAbsensi = "hadir" | "izin" | "sakit";

const statusColors:any = {
  hadir: "#34D399", // hijau
  izin: "#FACC15",  // kuning
  sakit: "#F87171", // merah
};

export default function SantriAbsensiScreen() {
  const [absensiHariIni, setAbsensiHariIni] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusAbsen, setStatusAbsen] = useState<StatusAbsensi | null>(null);
  const [showIzinModal, setShowIzinModal] = useState(false);
const [alasanIzin, setAlasanIzin] = useState("");


  const statusOptions: StatusAbsensi[] = ["hadir", "izin", "sakit"];

  const fetchAbsensiHariIni = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/absensi/me/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAbsensiHariIni(res.data.data || []);
    } catch {
      Alert.alert("Error", "Gagal mengambil data absensi");
    } finally {
      setLoading(false);
    }
  }, []);

  

  useEffect(() => {
    fetchAbsensiHariIni();
  }, [fetchAbsensiHariIni]);

  const submitAbsen = async (status: StatusAbsensi) => {
    setLoading(true);
    try {
      const token = await getToken();
      await axios.post(
        `${API}/absensi/absen`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatusAbsen(status);
      Alert.alert("Sukses", "Absen berhasil");
      fetchAbsensiHariIni();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Gagal absen");
    } finally {
      setLoading(false);
    }
  };

  const submitIzin = async () => {
  if (!alasanIzin.trim()) {
    Alert.alert("Peringatan", "Alasan izin wajib diisi");
    return;
  }

  setLoading(true);
  try {
    const token = await getToken();
    await axios.post(
      `${API}/izin`,
      {
        alasan: alasanIzin,
        tanggal: new Date(),
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    Alert.alert(
      "Izin Diajukan",
      "Izin berhasil diajukan dan menunggu persetujuan"
    );

    setShowIzinModal(false);
    setAlasanIzin("");
  } catch (err: any) {
    Alert.alert("Error", err.response?.data?.message || "Gagal mengajukan izin");
  } finally {
    setLoading(false);
  }
};


  const stats:any = { hadir: 0, izin: 0, sakit: 0 };
  absensiHariIni.forEach((a) => {
    stats[a.status] = (stats[a.status] || 0) + 1;
  });
  const total = absensiHariIni.length;
  const percent = (v: number) => (total === 0 ? 0 : Math.round((v / total) * 100));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <Loading visible={loading} />


      <Modal
  visible={showIzinModal}
  transparent
  animationType="fade"
  statusBarTranslucent
>
  <KeyboardAvoidingView
    style={styles.modalOverlay}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>Ajukan Izin</Text>

      <Text style={styles.modalLabel}>Alasan Izin</Text>
      <TextInput
        value={alasanIzin}
        onChangeText={setAlasanIzin}
        placeholder="Contoh: Keperluan keluarga"
        multiline
        style={styles.textArea}
      />

      <View style={styles.modalActions}>
        <TouchableOpacity
          style={[styles.modalBtn, { backgroundColor: "#E5E7EB" }]}
          onPress={() => {
            setShowIzinModal(false);
            setAlasanIzin("");
          }}
        >
          <Text style={{ color: "#374151" }}>Batal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalBtn, { backgroundColor: "#FACC15" }]}
          onPress={submitIzin}
        >
          <Text style={{ color: "#78350F", fontWeight: "600" }}>
            Ajukan
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </KeyboardAvoidingView>
</Modal>


      <Text style={styles.title}>Absensi Hari Ini</Text>

      {/* ================= BUTTON ABSEN ================= */}
<View style={styles.buttonGroup}>
  {statusOptions.map((s) => {
    const bgColor = statusColors[s];
    const isActive = statusAbsen === s;

    return (
      <TouchableOpacity
        key={s}
        activeOpacity={0.8}
        onPress={() => {
  if (s === "izin") {
    setShowIzinModal(true);
  } else {
    submitAbsen(s);
  }
}}

        style={[
          styles.btn,
          {
            backgroundColor: isActive ? bgColor : `${bgColor}33`, // lebih transparan jika non-active
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          },
        ]}
      >
        <Icon
          name={s === "hadir" ? "check-circle" : s === "izin" ? "clock" : "times-circle"}
          type="font-awesome"
          color="#fff"
          size={16}
          containerStyle={{ marginRight: 6 }}
        />
        <Text style={styles.btnText}>{s.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  })}
</View>


      {/* ================= STATISTIK ABSENSI ================= */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Icon name="chart-bar" type="font-awesome" size={18} color={NIVI.primary} />
          <Text style={styles.sectionTitle}>Statistik Absensi</Text>
        </View>
        {total === 0 ? (
          <Text style={styles.emptyText}>Belum ada absensi hari ini</Text>
        ) : (
          <View style={styles.statsGrid}>
            {statusOptions.map((key) => (
              <View key={key} style={styles.statCard}>
                <Text style={[styles.statValue, { color: statusColors[key] }]}>
                  {stats[key as keyof typeof stats]}
                </Text>
                <Text style={styles.statLabel}>{key.toUpperCase()}</Text>
                <View style={styles.bar}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${percent(stats[key as keyof typeof stats])}%`,
                        backgroundColor: statusColors[key],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.percent}>{percent(stats[key as keyof typeof stats])}%</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ================= RIWAYAT ABSENSI ================= */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Icon name="calendar-alt" type="font-awesome" size={18} color={NIVI.primary} />
          <Text style={styles.sectionTitle}>Riwayat Absensi</Text>
        </View>
        {absensiHariIni.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada absensi hari ini</Text>
        ) : (
          <FlatList
            data={absensiHariIni}
            keyExtractor={(i) => i.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.jadwal}>
                  {item.jadwal?.hari || "Tidak ada jadwal"} |{" "}
                  {item.jadwal?.jamMulai}-{item.jadwal?.jamSelesai}
                </Text>
                <Text style={[styles.status, { color: statusColors[item.status] }]}>
                  Status: {item.status.toUpperCase()}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
    
    
  );
  
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NIVI.background, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", color: NIVI.textPrimary, marginBottom: 16 },
  buttonGroup: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 90,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },

  sectionCard: {
    backgroundColor: NIVI.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: NIVI.border,
    marginBottom: 16,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: NIVI.textPrimary, marginLeft: 10 },
  emptyText: { textAlign: "center", paddingVertical: 16, color: NIVI.textMuted },

  statsGrid: { flexDirection: "row", justifyContent: "space-between" },
  statCard: { width: "32%" },
  statValue: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  statLabel: { fontSize: 14, color: NIVI.textSecondary, marginBottom: 6 },
  bar: { height: 6, backgroundColor: "#E5E7EB", borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  percent: { fontSize: 12, fontWeight: "600", marginTop: 4, color: NIVI.textMuted },

  card: { backgroundColor: NIVI.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: NIVI.border },
  jadwal: { fontSize: 14, color: NIVI.textSecondary, marginBottom: 4 },
  status: { fontSize: 16, fontWeight: "600" },
  modalOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},

modalCard: {
  width: "90%",
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 20,
},

modalTitle: {
  fontSize: 18,
  fontWeight: "700",
  marginBottom: 12,
  color: "#111827",
},

modalLabel: {
  fontSize: 14,
  color: "#374151",
  marginBottom: 6,
},

textArea: {
  minHeight: 80,
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 12,
  padding: 12,
  textAlignVertical: "top",
  marginBottom: 16,
},

modalActions: {
  flexDirection: "row",
  justifyContent: "flex-end",
},

modalBtn: {
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 10,
  marginLeft: 10,
},

});
