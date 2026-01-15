// components/dashboard/ActivityList.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Icon } from 'react-native-elements';

interface ActivityListProps {
  data: any;
}

const ActivityList: React.FC<ActivityListProps> = ({ data }) => {
  const activities = [
    {
      id: 1,
      title: "Tugas Aktif",
      value: data?.tugasAktif || 0,
      icon: "tasks",
      color: "#3498db",
      bgColor: "#e8f4fc",
      action: "Lihat Semua",
    },
    {
      id: 2,
      title: "Submission Masuk",
      value: data?.submissionMasuk || 0,
      icon: "inbox",
      color: "#2ecc71",
      bgColor: "#f0f9f0",
      action: "Review",
    },
    {
      id: 3,
      title: "Izin Pending",
      value: data?.izinPending || 0,
      icon: "clipboard-list",
      color: "#f39c12",
      bgColor: "#fef6e6",
      action: "Proses",
    },
  ];

  return (
    <View>
      {activities.map((activity) => (
        <TouchableOpacity key={activity.id} style={styles.activityItem} activeOpacity={0.7}>
          <View style={styles.activityLeft}>
            <View style={[styles.activityIcon, { backgroundColor: activity.bgColor }]}>
              <Icon 
                name={activity.icon} 
                type="font-awesome" 
                size={16} 
                color={activity.color}
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <View style={styles.activityInfo}>
                <Text style={styles.activityValue}>{activity.value} item</Text>
                {activity.value > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Baru</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.activityRight}>
            <Text style={styles.activityAction}>{activity.action}</Text>
            <Icon 
              name="chevron-right" 
              type="font-awesome" 
              size={12} 
              color="#94a3b8"
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
    fontWeight: '500',
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
  },
  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityAction: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    marginRight: 8,
  },
});

export default ActivityList;