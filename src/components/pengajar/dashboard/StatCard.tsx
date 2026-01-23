import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import styles from '../../../styles/dashboard.pengajar';

interface Props {
  icon: string;
  type?: string;
  color: string;
  bg: string;
  value: number;
  label: string;
}

export const StatCard = ({ icon, type='font-awesome', value, label, bg, color }: any) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: bg }]}>
      <Icon name={icon} type={type} size={20} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

