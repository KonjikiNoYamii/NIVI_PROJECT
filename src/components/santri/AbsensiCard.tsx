// AbsensiCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { Absensi } from "../../services/absensi";

interface AbsensiCardProps {
  absensi: Absensi[];
  submitting: boolean;
  handleAbsen: () => void;
  MAX_ABSEN: number;
}

const AbsensiCard: React.FC<AbsensiCardProps> = ({
  absensi,
  submitting,
  handleAbsen,
  MAX_ABSEN,
}) => {
  const sisaAbsen = MAX_ABSEN - absensi.length;
  const progress = absensi.length / MAX_ABSEN;
  const isAbsenHabis = absensi.length >= MAX_ABSEN;

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <Icon name="calendar" type="font-awesome" />
        <Text style={styles.title}>Absensi Hari Ini</Text>
      </View>

      {/* PROGRESS */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {absensi.length}/{MAX_ABSEN} kali absensi
      </Text>

      {/* BUTTON / STATUS */}
      {isAbsenHabis ? (
        <View style={styles.doneBox}>
          <Icon name="check-circle" type="font-awesome" color="#16a34a" />
          <Text style={styles.doneText}>Absensi hari ini selesai</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleAbsen}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Menyimpan..." : `Absen Sekarang (${sisaAbsen}x sisa)`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3498db",
  },
  progressText: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  doneBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#dcfce7",
    padding: 16,
    borderRadius: 12,
  },
  doneText: {
    color: "#16a34a",
    fontWeight: "700",
  },
});

export default AbsensiCard;
