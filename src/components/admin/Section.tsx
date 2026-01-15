// components/dashboard/SectionCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from 'react-native-elements';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
  actionText?: string;
  onActionPress?: () => void;
}

const SectionCard: React.FC<SectionCardProps> = ({ 
  title, 
  children, 
  icon = "info-circle",
  actionText,
  onActionPress 
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon 
            name={icon} 
            type="font-awesome" 
            size={16} 
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {actionText && onActionPress && (
          <Text style={styles.actionText} onPress={onActionPress}>
            {actionText}
          </Text>
        )}
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  actionText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  sectionContent: {
    // Content styling
  },
});

export default SectionCard;