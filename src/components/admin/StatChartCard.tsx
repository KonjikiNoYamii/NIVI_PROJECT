import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Icon } from "react-native-elements";

interface Props {
  title: string;
  value: number;
  icon: string;
  color: string;
  data: number[];
  onPress: () => void;
}

export default function StatChartCard({
  title,
  value,
  icon,
  color,
  data,
  onPress,
}: Props) {
  const maxValue = Math.max(...data, 1);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.header}>
        <Icon name={icon} type="font-awesome" size={18} color={color} />
        <Text style={styles.title}>{title}</Text>
      </View>

      <Text style={styles.value}>{value}</Text>

      <View style={styles.chart}>
        {data.map((v, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: `${(v / maxValue) * 100}%`,
                backgroundColor: color,
              },
            ]}
          />
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  value: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 10,
  },
  chart: {
    height: 50,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  bar: {
    width: 8,
    borderRadius: 4,
  },
});
