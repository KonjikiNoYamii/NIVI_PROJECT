import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../../styles/dashboard.pengajar';

interface Props {
  tugasAktif: number;
  submissionMasuk: number;
  izinPending: number;
}

export const SummarySection = ({
  tugasAktif,
  submissionMasuk,
  izinPending,
}: Props) => {
  return (
    <View style={styles.summarySection}>
      <Text style={styles.summaryTitle}>Ringkasan</Text>

      <Text style={styles.summaryText}>
        {tugasAktif > 0
          ? `Ada ${tugasAktif} tugas aktif dengan ${submissionMasuk} pengumpulan masuk.`
          : 'Tidak ada tugas aktif saat ini.'}
      </Text>

      <Text style={styles.summaryText}>
        {izinPending > 0
          ? `${izinPending} izin perlu dikonfirmasi.`
          : 'Tidak ada izin yang menunggu.'}
      </Text>
    </View>
  );
};
