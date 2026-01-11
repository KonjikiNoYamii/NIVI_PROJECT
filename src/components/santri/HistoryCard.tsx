// components/HistoryCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from 'react-native-elements';
import { Absensi } from "../../services/absensi";

interface HistoryCardProps {
  absensi: Absensi[];
}

const HistoryCard: React.FC<HistoryCardProps> = ({ absensi }) => {
  return (
    <View style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Icon name="history" type="font-awesome" size={20} />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Riwayat Absensi</Text>
          <Text style={styles.cardSubtitle}>Catatan absensi hari ini</Text>
        </View>
      </View>

      {absensi.length > 0 ? (
        <View style={styles.historyList}>
          {absensi.map((item, index) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <View style={[
                  styles.statusBadge,
                  item.status === 'hadir' && styles.hadirBadge,
                  item.status === 'izin' && styles.izinBadge,
                  item.status === 'sakit' && styles.sakitBadge,
                  item.status === 'alpha' && styles.alphaBadge,
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.historyNumber}>#{index + 1}</Text>
              </View>
              <Text style={styles.historyTime}>
                {new Date(item.tanggal).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyHistory}>
          <Icon name="clipboard" type="font-awesome" size={40} color="#e2e8f0" />
          <Text style={styles.emptyHistoryText}>Belum ada riwayat absensi</Text>
          <Text style={styles.emptyHistorySubtext}>
            Lakukan absensi pertama Anda hari ini
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  historyCard: {
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
  historyList: {
    paddingTop: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 12,
  },
  hadirBadge: {
    backgroundColor: '#10b98120',
  },
  izinBadge: {
    backgroundColor: '#f59e0b20',
  },
  sakitBadge: {
    backgroundColor: '#3b82f620',
  },
  alphaBadge: {
    backgroundColor: '#ef444420',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  historyNumber: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  historyTime: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyHistorySubtext: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
  },
});

export default HistoryCard;