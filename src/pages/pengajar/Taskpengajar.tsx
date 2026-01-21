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
        `${API}/kelas`,
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
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
  const handleInputChange = (
    field: keyof CreateTaskRequest,
    value: any
  ) => {
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

  const selectedMapel = mapelList.find(
    m => m.id === formData.mapelId
  );

  /* =======================
     RENDER
  ======================= */
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>


        {/* JUDUL */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Judul Tugas</Text>
          <TextInput
            style={styles.textInput}
            value={formData.title}
            onChangeText={t => handleInputChange('title', t)}
          />
        </View>

        {/* MAPEL */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mata Pelajaran</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowMapelModal(true)}
          >
            <Text style={styles.selectText}>
              {selectedMapel?.nama || 'Pilih mata pelajaran'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* DESKRIPSI */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Deskripsi</Text>
          <TextInput
            style={styles.textArea}
            multiline
            value={formData.description}
            onChangeText={t => handleInputChange('description', t)}
          />
        </View>

        {/* DEADLINE */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Deadline</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDateModal(true)}
          >
            <Text>
              {selectedDate.toLocaleDateString('id-ID')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* KELAS */}
        <Text style={styles.label}>Pilih Kelas</Text>
        {loadingKelas ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.kelasGrid}>
            {kelasList.map(k => (
              <TouchableOpacity
                key={k.id}
                style={[
                  styles.kelasCard,
                  formData.kelasId === k.id && styles.kelasCardSelected,
                ]}
                onPress={() =>
                  handleInputChange('kelasId', k.id)
                }
              >
                <Text>{k.namaKelas}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SUBMIT */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            Buat Tugas
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MAPEL MODAL */}
      <Modal visible={showMapelModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {mapelList.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.subjectItem}
                  onPress={() => {
                    handleInputChange('mapelId', m.id);
                    setShowMapelModal(false);
                  }}
                >
                  <Text>{m.nama}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DATE PICKER */}
      {showDateModal && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
};

/* =======================
   STYLES (UTUH)
======================= */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  inputGroup: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    height: 100,
    backgroundColor: '#fff',
  },
  selectInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#fff',
  },
  selectText: { fontSize: 14 },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#fff',
  },
  kelasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  kelasCard: {
    width: '45%',
    margin: 8,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  kelasCardSelected: {
    borderColor: '#3498db',
    backgroundColor: '#eaf4fd',
  },
  submitButton: {
    margin: 16,
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  subjectItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default TaskPengajar;
