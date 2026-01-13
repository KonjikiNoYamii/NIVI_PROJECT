// components/dashboard/AttendanceStats.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from 'react-native-elements';
import SectionCard from "./Section";

interface AttendanceStatsProps {
  data?: {
    hadir: number;
    izin: number;
    sakit: number;
    alpha: number;
  };
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ data }) => {
  const total = (data?.hadir || 0) + (data?.izin || 0) + (data?.sakit || 0) + (data?.alpha || 0);
  
  const attendanceData = [
    {
      label: "Hadir",
      value: data?.hadir || 0,
      color: "#10b981",
      icon: "check-circle",
      bgColor: "#d1fae5"
    },
    {
      label: "Izin",
      value: data?.izin || 0,
      color: "#f59e0b",
      icon: "exclamation-circle",
      bgColor: "#fef3c7"
    },
    {
      label: "Sakit",
      value: data?.sakit || 0,
      color: "#3b82f6",
      icon: "plus-circle",
      bgColor: "#dbeafe"
    },
    {
      label: "Alpha",
      value: data?.alpha || 0,
      color: "#ef4444",
      icon: "times-circle",
      bgColor: "#fee2e2"
    },
  ];

  const getPercentage = (value: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <SectionCard title="Statistik Absensi Hari Ini" icon="chart-bar">
      {total > 0 ? (
        <>
          <View style={styles.totalContainer}>
            <View style={styles.totalContent}>
              <Text style={styles.totalLabel}>Total Kehadiran</Text>
              <Text style={styles.totalValue}>{total}</Text>
            </View>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Kehadiran</Text>
                <Text style={[styles.summaryValue, { color: '#10b981' }]}>
                  {getPercentage(data?.hadir || 0)}%
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Ketidakhadiran</Text>
                <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
                  {getPercentage((data?.izin || 0) + (data?.sakit || 0) + (data?.alpha || 0))}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            {attendanceData.map((item, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: item.bgColor }]}>
                  <Icon 
                    name={item.icon} 
                    type="font-awesome" 
                    size={16} 
                    color={item.color}
                  />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${getPercentage(item.value)}%`,
                          backgroundColor: item.color
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.percentageText}>{getPercentage(item.value)}%</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="calendar-times" type="font-awesome" size={40} color="#e2e8f0" />
          <Text style={styles.emptyText}>Belum ada data absensi hari ini</Text>
          <Text style={styles.emptySubtext}>Data akan muncul setelah santri melakukan absensi</Text>
        </View>
      )}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  totalContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  totalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    minWidth: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
  },
});

export default AttendanceStats;