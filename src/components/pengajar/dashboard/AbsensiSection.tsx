import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import styles from '../../../styles/dashboard.pengajar';

export const AbsensiSection = ({ absensi }: any) => {
  const total =
    absensi.hadir + absensi.izin + absensi.sakit + absensi.alpha;

  const percent = total ? (absensi.hadir / total) * 100 : 0;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Absensi Hari Ini</Text>

      <View style={styles.absensiCard}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>

        <Text>Kehadiran {percent.toFixed(1)}%</Text>
      </View>
    </View>
  );
};
