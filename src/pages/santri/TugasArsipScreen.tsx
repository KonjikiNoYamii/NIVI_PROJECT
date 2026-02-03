import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API } from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";

interface Tugas {
  id: number;
  judul: string;
  deadline: string;
  deletedAt: string;
  mataPelajaran: {
    nama: string;
  };
  submission?: {
    status: string;
    nilai?: number;
  }[];
}

export default function TugasArsipScreen() {
  const [data, setData] = useState<Tugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchArsip = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${API}/tugas/santri/arsip`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(res.data.data);
    } catch (e) {
      console.log("Gagal ambil arsip", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
  React.useCallback(() => {
    // Fetch data setiap layar difokuskan
    fetchArsip();

    // Cleanup optional
    return () => {
      // Jika ada abort controller atau cleanup lain, bisa ditambahkan di sini
    };
  }, [])
);


  // Fungsi label status baru
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'belum_submit':
        return 'Belum Dikumpulkan';
      case 'pending':
        return 'Menunggu Penilaian';
      case 'reviewed':
        return 'Diterima';
      case 'rejected':
        return 'Ditolak';
      default:
        return 'Tidak Diketahui';
    }
  };

  // Fungsi warna status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'belum_submit':
        return '#dc2626';
      case 'pending':
        return '#f59e0b';
      case 'reviewed':
        return '#059669';
      case 'rejected':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Arsip Tugas</Text>
        <Text style={styles.headerSubtitle}>
          {data.length} tugas diarsipkan
        </Text>
      </View>
    </View>
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listTitle}>Semua Arsip</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Tugas }) => {
    const submission = item.submission?.[0];
    const status = submission?.status || 'belum_submit';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.subjectContainer}>
            <Text style={styles.subject}>{item.mataPelajaran.nama}</Text>
          </View>
          <Text style={styles.meta}>
            Diarsipkan: {new Date(item.deletedAt).toLocaleDateString("id-ID")}
          </Text>
        </View>

        <Text style={styles.title}>{item.judul}</Text>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: `${getStatusColor(status)}15` }
          ]}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: getStatusColor(status) }
            ]} />
            <Text style={[
              styles.statusText,
              { color: getStatusColor(status) }
            ]}>
              {getStatusLabel(status)}
            </Text>
          </View>
        </View>

        {/* Info nilai jika ada */}
        {submission?.nilai !== undefined && (
          <View style={styles.nilaiContainer}>
            <Text style={styles.nilaiLabel}>Nilai:</Text>
            <Text style={styles.nilaiValue}>{submission.nilai}</Text>
          </View>
        )}

        {/* Info deadline */}
        <View style={styles.deadlineContainer}>
          <Text style={styles.deadlineLabel}>Deadline:</Text>
          <Text style={styles.deadlineValue}>
            {new Date(item.deadline).toLocaleDateString('id-ID')}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Memuat arsip tugas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={fetchArsip}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        contentContainerStyle={
          data.length === 0
            ? { flexGrow: 1, paddingBottom: 100 }
            : [styles.listContainer, { paddingBottom: 100 }]
        }
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderListHeader()}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>Belum Ada Arsip</Text>
            <Text style={styles.emptySubtitle}>
              Saat ini belum ada tugas yang diarsipkan.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "android" ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
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
  list: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  listContainer: {
    paddingTop: 0,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectContainer: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subject: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "600",
  },
  meta: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1f2933",
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  nilaiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  nilaiLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
    marginRight: 6,
  },
  nilaiValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  deadlineLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 6,
  },
  deadlineValue: {
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
    minHeight: 400,
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
    color: "#9ca3af",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#9ca3af",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#9ca3af",
    textAlign: "center",
    fontWeight: "400",
    lineHeight: 22,
    paddingHorizontal: 40,
    marginBottom: 24,
  },
});