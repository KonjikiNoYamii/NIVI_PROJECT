// Section.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { NIVI } from "../../theme/niviTheme";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
  icon = "info-circle",
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name={icon} type="font-awesome" size={18} color={NIVI.primary} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: NIVI.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: NIVI.border,
    marginBottom: 16,
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
    marginLeft: 10,
  },
  content: {
    flex: 1,
  },
});

export default SectionCard;
