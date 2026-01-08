import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';

// ================================
// ABSENSI SANTRI - VIEW PENGAJAR
// (HANYA MELIHAT, TIDAK EDIT)
// ================================

type Status = 'Hadir' | 'Izin' | 'Alfa';

interface AbsensiSantri {
  id: number;
  nama: string;
  tanggal: string;
  status: Status;
}

const AbsensiSantriPengajarScreen = () => {
  // DUMMY DATA (nanti dari API backend)
  const [data] = useState<AbsensiSantri[]>([
    { id: 1, nama: 'Ahmad', tanggal: '2026-01-06', status: 'Hadir' },
    { id: 2, nama: 'Fulan', tanggal: '2026-01-06', status: 'Izin' },
    { id: 3, nama: 'Zaid', tanggal: '2026-01-06', status: 'Alfa' },
  ]);

  const renderItem = ({ item }: { item: AbsensiSantri }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.nama}</Text>
        <Text style={styles.date}>{item.tanggal}</Text>
      </View>

      <View style={[styles.badge, styles[item.status]]}>
        <Text style={styles.badgeText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Rekap Absensi Santri</Text>

      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

export default AbsensiSantriPengajarScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f0f7ff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  date: {
    fontSize: 12,
    color: '#64748b',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  Hadir: {
    backgroundColor: '#bbf7d0',
  },
  Izin: {
    backgroundColor: '#fde68a',
  },
  Alfa: {
    backgroundColor: '#fecaca',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
  },
});
