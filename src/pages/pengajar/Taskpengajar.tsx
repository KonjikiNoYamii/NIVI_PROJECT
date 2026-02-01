import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  StatusBar,
} from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

import { ApiResponse } from '../../types/task';
import { API } from '../../services/api';

/* =======================
   TYPES
======================= */
interface Kelas {
  id: number;
  namaKelas: string;
}

interface MataPelajaran {
  id: number;
  nama: string;
  kode: string;
}

interface CreateTaskRequest {
  title: string;
  description: string;
  mapelId: number | null;
  deadline: string;
  kelasId: number | null;
  attachment_url?: string;
}

/* =======================
   COMPONENT
======================= */
const TaskPengajar: React.FC = () => {
  const navigation = useNavigation();

  const [submitting, setSubmitting] = useState(false);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [loadingMapel, setLoadingMapel] = useState(true);
  const [showMapelModal, setShowMapelModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );

  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    mapelId: null,
    deadline: selectedDate.toISOString(),
    kelasId: null,
    attachment_url: '',
  });

  /* =======================
     FETCH DATA
  ======================= */
  const fetchKelasList = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await axios.get<ApiResponse<Kelas[]>>(
        `${API}/kelas/all/pengajar`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setKelasList(res.data.data);
      }
    } catch {
      Alert.alert('Error', 'Gagal memuat kelas');
    } finally {
      setLoadingKelas(false);
    }
  }, []);

  const fetchMapel = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await axios.get<ApiResponse<MataPelajaran[]>>(
        `${API}/mapel`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setMapelList(res.data.data);
      }
    } catch {
      Alert.alert('Error', 'Gagal memuat mata pelajaran');
    } finally {
      setLoadingMapel(false);
    }
  }, []);

  useEffect(() => {
    fetchKelasList();
    fetchMapel();
  }, []);

  /* =======================
     HANDLER
  ======================= */
  const handleInputChange = (field: keyof CreateTaskRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowDateModal(false);
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        deadline: date.toISOString(),
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Peringatan', 'Judul wajib diisi');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Peringatan', 'Deskripsi wajib diisi');
      return false;
    }
    if (!formData.mapelId) {
      Alert.alert('Peringatan', 'Pilih mata pelajaran');
      return false;
    }
    if (!formData.kelasId) {
      Alert.alert('Peringatan', 'Pilih kelas');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API}/tugas`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      Alert.alert('Sukses', 'Tugas berhasil dibuat');
      navigation.goBack();
    } catch (e) {
      const err = e as AxiosError;
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMapel = mapelList.find(m => m.id === formData.mapelId);

  /* =======================
     RENDER
  ======================= */
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER YANG IKUT SCROLL */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Buat Tugas Baru</Text>
          <Text style={styles.headerSubtitle}>
            Form pembuatan tugas untuk santri
          </Text>
        </View>

        {/* FORM CARD */}
        <View style={styles.card}>
          {/* JUDUL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Judul Tugas</Text>
            <TextInput
              placeholder="Masukkan judul tugas"
              placeholderTextColor="#9ca3af"
              value={formData.title}
              onChangeText={t => handleInputChange('title', t)}
              style={styles.input}
            />
          </View>

          {/* MATA PELAJARAN */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mata Pelajaran</Text>
            <TouchableOpacity
              style={[
                styles.selectInput,
                !formData.mapelId && styles.selectInputEmpty,
              ]}
              onPress={() => setShowMapelModal(true)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.selectText,
                  !formData.mapelId && styles.placeholderText,
                ]}
              >
                {selectedMapel?.nama || 'Pilih mata pelajaran'}
              </Text>
              <Icon
                name="chevron-down"
                type="font-awesome"
                size={16}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>

          {/* DESKRIPSI */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deskripsi</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={t => handleInputChange('description', t)}
              placeholder="Tulis deskripsi tugas"
              placeholderTextColor="#9ca3af"
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {formData.description.length}/500
            </Text>
          </View>

          {/* DEADLINE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deadline</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDateModal(true)}
              activeOpacity={0.85}
            >
              <Icon
                name="calendar"
                type="font-awesome"
                size={16}
                color="#2563eb"
                style={styles.dateIcon}
              />
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Icon
                name="chevron-right"
                type="font-awesome"
                size={16}
                color="#9ca3af"
              />
            </TouchableOpacity>
          </View>

          {/* KELAS */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pilih Kelas</Text>
            {loadingKelas ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#2563eb" />
              </View>
            ) : (
              <View style={styles.kelasGrid}>
                {kelasList.map(k => (
                  <TouchableOpacity
                    key={k.id}
                    style={[
                      styles.kelasCard,
                      formData.kelasId === k.id && styles.kelasCardSelected,
                    ]}
                    onPress={() => handleInputChange('kelasId', k.id)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.kelasText,
                        formData.kelasId === k.id && styles.kelasTextSelected,
                      ]}
                    >
                      {k.namaKelas}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.button, submitting && styles.disabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>BUAT TUGAS</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* SPACER UNTUK NAVIGATOR */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* MAPEL MODAL */}
      <Modal
        visible={showMapelModal}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Mata Pelajaran</Text>
              <TouchableOpacity
                onPress={() => setShowMapelModal(false)}
                style={styles.modalCloseButton}
              >
                <Icon
                  name="times"
                  type="font-awesome"
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {mapelList.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.subjectItem,
                    formData.mapelId === m.id && styles.subjectItemSelected,
                  ]}
                  onPress={() => {
                    handleInputChange('mapelId', m.id);
                    setShowMapelModal(false);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={styles.subjectInfo}>
                    <View
                      style={[
                        styles.subjectIcon,
                        {
                          backgroundColor:
                            formData.mapelId === m.id ? '#2563eb' : '#f3f4f6',
                        },
                      ]}
                    >
                      <Icon
                        name="book"
                        type="font-awesome"
                        size={16}
                        color={formData.mapelId === m.id ? '#fff' : '#6b7280'}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.subjectName,
                          formData.mapelId === m.id &&
                            styles.subjectNameSelected,
                        ]}
                      >
                        {m.nama}
                      </Text>
                      <Text style={styles.subjectCode}>{m.kode}</Text>
                    </View>
                  </View>
                  {formData.mapelId === m.id && (
                    <Icon
                      name="check"
                      type="font-awesome"
                      size={16}
                      color="#2563eb"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DATE PICKER */}
      {showDateModal && (
        <Modal
          transparent
          animationType="fade"
          visible={showDateModal}
          onRequestClose={() => setShowDateModal(false)}
        >
          <View style={styles.dateModalOverlay}>
            <View style={styles.dateModalContent}>
              <View style={styles.dateModalHeader}>
                <Text style={styles.dateModalTitle}>Pilih Deadline</Text>
                <TouchableOpacity
                  onPress={() => setShowDateModal(false)}
                  style={styles.dateModalClose}
                >
                  <Icon
                    name="times"
                    type="font-awesome"
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                minimumDate={new Date()}
                onChange={handleDateChange}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                style={styles.datePicker}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.dateConfirmButton}
                  onPress={() => setShowDateModal(false)}
                >
                  <Text style={styles.dateConfirmText}>PILIH</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  scrollContent: {
    paddingBottom: 100, // Ditambahkan padding bottom yang cukup untuk navigator
  },

  header: {
    backgroundColor: '#1e3a8a',
    paddingTop: Platform.OS === 'android' ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },

  headerSubtitle: {
    marginTop: 6,
    color: '#c7d2fe',
    fontSize: 14,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#111827',
  },

  selectInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  selectInputEmpty: {
    borderColor: '#d1d5db',
  },

  selectText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },

  placeholderText: {
    color: '#9ca3af',
  },

  textArea: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
  },

  charCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },

  dateInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateIcon: {
    marginRight: 12,
  },

  dateText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },

  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },

  kelasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },

  kelasCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  kelasCardSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },

  kelasText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },

  kelasTextSelected: {
    color: '#1e40af',
    fontWeight: '700',
  },

  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10, // Ditambahkan margin bottom
  },

  disabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  spacer: {
    height: 100, // Tambahkan spacer untuk memberi ruang navigator
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },

  modalScroll: {
    padding: 20,
  },

  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },

  subjectItemSelected: {
    borderBottomColor: '#e5e7eb',
  },

  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  subjectName: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 2,
  },

  subjectNameSelected: {
    color: '#1e40af',
  },

  subjectCode: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },

  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  dateModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: Platform.OS === 'ios' ? 340 : 320,
    overflow: 'hidden',
  },

  dateModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  dateModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  dateModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },

  datePicker: {
    height: Platform.OS === 'ios' ? 200 : undefined,
  },

  dateConfirmButton: {
    padding: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },

  dateConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default TaskPengajar;
