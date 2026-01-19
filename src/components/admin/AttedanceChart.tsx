import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { NIVI } from "../../theme/niviTheme";
import SectionCard from "./Section";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5-pro";

const AttendanceStats = ({ data }: any) => {
  const total =
    (data?.hadir || 0) +
    (data?.izin || 0) +
    (data?.sakit || 0) +
    (data?.alpha || 0);

  const stats = [
    { label: "Hadir", value: data?.hadir || 0, color: NIVI.success },
    { label: "Izin", value: data?.izin || 0, color: NIVI.warning },
    { label: "Sakit", value: data?.sakit || 0, color: NIVI.secondary },
    { label: "Alpha", value: data?.alpha || 0, color: NIVI.danger },
  ];

  const percent = (v: number) => (total === 0 ? 0 : Math.round((v / total) * 100));

  return (
    <SectionCard title="Statistik Absensi Hari Ini" icon="chart-bar">
      {total === 0 ? (
        <View style={styles.empty}>
          <FontAwesome5 name="calendar-week"size={40} color={NIVI.textMuted} iconStyle="solid"/>
          <Text style={styles.emptyText}>Belum ada data absensi</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {stats.map((s, i) => (
            <View key={i} style={styles.card}>
              <Text style={[styles.value, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.label}>{s.label}</Text>

              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${percent(s.value)}%`, backgroundColor: s.color }]} />
              </View>

              <Text style={styles.percent}>{percent(s.value)}%</Text>
            </View>
          ))}
        </View>
      )}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: NIVI.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: NIVI.border,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    color: NIVI.textSecondary,
    marginBottom: 8,
  },
  bar: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  percent: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    color: NIVI.textMuted,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
    color: NIVI.textMuted,
  },
});

export default AttendanceStats;
