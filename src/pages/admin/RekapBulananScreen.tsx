import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

type Kelas = {
  id: number;
  namaKelas: string;
};

type AbsensiDetail = {
  tanggal: string;
  status: string;
  alasan?: string | null;
  aiComment: string;
  aiTone: string;
  aiConfidence: number;
};

type SantriSummary = {
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  total: number;
  detail: AbsensiDetail[];
};

type RekapResponse = {
  kelasId: number;
  bulan: number;
  tahun: number;
  rekap: Record<string, SantriSummary>;
};

export const RekapBulananScreen = () => {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null);
  const [rekapData, setRekapData] = useState<RekapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRekap, setLoadingRekap] = useState(false);
  const [bulan, setBulan] = useState<number>(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState<number>(2026);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<{
    name: string;
    detail: AbsensiDetail[];
  } | null>(null);
  const [selectedSantriModal, setSelectedSantriModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredSantri, setFilteredSantri] = useState<
    [string, SantriSummary][]
  >([]);

  const bulanNama = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  // Ambil token
  const getToken = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('User belum login');
    return token;
  };

  // Ambil kelas
  const fetchKelas = async () => {
    try {
      setLoading(true);
      const res = await axios.get<{ success: boolean; data: Kelas[] }>(
        `${API}/kelas`,
      );

      if (res.data.success) {
        setKelasList(res.data.data);
      } else {
        setKelasList([]);
      }
    } catch (e) {
      console.error(e);
      setKelasList([]);
    } finally {
      setLoading(false);
    }
  };

  // Ambil rekap untuk kelas yang dipilih
  const fetchRekap = async (kelasId: number) => {
    if (!kelasId) return;

    try {
      setLoadingRekap(true);
      const token = await getToken();
      const res = await axios.get<RekapResponse>(
        `${API}/absensi/kelas/${kelasId}?bulan=${bulan}&tahun=${tahun}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRekapData(res.data);
      // Reset pencarian saat data baru dimuat
      setSearchQuery('');
      setFilteredSantri(Object.entries(res.data.rekap));
    } catch (err) {
      console.error(`Error fetch rekap kelas ${kelasId}:`, err);
      setRekapData(null);
      setFilteredSantri([]);
    } finally {
      setLoadingRekap(false);
    }
  };

  // Mount pertama: ambil kelas
  useEffect(() => {
    fetchKelas();
  }, []);

  useEffect(() => {
    if (kelasList.length > 0 && !selectedKelas) {
      setSelectedKelas(kelasList[0]);
    }
  }, [kelasList]);

  // Ambil rekap ketika kelas, bulan, atau tahun berubah
  useEffect(() => {
    if (selectedKelas) {
      fetchRekap(selectedKelas.id);
    }
  }, [selectedKelas, bulan, tahun]);

  // Filter santri berdasarkan pencarian
  useEffect(() => {
    if (rekapData && rekapData.rekap) {
      if (searchQuery.trim() === '') {
        setFilteredSantri(Object.entries(rekapData.rekap));
      } else {
        const filtered = Object.entries(rekapData.rekap).filter(
          ([santriName]) =>
            santriName.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setFilteredSantri(filtered);
      }
    }
  }, [searchQuery, rekapData]);

  useFocusEffect(
  useCallback(() => {
    // Refresh data kelas dan rekap ketika screen difokuskan
    fetchKelas();

    // Jika sudah ada kelas yang dipilih, ambil rekapnya
    if (selectedKelas) {
      fetchRekap(selectedKelas.id);
    }
  }, [selectedKelas])
);

  // Render status dengan warna
  const renderStatus = (status: string) => {
    let color = '#64748B';
    let bgColor = '#F1F5F9';

    switch (status.toLowerCase()) {
      case 'hadir':
        color = '#10B981';
        bgColor = '#D1FAE5';
        break;
      case 'sakit':
        color = '#F59E0B';
        bgColor = '#FEF3C7';
        break;
      case 'izin':
        color = '#3B82F6';
        bgColor = '#DBEAFE';
        break;
      case 'alpha':
        color = '#EF4444';
        bgColor = '#FEE2E2';
        break;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <Text style={[styles.statusText, { color }]}>{status}</Text>
      </View>
    );
  };

  // Render progress bar untuk AI confidence
  const renderConfidenceBar = (confidence: number) => {
    const width = Math.min(confidence * 100, 100);
    let color = '#10B981'; // default hijau (untuk rendah)

    if (confidence >= 0.8) {
      color = '#EF4444'; // merah untuk tinggi
    } else if (confidence >= 0.6) {
      color = '#F59E0B'; // kuning untuk sedang
    }

    return (
      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceBarBackground}>
          <View
            style={[
              styles.confidenceBarFill,
              { width: `${width}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={styles.confidenceText}>
          {Math.round(confidence * 100)}%
        </Text>
      </View>
    );
  };

  // Render kartu detail absensi
  const renderDetailCard = (detail: AbsensiDetail) => {
    return (
      <View style={styles.detailCard} key={detail.tanggal}>
        <View style={styles.detailCardHeader}>
          <Text style={styles.detailDate}>
            {new Date(detail.tanggal).toLocaleDateString('id-ID', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
          {renderStatus(detail.status)}
        </View>

        {detail.alasan && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Alasan:</Text>
            <Text style={styles.detailValue}>{detail.alasan}</Text>
          </View>
        )}
      </View>
    );
  };

  // Modal untuk lihat detail santri
  const renderSantriModal = () => {
    if (!selectedSantri) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedSantriModal}
        onRequestClose={() => setSelectedSantriModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Detail Absensi - {selectedSantri.name}
              </Text>
              <TouchableOpacity onPress={() => setSelectedSantriModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedSantri.detail.map(renderDetailCard)}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render pilihan kelas
  const renderKelasSelector = () => {
    if (kelasList.length <= 1) return null;

    return (
      <View style={styles.kelasSelector}>
        <Text style={styles.sectionLabel}>Pilih Kelas</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kelasScrollContent}
        >
          {kelasList.map(kelas => (
            <TouchableOpacity
              key={kelas.id}
              style={[
                styles.kelasItem,
                selectedKelas?.id === kelas.id && styles.kelasItemActive,
              ]}
              onPress={() => setSelectedKelas(kelas)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.kelasItemText,
                  selectedKelas?.id === kelas.id && styles.kelasItemTextActive,
                ]}
                numberOfLines={1}
              >
                {kelas.namaKelas}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render pilihan bulan dan tahun
  const renderMonthYearSelector = () => {
    // Generate tahun mulai dari 2024 hingga 2035 untuk jangka panjang
    const startYear = 2026;
    const endYear = 2035;
    const years = Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i,
    );

    return (
      <View style={styles.dateSelector}>
        <Text style={styles.sectionLabel}>Pilih Periode</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.monthSelector}
        >
          {bulanNama.map((nama, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                bulan === index + 1 && styles.dateButtonActive,
              ]}
              onPress={() => setBulan(index + 1)}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  bulan === index + 1 && styles.dateButtonTextActive,
                ]}
              >
                {nama.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.yearSelector}
        >
          {years.map(year => (
            <TouchableOpacity
              key={year}
              style={[
                styles.dateButton,
                tahun === year && styles.dateButtonActive,
              ]}
              onPress={() => setTahun(year)}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  tahun === year && styles.dateButtonTextActive,
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render search bar
  const renderSearchBar = () => {
    if (!rekapData || !rekapData.rekap) return null;

    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari santri..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.searchInfo}>
          {filteredSantri.length} dari {Object.keys(rekapData.rekap).length}{' '}
          santri ditemukan
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5D5FEF" />
        <Text style={styles.loadingText}>Memuat data kelas...</Text>
      </View>
    );
  }

  if (!kelasList.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Tidak ada kelas tersedia</Text>
      </View>
    );
  }

  if (!selectedKelas) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Silakan pilih kelas</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.container}>


        {/* Container untuk filter yang lebih kompak */}
        <View style={styles.filterContainer}>
          {renderKelasSelector()}
          {renderMonthYearSelector()}
          {renderSearchBar()}
        </View>

        {loadingRekap ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#5D5FEF" />
            <Text style={styles.loadingText}>Memuat rekap absensi...</Text>
          </View>
        ) : !rekapData || !rekapData.rekap ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>
              Tidak ada data absensi untuk periode ini
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredSantri}
            keyExtractor={([santriName]) => santriName}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: [santriName, summary] }) => (
              <View style={styles.santriCard}>
                <View style={styles.santriHeader}>
                  <Text style={styles.santriName}>{santriName}</Text>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => {
                      setSelectedSantri({
                        name: santriName,
                        detail: summary.detail,
                      });
                      setSelectedSantriModal(true);
                    }}
                  >
                    <Text style={styles.detailButtonText}>Lihat Detail</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.summaryContainer}>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, styles.hadir]}>
                      {summary.hadir}
                    </Text>
                    <Text style={styles.summaryLabel}>Hadir</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, styles.sakit]}>
                      {summary.sakit}
                    </Text>
                    <Text style={styles.summaryLabel}>Sakit</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, styles.izin]}>
                      {summary.izin}
                    </Text>
                    <Text style={styles.summaryLabel}>Izin</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, styles.alpha]}>
                      {summary.alpha}
                    </Text>
                    <Text style={styles.summaryLabel}>Alpha</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, styles.total]}>
                      {summary.total}
                    </Text>
                    <Text style={styles.summaryLabel}>Total</Text>
                  </View>
                </View>

                {/* Preview 2 data terbaru */}
                {summary.detail.slice(0, 2).map(renderDetailCard)}

                {summary.detail.length > 2 && (
                  <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => {
                      setSelectedSantri({
                        name: santriName,
                        detail: summary.detail,
                      });
                      setSelectedSantriModal(true);
                    }}
                  >
                    <Text style={styles.moreButtonText}>
                      +{summary.detail.length - 2} data lainnya
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Text style={styles.errorText}>
                  {searchQuery
                    ? 'Tidak ada santri yang cocok dengan pencarian'
                    : 'Tidak ada data absensi'}
                </Text>
              </View>
            }
          />
        )}

        {renderSantriModal()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Container untuk filter yang kompak
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Header yang lebih kompak
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 6 : 10,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  // Kelas selector yang lebih kompak
  kelasSelector: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  kelasScrollContent: {
    paddingRight: 16,
  },
  kelasItem: {
    minWidth: 70,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kelasItemActive: {
    backgroundColor: '#5D5FEF',
    borderColor: '#5D5FEF',
  },
  kelasItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  kelasItemTextActive: {
    color: '#FFFFFF',
  },
  // Date selector yang lebih kompak
  dateSelector: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
  },
  monthSelector: {
    marginBottom: 6,
  },
  yearSelector: {
    marginBottom: 0,
  },
  dateButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  dateButtonActive: {
    backgroundColor: '#5D5FEF',
  },
  dateButtonText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  dateButtonTextActive: {
    color: '#FFFFFF',
  },
  // Search bar yang lebih kompak
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchInputContainer: {
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: '#1E293B',
    paddingRight: 40,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  searchInfo: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  // List content dengan padding yang lebih sedikit
  listContent: {
    padding: 12,
    paddingBottom: 100,
  },
  santriCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  santriHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  santriName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  detailButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
  },
  detailButtonText: {
    fontSize: 11,
    color: '#5D5FEF',
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  hadir: {
    color: '#10B981',
  },
  sakit: {
    color: '#F59E0B',
  },
  izin: {
    color: '#3B82F6',
  },
  alpha: {
    color: '#EF4444',
  },
  total: {
    color: '#5D5FEF',
  },
  detailCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    width: 100,
  },
  detailValue: {
    fontSize: 12,
    color: '#1E293B',
    flex: 1,
  },
  toneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  toneText: {
    fontSize: 11,
    fontWeight: '500',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  confidenceBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 12,
    color: '#64748B',
    minWidth: 30,
  },
  moreButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  moreButtonText: {
    fontSize: 14,
    color: '#5D5FEF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  modalClose: {
    fontSize: 20,
    color: '#64748B',
    paddingHorizontal: 8,
  },
  modalScroll: {
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
});