import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

/* ================= MOCK DATA (GANTI DARI API NANTI) ================= */

const santriAktif = [
  { id: "1", nama: "Ahmad", kelas: "X IPA", status: "Aktif" },
  { id: "2", nama: "Ali", kelas: "XI IPA", status: "Aktif" },
  { id: "3", nama: "Fajar", kelas: "XII IPS", status: "Aktif" },
  { id: "4", nama: "Rizki", kelas: "X IPA", status: "Aktif" },
];

const kehadiranHarian = [60, 70, 65, 80, 75, 90, 85]; // persen

/* ================= KOMPONEN GRAFIK GARIS ================= */

const LineChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  const chartHeight = 120;
  const chartWidth = width - 80;

  return (
    <View style={styles.chartContainer}>
      {data.map((val, i) => {
        const x = (i / (data.length - 1)) * chartWidth;
        const y = chartHeight - (val / max) * chartHeight;

        return (
          <View
            key={i}
            style={[
              styles.point,
              { left: x, top: y },
            ]}
          />
        );
      })}

      {data.map((val, i) => {
        if (i === data.length - 1) return null;

        const x1 = (i / (data.length - 1)) * chartWidth;
        const y1 = chartHeight - (val / max) * chartHeight;
        const x2 = ((i + 1) / (data.length - 1)) * chartWidth;
        const y2 =
          chartHeight - (data[i + 1] / max) * chartHeight;

        return (
          <View
            key={`line-${i}`}
            style={[
              styles.line,
              {
                left: x1,
                top: y1,
                width: Math.hypot(x2 - x1, y2 - y1),
                transform: [
                  {
                    rotate: `${Math.atan2(
                      y2 - y1,
                      x2 - x1
                    )}rad`,
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

/* ================= MAIN DASHBOARD ================= */

export default function DashboardAdmin() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard Admin</Text>
      <Text style={styles.subtitle}>
        Ringkasan kondisi sistem
      </Text>

      {/* ================= STAT CARD ================= */}
      <View style={styles.row}>
        <Pressable
          style={styles.card}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.cardValue}>
            {santriAktif.length}
          </Text>
          <Text style={styles.cardLabel}>
            Santri Aktif
          </Text>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.cardValue}>1</Text>
          <Text style={styles.cardLabel}>Pengajar</Text>
        </View>
      </View>

      {/* ================= GRAFIK ================= */}
      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>
          Grafik Kehadiran (%)
        </Text>
        <LineChart data={kehadiranHarian} />
      </View>

      {/* ================= MODAL DETAIL ================= */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Daftar Santri Aktif
            </Text>

            <FlatList
              data={santriAktif}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.listName}>
                    {item.nama}
                  </Text>
                  <Text style={styles.listSub}>
                    {item.kelas} • {item.status}
                  </Text>
                </View>
              )}
            />

            <Pressable
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ================= STYLE ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#666",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 15,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 3,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563EB",
  },
  cardLabel: {
    marginTop: 5,
    color: "#555",
  },
  graphCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 25,
    elevation: 3,
  },
  graphTitle: {
    fontWeight: "bold",
    marginBottom: 15,
  },
  chartContainer: {
    height: 140,
    position: "relative",
  },
  point: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
    position: "absolute",
  },
  line: {
    height: 2,
    backgroundColor: "#2563EB",
    position: "absolute",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  listName: {
    fontWeight: "bold",
  },
  listSub: {
    color: "#666",
    fontSize: 12,
  },
  closeBtn: {
    marginTop: 15,
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
