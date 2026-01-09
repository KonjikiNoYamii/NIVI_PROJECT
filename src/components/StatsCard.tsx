import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <View style={styles.card}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: "48%",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
  },
  label: {
    color: "#666",
    marginTop: 4,
  },
});
