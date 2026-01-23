import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import styles from '../../../styles/dashboard.pengajar';

interface Props {
  total: number;
  onPress?: () => void;
}

export const ActionCard = ({ total, onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIconContainer}>
        <Icon name="clock" type="font-awesome" size={20} color="#f39c12" />
      </View>

      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>Izin Menunggu Konfirmasi</Text>
        <Text style={styles.actionSubtitle}>
          Tinjau permintaan izin santri
        </Text>
      </View>

      <View style={styles.actionBadge}>
        <Text style={styles.actionBadgeText}>{total}</Text>
      </View>

      <Icon name="chevron-right" type="font-awesome" size={16} color="#94a3b8" />
    </TouchableOpacity>
  );
};
