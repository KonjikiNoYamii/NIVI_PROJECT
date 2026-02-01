import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NIVI } from "../../theme/niviTheme";
import Ionicons from "@react-native-vector-icons/ionicons";

interface Props {
  title: string;
  children: React.ReactNode;
  icon?: string;
}

const SectionCard: React.FC<Props> = ({ title, children, icon = "info-circle" }) => {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Ionicons name={icon} size={16} color={NIVI.primary} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: NIVI.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: NIVI.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: NIVI.textPrimary,
    marginLeft: 8,
  },
});

export default SectionCard;
