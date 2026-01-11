// components/AbsensiCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from 'react-native-elements';
import { Absensi } from "../../services/absensi";

interface AbsensiCardProps {
  absensi: Absensi[];
  progressAbsen: number;
  sudahAbsen: boolean;
  sisaAbsen: number;
  submitting: boolean;
  handleAbsen: () => void;
  MAX_ABSEN: number;
}

const AbsensiCard: React.FC<AbsensiCardProps> = ({
  absensi,
  progressAbsen,
  sudahAbsen,
  sisaAbsen,
  submitting,
  handleAbsen,
  MAX_ABSEN
}) => {
  return (
    <View style={styles.absensiCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Icon name="calendar" type="font-awesome" size={20} />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Absensi Hari Ini</Text>
          <Text style={styles.cardSubtitle}>Status kehadiran Anda</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress Absensi</Text>
          <Text style={styles.progressCount}>
            {absensi.length}/{MAX_ABSEN} kali
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progressAbsen * 100}%` }
            ]} 
          />
        </View>
        
        <View style={styles.progressDots}>
          {[...Array(MAX_ABSEN)].map((_, index) => (
            <View 
              key={index}
              style={[
                styles.progressDot,
                index < absensi.length ? styles.progressDotActive : styles.progressDotInactive
              ]}
            />
          ))}
        </View>
      </View>

      {sudahAbsen ? (
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Icon name="check-circle" type="font-awesome" size={24} color="#27ae60" />
          </View>
          <View style={styles.successContent}>
            <Text style={styles.successTitle}>Sudah Absen Hari Ini</Text>
            <Text style={styles.successSubtitle}>
              Anda telah melakukan {absensi.length} kali absensi
            </Text>
          </View>
        </View>
      ) : sisaAbsen > 0 ? (
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleAbsen}
          disabled={submitting}
          activeOpacity={0.9}
        >
          <View style={styles.buttonContent}>
            <Icon 
              name="check-circle" 
              type="font-awesome" 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.submitButtonText}>
              {submitting ? "Menyimpan..." : "Absen Sekarang"}
            </Text>
          </View>
          <Text style={styles.remainingText}>{sisaAbsen}x tersisa</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.limitContainer}>
          <Icon name="exclamation-triangle" type="font-awesome" size={20} color="#e74c3c" />
          <Text style={styles.limitText}>Kuota absen hari ini sudah habis</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  absensiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3498db',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressDotActive: {
    backgroundColor: '#3498db',
  },
  progressDotInactive: {
    backgroundColor: '#e2e8f0',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d5f4e6',
    borderRadius: 12,
    padding: 16,
  },
  successIconContainer: {
    marginRight: 12,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 2,
  },
  successSubtitle: {
    fontSize: 12,
    color: '#27ae60',
    opacity: 0.8,
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#b0d4f0',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  remainingText: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  limitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee',
    borderRadius: 12,
    padding: 16,
  },
  limitText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AbsensiCard;