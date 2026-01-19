import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NIVI } from "../../theme/niviTheme";
import Fontawesome  from "@react-native-vector-icons/fontawesome"

interface StatCardProps {
  title: string;
  value: number;
  icon: any;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${color}1A` }]}>
          <Fontawesome name={icon} size={18} color={color} />
        </View>
      </View>

      <Text style={styles.value}>{value.toLocaleString()}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: NIVI.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: NIVI.border,
  },
  header: {
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: NIVI.textPrimary,
  },
  title: {
    fontSize: 14,
    color: NIVI.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default StatCard;
