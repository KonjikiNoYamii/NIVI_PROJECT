import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../../services/api";

/* ================== TYPE ================== */

interface CreateMapelPayload {
  nama: string;
  kode: string;
}

interface MataPelajaran {
  id: number;
  nama: string;
  kode: string;
}

/* ================== COMPONENT ================== */

const CreateMataPelajaranScreen: React.FC = () => {
  const [form, setForm] = useState<CreateMapelPayload>({
    nama: "",
    kode: "",
  });

  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [listLoading, setListLoading] = useState(false);

  /* ================== LOAD AUTH ================== */

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const [[, storedToken], [, storedRole]] =
          await AsyncStorage.multiGet(["token", "role"]);

        setToken(storedToken);
        setRole(storedRole);
      } catch {
        Alert.alert("Error", "Gagal mengambil data autentikasi");
      } finally {
        setInitLoading(false);
      }
    };

    loadAuth();
  }, []);

  /* ================== FETCH MAPEL ================== */

  const fetchMapel = async () => {
    if (!token) return;

    try {
      setListLoading(true);
      const res = await axios.get(`${API}/mapel`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMapelList(res.data.data || res.data);
    } catch {
      Alert.alert("Error", "Gagal mengambil data mata pelajaran");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMapel();
    }
  }, [token]);

  /* ================== FORM HANDLER ================== */

  const handleChange = (key: keyof CreateMapelPayload, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === "kode" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.nama || !form.kode) {
      Alert.alert("Validasi", "Nama dan kode mata pelajaran wajib diisi");
      return;
    }

    if (!token) {
      Alert.alert("Error", "Token tidak ditemukan, silakan login ulang");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API}/mapel`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Alert.alert("Berhasil", "Mata pelajaran berhasil ditambahkan");
      setForm({ nama: "", kode: "" });
      fetchMapel(); // 🔥 refresh list
    } catch (error: any) {
      Alert.alert(
        "Gagal",
        error?.response?.data?.message || "Terjadi kesalahan server"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================== STATE HANDLING ================== */

  if (initLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (role !== "admin") {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Akses Ditolak</Text>
      </View>
    );
  }

  /* ================== UI ================== */

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tambah Mata Pelajaran</Text>
        <Text style={styles.headerSubtitle}>
          Form pembuatan data mata pelajaran
        </Text>
      </View>

      {/* FORM */}
      <View style={styles.card}>
        <Text style={styles.label}>Nama Mata Pelajaran</Text>
        <TextInput
          placeholder="Contoh: Matematika"
          placeholderTextColor="#9ca3af"
          value={form.nama}
          onChangeText={(v) => handleChange("nama", v)}
          style={styles.input}
        />

        <Text style={styles.label}>Kode Mata Pelajaran</Text>
        <TextInput
          placeholder="Contoh: MTK-01"
          placeholderTextColor="#9ca3af"
          value={form.kode}
          onChangeText={(v) => handleChange("kode", v)}
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.disabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>SIMPAN DATA</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* LIST MAPEL */}
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Daftar Mata Pelajaran</Text>

        {listLoading ? (
          <ActivityIndicator color="#2563eb" />
        ) : mapelList.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada mata pelajaran</Text>
        ) : (
          mapelList.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <Text style={styles.mapelNama}>{item.nama}</Text>
              <Text style={styles.mapelKode}>{item.kode}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default CreateMataPelajaranScreen;

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 14,
    color: "#111827",
  },

  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },

  disabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.5,
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

  listTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111827",
  },

  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  mapelNama: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2933",
  },

  mapelKode: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    fontSize: 16,
    fontWeight: "700",
    color: "red",
  },
});
