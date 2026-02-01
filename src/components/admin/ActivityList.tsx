import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { NIVI } from "../../theme/niviTheme";

const ActivityList = ({ data }: any) => {
  const items = [
    {
      title: "Tugas Aktif",
      value: data?.tugasAktif || 0,
      icon: "list-outline",
      color: NIVI.primary,
    },
    {
      title: "Submission Masuk",
      value: data?.submissionMasuk || 0,
      icon: "mail-unread-outline",
      color: NIVI.success,
    },
    {
      title: "Izin Pending",
      value: data?.izinPending || 0,
      icon: "time-outline",
      color: NIVI.warning,
    },
  ];

  return (
    <View>
      {items.map((item, i) => (
        <TouchableOpacity key={i} style={styles.row} activeOpacity={0.7}>
          <View style={styles.left}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: `${item.color}1A` },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={item.color}
              />
            </View>

            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.value}>{item.value} item</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: NIVI.border,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: NIVI.textSecondary,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    color: NIVI.textPrimary,
  },
});

export default ActivityList;
