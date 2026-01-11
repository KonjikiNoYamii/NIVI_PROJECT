// components/InfoCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from 'react-native-elements';

interface InfoCardProps {
  MAX_ABSEN: number;
}

const InfoCard: React.FC<InfoCardProps> = ({ MAX_ABSEN }) => {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <Icon name="info-circle" type="font-awesome" size={16} />
        <Text style={styles.infoTitle}>Informasi</Text>
      </View>
      <Text style={styles.infoText}>
        • Anda dapat melakukan absensi maksimal {MAX_ABSEN} kali per hari
      </Text>
      <Text style={styles.infoText}>
        • Pastikan Anda hadir tepat waktu untuk aktivitas pembelajaran
      </Text>
      <Text style={styles.infoText}>
        • Absensi yang sudah dikirim tidak dapat diubah
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#ebf5fb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 100,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default InfoCard;