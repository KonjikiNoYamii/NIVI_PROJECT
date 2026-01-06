import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from 'react-native';

interface AttendanceItem {
  id: string;
  date: string;
  status: 'Hadir' | 'Izin' | 'Alfa';
}

const STATUS_OPTIONS: AttendanceItem['status'][] = ['Hadir', 'Izin', 'Alfa'];

const AttendanceScreen: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<AttendanceItem['status'] | null>(null);
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);

  const submitAttendance = () => {
    if (!selectedStatus) return;

    const today = new Date().toISOString().split('T')[0];

    setAttendance(prev => [
      { id: String(Date.now()), date: today, status: selectedStatus },
      ...prev,
    ]);

    setSelectedStatus(null);
  };

  const renderItem = ({ item }: { item: AttendanceItem }) => {
    return (
      <View style={styles.item}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Absensi Hari Ini</Text>

        <View style={styles.card}>
          {STATUS_OPTIONS.map(status => {
            const active = selectedStatus === status;
            return (
              <TouchableOpacity
                key={status}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => setSelectedStatus(status)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active && <Text style={styles.check}>✓</Text>}
                </View>
                <Text style={styles.optionText}>{status}</Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.submitButton, !selectedStatus && styles.submitDisabled]}
            onPress={submitAttendance}
            disabled={!selectedStatus}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>Simpan Absensi</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={attendance}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>Belum ada data absensi</Text>
          }
          contentContainerStyle={attendance.length === 0 ? styles.emptyWrap : undefined}
        />

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Keterangan</Text>
          <Text style={styles.footerText}>Hadir : Datang dan mengikuti kegiatan</Text>
          <Text style={styles.footerText}>Izin  : Tidak hadir dengan keterangan</Text>
          <Text style={styles.footerText}>Alfa  : Tidak hadir tanpa keterangan</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f0f7ff',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1e3a8a',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionActive: {
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#93c5fd',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  check: {
    color: '#ffffff',
    fontWeight: '700',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 12,
  },
  submitDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#dbeafe',
  },
  date: {
    fontSize: 14,
    color: '#374151',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    textAlign: 'center',
    color: '#64748b',
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#dbeafe',
  },
  footerTitle: {
    fontWeight: '700',
    marginBottom: 4,
    color: '#1e3a8a',
  },
  footerText: {
    fontSize: 12,
    color: '#334155',
  },
});