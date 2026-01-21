import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../../services/api";
import { NIVI } from "../../theme/niviTheme";
import Loading from "../../components/loading";
import { Icon } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";

type StatusIzin = "menunggu" | "disetujui" | "ditolak";

const statusColor: any = {
  menunggu: "#FACC15",
  disetujui: "#34D399",
  ditolak: "#F87171",
};

const getToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Token tidak ditemukan");
  return token;
};

export default function PengajarIzinScreen() {
  const [izinList, setIzinList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchIzin = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/izin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIzinList(res.data.data || []);
    } catch {
      Alert.alert("Error", "Gagal mengambil data izin");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
  useCallback(() => {
    fetchIzin();
  }, [fetchIzin])
);


  const updateStatus = async (id: number, status: StatusIzin) => {
    Alert.alert(
      "Konfirmasi",
      `Yakin ingin ${status === "disetujui" ? "MENYETUJUI" : "MENOLAK"} izin ini?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await getToken();
              await axios.put(
                `${API}/izin/${id}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              fetchIzin();
            } catch {
              Alert.alert("Error", "Gagal update status izin");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.user?.name || "Santri"}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: statusColor[item.status] },
          ]}
        >
          <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.meta}>
        Kelas: {item.kelas.namaKelas || "-"}
      </Text>

      <Text style={styles.date}>
        Tanggal: {new Date(item.tanggal).toLocaleDateString()}
      </Text>

      <Text style={styles.alasan}>{item.alasan}</Text>

      {item.status === "menunggu" && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#34D399" }]}
            onPress={() => updateStatus(item.id, "disetujui")}
          >
            <Icon name="check" type="font-awesome" color="#fff" size={14} />
            <Text style={styles.actionText}>Setujui</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#F87171" }]}
            onPress={() => updateStatus(item.id, "ditolak")}
          >
            <Icon name="times" type="font-awesome" color="#fff" size={14} />
            <Text style={styles.actionText}>Tolak</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Loading visible={loading} />

      <Text style={styles.title}>Manajemen Izin Santri</Text>

      <FlatList
        data={izinList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Tidak ada pengajuan izin</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NIVI.background,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: NIVI.textPrimary,
    marginBottom: 16,
  },
  empty: {
    textAlign: "center",
    color: NIVI.textMuted,
    marginTop: 40,
  },
  card: {
    backgroundColor: NIVI.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: NIVI.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: NIVI.textPrimary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  meta: {
    fontSize: 13,
    color: NIVI.textSecondary,
  },
  date: {
    fontSize: 13,
    color: NIVI.textSecondary,
    marginBottom: 8,
  },
  alasan: {
    fontSize: 14,
    color: NIVI.textPrimary,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginLeft: 10,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 13,
  },
});


