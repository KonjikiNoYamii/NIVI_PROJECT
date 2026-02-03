import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API } from '../../services/api';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

/* ================== ENUM ================== */
type Hari =
  | 'senin'
  | 'selasa'
  | 'rabu'
  | 'kamis'
  | 'jumat'
  | 'sabtu'
  | 'minggu';

const HARI_MAP: Hari[] = [
  'minggu',
  'senin',
  'selasa',
  'rabu',
  'kamis',
  'jumat',
  'sabtu',
];

const getHariFromTanggal = (d: Date): Hari => HARI_MAP[d.getDay()];

/* ================== CUSTOM DROPDOWN COMPONENT ================== */
interface DropdownProps {
  label: string;
  value: any;
  items: { label: string; value: any }[];
  onSelect: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CustomDropdown: React.FC<DropdownProps> = ({
  label,
  value,
  items,
  onSelect,
  placeholder = 'Pilih...',
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel =
    items.find(item => item.value === value)?.label || placeholder;

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdownContainer, disabled && styles.disabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownLabel}>{label}</Text>
        <View style={styles.dropdownValueContainer}>
          <Text
            style={[styles.dropdownValue, !value && styles.placeholderText]}
          >
            {selectedLabel}
          </Text>
          <Ionicons
            name={modalVisible ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={disabled ? '#9ca3af' : '#3b82f6'}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    value === item.value && styles.selectedItem,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      value === item.value && styles.selectedItemText,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {value === item.value && (
                    <Ionicons name="checkmark" size={20} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

/* ================== TIME SELECTOR COMPONENT ================== */
interface TimeSelectorProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  options: string[];
  disabled?: boolean;
  highlightInvalid?: boolean;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  label,
  value,
  onSelect,
  options,
  disabled = false,
  highlightInvalid = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.timeSelectorContainer, disabled && styles.disabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownLabel}>{label}</Text>
        <View style={styles.timeValueContainer}>
          <Text style={styles.timeValue}>{value}</Text>
          <Ionicons
            name={modalVisible ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={disabled ? '#9ca3af' : '#3b82f6'}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: height * 0.6 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.timeItem,
                    value === item && styles.selectedTimeItem,
                    highlightInvalid && { opacity: 0.5 },
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                  disabled={highlightInvalid}
                >
                  <Text
                    style={[
                      styles.timeItemText,
                      value === item && styles.selectedTimeItemText,
                    ]}
                  >
                    {item}
                  </Text>
                  {value === item && (
                    <Ionicons name="checkmark" size={20} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

/* ================== GUIDANCE COMPONENT ================== */
const GuidanceCard: React.FC = () => {
  const steps = [
    {
      icon: 'school-outline',
      title: 'Pilih Kelas',
      description: 'Pilih kelas yang akan diatur jadwal absensinya',
      color: '#3b82f6',
    },
    {
      icon: 'settings-outline',
      title: 'Atur Batas Absensi',
      description: 'Tentukan jumlah maksimal absensi per semester',
      color: '#10b981',
    },
    {
      icon: 'calendar-outline',
      title: 'Buat Jadwal',
      description: 'Tambahkan jadwal pertemuan dengan tanggal dan waktu',
      color: '#8b5cf6',
    },
    {
      icon: 'checkmark-done-outline',
      title: 'Verifikasi',
      description: 'Pastikan tidak ada jadwal yang bentrok',
      color: '#f59e0b',
    },
  ];

  return (
    <View style={styles.guidanceCard}>
      <View style={styles.guidanceHeader}>
        <View style={[styles.iconContainer, { backgroundColor: '#3b82f610' }]}>
          <Ionicons name="book-outline" size={24} color="#3b82f6" />
        </View>
        <View>
          <Text style={styles.guidanceTitle}>Panduan Membuat Jadwal</Text>
          <Text style={styles.guidanceSubtitle}>
            Ikuti langkah-langkah berikut untuk membuat jadwal absensi
          </Text>
        </View>
      </View>

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={styles.stepNumberContainer}>
              <View
                style={[
                  styles.stepNumber,
                  { backgroundColor: step.color + '20' },
                ]}
              >
                <Ionicons name={step.icon} size={16} color={step.color} />
              </View>
              {index < steps.length - 1 && (
                <View style={styles.stepConnector} />
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.tipsContainer}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb-outline" size={18} color="#f59e0b" />
          <Text style={styles.tipsTitle}>Tips Penting</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.tipText}>
            Pastikan max absensi diatur sebelum membuat jadwal
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.tipText}>
            Periksa jadwal yang sudah ada untuk menghindari bentrok
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.tipText}>
            Jam mulai harus lebih awal dari jam selesai
          </Text>
        </View>
      </View>
    </View>
  );
};

/* ================== SCREEN ================== */
export default function CreateJadwalScreen() {
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [kelasId, setKelasId] = useState<number | null>(null);

  const [absensiSetting, setAbsensiSetting] = useState<any | null>(null);
  const [maxAbsen, setMaxAbsen] = useState<string>('');

  const [tanggal, setTanggal] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('09:00');

  const [loading, setLoading] = useState(false);

  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [loadingJadwal, setLoadingJadwal] = useState(false);

  const sudahAdaJadwal = jadwalList.length > 0;
  const sudahPenuh =
    absensiSetting && jadwalList.length >= absensiSetting.maxAbsen;

  /* ================== FETCH KELAS ================== */
  useEffect(() => {
    fetchKelas();
  }, []);

  const authHeader = async () => ({
    headers: {
      Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
    },
  });

  const fetchKelas = async () => {
    const res = await axios.get(`${API}/kelas`, await authHeader());
    setKelasList(res.data.data);
  };

  /* ================== PILIH KELAS ================== */
  const onSelectKelas = async (id: number) => {
    setKelasId(id);
    setAbsensiSetting(null);
    setMaxAbsen('');
    setJadwalList([]);

    try {
      const res = await axios.get(
        `${API}/absensi-setting/kelas/${id}`,
        await authHeader(),
      );

      setAbsensiSetting(res.data.data);
      setMaxAbsen(String(res.data.data.maxAbsen));
      fetchJadwal(id);
    } catch {
      setAbsensiSetting(null);
    }
  };

  /* ================== JAM OPTIONS ================== */
  const jamOptions = useMemo(
    () =>
      Array.from({ length: 96 }, (_, i) => {
        const h = String(Math.floor(i / 4)).padStart(2, '0');
        const m = String((i % 4) * 15).padStart(2, '0');
        return `${h}:${m}`;
      }),
    [],
  );

  /* ================== SUBMIT ABSENSI SETTING ================== */
  const submitAbsensiSetting = async () => {
    if (!kelasId || !maxAbsen) {
      Alert.alert('Error', 'Max absen wajib diisi');
      return;
    }

    try {
      await axios.post(
        `${API}/absensi-setting/kelas/${kelasId}`,
        { maxAbsen: Number(maxAbsen) },
        await authHeader(),
      );

      setAbsensiSetting({ maxAbsen: Number(maxAbsen) });
      Alert.alert('Sukses', 'Absensi setting disimpan');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const fetchJadwal = async (id: number) => {
    setLoadingJadwal(true);
    try {
      const res = await axios.get(
        `${API}/jadwal/kelas/${id}`,
        await authHeader(),
      );
      setJadwalList(res.data.data);
    } catch {
      setJadwalList([]);
    } finally {
      setLoadingJadwal(false);
    }
  };

  /* ================== VALIDASI JAM ================== */
  const isValidJadwal = (mulai: string, selesai: string) => {
    if (mulai >= selesai) return false;
    return !jadwalList.some(
      j => !(selesai <= j.jamMulai || mulai >= j.jamSelesai),
    );
  };

  /* ================== SUBMIT JADWAL ================== */
  const submitJadwal = async () => {
    if (!kelasId) {
      Alert.alert('Error', 'Pilih kelas terlebih dahulu');
      return;
    }

    if (!isValidJadwal(jamMulai, jamSelesai)) {
      Alert.alert('Error', 'Jam tidak valid atau bentrok dengan jadwal lain!');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API}/jadwal`,
        {
          kelasId,
          tanggal: tanggal.toISOString(),
          hari: getHariFromTanggal(tanggal),
          jamMulai,
          jamSelesai,
        },
        await authHeader(),
      );

      await fetchJadwal(kelasId);
      Alert.alert('Sukses', 'Jadwal berhasil dibuat');
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
  useCallback(() => {
    // Refresh daftar kelas
    fetchKelas();

    // Jika sudah ada kelas yang dipilih, refresh jadwalnya juga
    if (kelasId) {
      fetchJadwal(kelasId);
    }

    // Cleanup opsional saat screen blur
    return () => {
      // Contoh: bisa reset loading state jika diperlukan
      // setLoadingJadwal(false);
    };
  }, [kelasId])
);

  /* ================== FORMAT ITEMS ================== */
  const kelasItems = [
    { label: '-- pilih kelas --', value: null },
    ...kelasList.map(k => ({ label: k.namaKelas, value: k.id })),
  ];

  /* ================== UI ================== */
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Buat Jadwal Absensi</Text>
          <Text style={styles.subtitle}>
            Kelola jadwal dan pengaturan absensi kelas
          </Text>
        </View>

        {/* FORM SECTION */}
        <View style={styles.formSection}>
          {/* PILIH KELAS */}
          <CustomDropdown
            label="Pilih Kelas"
            value={kelasId}
            items={kelasItems}
            onSelect={onSelectKelas}
            placeholder="Pilih kelas..."
          />

          {/* GUIDANCE CARD - Tampilkan sebelum memilih kelas */}
          {!kelasId && <GuidanceCard />}

          {/* FORM SECTION - Tampilkan setelah memilih kelas */}
          {kelasId && (
            <>
              {/* MAX ABSEN SECTION */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: '#3b82f610' },
                    ]}
                  >
                    <Ionicons
                      name="settings-outline"
                      size={20}
                      color="#3b82f6"
                    />
                  </View>
                  <Text style={styles.sectionTitle}>Pengaturan Absensi</Text>
                </View>

                {absensiSetting && (
                  <View style={styles.currentSetting}>
                    <Ionicons
                      name="information-circle-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.currentSettingText}>
                      Max absen saat ini:{' '}
                      <Text style={styles.highlight}>
                        {absensiSetting.maxAbsen}
                      </Text>
                    </Text>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Max Absensi per Semester</Text>
                  <TextInput
                    style={[
                      styles.input,
                      sudahAdaJadwal && styles.disabledInput,
                    ]}
                    keyboardType="number-pad"
                    value={maxAbsen}
                    onChangeText={setMaxAbsen}
                    editable={!sudahAdaJadwal}
                    placeholder="Misal: 16"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.secondaryButton,
                    sudahAdaJadwal && styles.disabledButton,
                  ]}
                  onPress={submitAbsensiSetting}
                  disabled={sudahAdaJadwal || loading}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={
                      sudahAdaJadwal ? 'lock-closed-outline' : 'save-outline'
                    }
                    size={20}
                    color={sudahAdaJadwal ? '#9ca3af' : '#3b82f6'}
                  />
                  <Text
                    style={[
                      styles.buttonText,
                      styles.secondaryButtonText,
                      sudahAdaJadwal && styles.disabledButtonText,
                    ]}
                  >
                    {sudahAdaJadwal
                      ? 'Terkunci'
                      : absensiSetting
                      ? 'Update'
                      : 'Simpan'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* FORM JADWAL */}
              {absensiSetting && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: '#10b98110' },
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#10b981"
                      />
                    </View>
                    <Text style={styles.sectionTitle}>Tambah Jadwal Baru</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tanggal</Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowDatePicker(true)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#3b82f6"
                      />
                      <Text style={styles.dateText}>
                        {tanggal.toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  </View>

                  {showDatePicker && (
                    <DateTimePicker
                      value={tanggal}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(_, d) => {
                        setShowDatePicker(false);
                        if (d) setTanggal(d);
                      }}
                    />
                  )}

                  <View style={styles.timeGroup}>
                    <View style={styles.timeInputHalf}>
                      <TimeSelector
                        label="Jam Mulai"
                        value={jamMulai}
                        onSelect={setJamMulai}
                        options={jamOptions}
                        highlightInvalid={!isValidJadwal(jamMulai, jamSelesai)}
                      />
                    </View>
                    <View style={styles.timeSpacer} />
                    <View style={styles.timeInputHalf}>
                      <TimeSelector
                        label="Jam Selesai"
                        value={jamSelesai}
                        onSelect={setJamSelesai}
                        options={jamOptions}
                        highlightInvalid={!isValidJadwal(jamMulai, jamSelesai)}
                      />
                    </View>
                  </View>

                  <View style={styles.validationInfo}>
                    {!isValidJadwal(jamMulai, jamSelesai) && (
                      <View style={styles.warningBox}>
                        <Ionicons
                          name="warning-outline"
                          size={16}
                          color="#f59e0b"
                        />
                        <Text style={styles.warningText}>
                          {jamMulai >= jamSelesai
                            ? 'Jam mulai harus lebih awal dari jam selesai'
                            : 'Jadwal bentrok dengan yang sudah ada'}
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.primaryButton,
                      (sudahPenuh ||
                        !isValidJadwal(jamMulai, jamSelesai) ||
                        loading) &&
                        styles.disabledButton,
                    ]}
                    onPress={submitJadwal}
                    disabled={
                      sudahPenuh ||
                      !isValidJadwal(jamMulai, jamSelesai) ||
                      loading
                    }
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name={
                            sudahPenuh ? 'ban-outline' : 'add-circle-outline'
                          }
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.buttonText}>
                          {sudahPenuh
                            ? 'Jadwal Penuh'
                            : !isValidJadwal(jamMulai, jamSelesai)
                            ? 'Jadwal Tidak Valid'
                            : 'Tambah Jadwal'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {sudahPenuh && (
                    <View style={styles.infoBox}>
                      <Ionicons
                        name="information-circle-outline"
                        size={16}
                        color="#3b82f6"
                      />
                      <Text style={styles.infoText}>
                        Jumlah jadwal sudah mencapai batas maksimal (
                        {absensiSetting.maxAbsen})
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* LIST JADWAL */}
              {absensiSetting && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: '#8b5cf610' },
                      ]}
                    >
                      <Ionicons name="list-outline" size={20} color="#8b5cf6" />
                    </View>
                    <View style={styles.jadwalHeader}>
                      <Text style={styles.sectionTitle}>Jadwal Kelas</Text>
                      <View style={styles.counterBadge}>
                        <Text style={styles.counterText}>
                          {jadwalList.length}/{absensiSetting.maxAbsen}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {loadingJadwal ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#3b82f6" />
                      <Text style={styles.loadingText}>Memuat jadwal...</Text>
                    </View>
                  ) : jadwalList.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons
                        name="calendar-outline"
                        size={48}
                        color="#d1d5db"
                      />
                      <Text style={styles.emptyStateText}>
                        Belum ada jadwal
                      </Text>
                      <Text style={styles.emptyStateSubtext}>
                        Tambah jadwal pertama Anda
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={jadwalList}
                      scrollEnabled={false}
                      keyExtractor={item => item.id.toString()}
                      renderItem={({ item }) => (
                        <View style={styles.jadwalCard}>
                          <View style={styles.jadwalCardHeader}>
                            <View style={styles.dateBadge}>
                              <Text style={styles.dateBadgeDay}>
                                {new Date(item.tanggal).toLocaleDateString(
                                  'id-ID',
                                  { day: '2-digit' },
                                )}
                              </Text>
                              <Text style={styles.dateBadgeMonth}>
                                {new Date(item.tanggal).toLocaleDateString(
                                  'id-ID',
                                  { month: 'short' },
                                )}
                              </Text>
                            </View>
                            <View style={styles.jadwalInfo}>
                              <Text style={styles.jadwalHari}>
                                {item.hari.charAt(0).toUpperCase() +
                                  item.hari.slice(1)}
                              </Text>
                              <Text style={styles.jadwalWaktu}>
                                {item.jamMulai} - {item.jamSelesai}
                              </Text>
                            </View>
                            <Ionicons
                              name="time-outline"
                              size={20}
                              color="#9ca3af"
                            />
                          </View>
                        </View>
                      )}
                    />
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================== STYLE ================== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: '#1e3a8a',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  formSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  jadwalHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dropdownValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  disabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.8,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedItem: {
    backgroundColor: '#eff6ff',
  },
  modalItemText: {
    fontSize: 16,
    color: '#4b5563',
    flex: 1,
  },
  selectedItemText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  currentSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  currentSettingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  highlight: {
    color: '#3b82f6',
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
    marginLeft: 12,
  },
  timeGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeInputHalf: {
    flex: 1,
  },
  timeSpacer: {
    width: 12,
  },
  timeSelectorContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  timeValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedTimeItem: {
    backgroundColor: '#eff6ff',
  },
  timeItemText: {
    fontSize: 16,
    color: '#4b5563',
    flex: 1,
  },
  selectedTimeItemText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  validationInfo: {
    marginBottom: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    marginLeft: 8,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#3b82f6',
  },
  disabledButton: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#3b82f6',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  jadwalCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  jadwalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBadge: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: 60,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 16,
  },
  dateBadgeDay: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  dateBadgeMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3b82f6',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  jadwalInfo: {
    flex: 1,
  },
  jadwalHari: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  jadwalWaktu: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  /* ================== GUIDANCE STYLES ================== */
  guidanceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    paddingRight:70,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  guidanceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  guidanceSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumberContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepConnector: {
    width: 2,
    height: 24,
    backgroundColor: '#e5e7eb',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});