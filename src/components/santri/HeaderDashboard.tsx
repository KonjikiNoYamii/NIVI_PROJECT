// components/HeaderDashboard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface HeaderDashboardProps {
  getTimeStatus: () => string;
}

const HeaderDashboard: React.FC<HeaderDashboardProps> = ({ getTimeStatus }) => {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Selamat {getTimeStatus()}</Text>
        <Text style={styles.pageTitle}>Dashboard Santri</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
});

export default HeaderDashboard;