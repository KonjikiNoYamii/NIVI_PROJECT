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

// Types
import { ApiResponse } from '../../types/task';

// Define CreateTaskRequest type locally
interface CreateTaskRequest {
  title: string;
  description: string;
  subject: string;
  deadline: string;
  kelasId: number | null;
  attachment_url?: string;
}

interface Kelas {
  id: number;
  namaKelas: string;
}

// Mata Pelajaran Options
const SUBJECTS = [
  "Al-Qur'an", "Hadits", "Fiqih", "Aqidah", "Akhlak", 
  "Bahasa Arab", "Nahwu", "Shorof", "Sejarah Islam", 
  "Tahfidz", "Bahasa Inggris", "Matematika", "IPA", 
  "IPS", "Seni Budaya", "PJOK", "Lainnya"
];

// API Configuration
const API_BASE_URL = 'https://nivi-production.up.railway.app/api';

const TaskPengajar: React.FC = () => {
  const navigation = useNavigation();

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loadingKelas, setLoadingKelas] = useState<boolean>(true);
  
  // Modal states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    subject: '',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    kelasId: null,
    attachment_url: '',
  });

  // Date picker state
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );

  // Fetch kelas list on component mount
  useEffect(() => {
    fetchKelasList();
  }, []);

  // Fetch kelas list
  const fetchKelasList = useCallback(async () => {
    try {
      setLoadingKelas(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await axios.get<ApiResponse<Kelas[]>>(
        `${API_BASE_URL}/kelas/`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setKelasList(res.data.data);
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal memuat daftar kelas');
    } finally {
      setLoadingKelas(false);
    }
  }, []);

  // Handle date change
  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') setShowDateModal(false);
    
    if (event.type === 'set' && date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        deadline: date.toISOString(),
      }));
    }
  };

  // Handle form input change
  const handleInputChange = (field: keyof CreateTaskRequest, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Select subject
  const selectSubject = (subject: string) => {
    setFormData(prev => ({ ...prev, subject }));
    setShowSubjectModal(false);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Peringatan', 'Judul tugas harus diisi');
      return false;
    }

    if (!formData.description.trim()) {
      Alert.alert('Peringatan', 'Deskripsi tugas harus diisi');
      return false;
    }

    if (!formData.subject.trim()) {
      Alert.alert('Peringatan', 'Mata pelajaran harus diisi');
      return false;
    }

    if (!formData.kelasId) {
      Alert.alert('Peringatan', 'Pilih kelas terlebih dahulu');
      return false;
    }

    if (!formData.deadline) {
      Alert.alert('Peringatan', 'Deadline harus diisi');
      return false;
    }

    // Check if deadline is in the future
    const deadlineDate = new Date(formData.deadline);
    const now = new Date();
    if (deadlineDate <= now) {
      Alert.alert('Peringatan', 'Deadline harus di masa depan');
      return false;
    }

    return true;
  };

  // Submit form
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert('Error', 'Sesi telah berakhir');
        return;
      }

      // Prepare data for API
      const taskData = {
        ...formData,
        deadline: new Date(formData.deadline).toISOString(),
      };

      const response = await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/tugas`,
        taskData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.success) {
        Alert.alert('Sukses', 'Tugas berhasil dibuat!', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                title: '',
                description: '',
                subject: '',
                deadline: new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000,
                ).toISOString(),
                kelasId: null,
                attachment_url: '',
              });
              setSelectedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<any>>;
      console.error('Error creating task:', axiosError.response?.data);

      let errorMessage = 'Gagal membuat tugas';
      if (axiosError.response?.status === 400) {
        errorMessage = 'Data tidak valid. Periksa kembali input Anda.';
      } else if (axiosError.response?.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk membuat tugas';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Render kelas selection
  const renderKelasSelection = () => {
    if (loadingKelas) {
      return (
        <View style={styles.loadingKelasContainer}>
          <ActivityIndicator size="small" color="#3498db" />
          <Text style={styles.loadingKelasText}>Memuat daftar kelas...</Text>
        </View>
      );
    }

    return (
      <View style={styles.kelasSection}>
        <Text style={styles.sectionTitle}>Pilih Kelas</Text>
        <Text style={styles.sectionSubtitle}>Pilih salah satu kelas untuk menerima tugas ini</Text>
        
        <View style={styles.kelasGrid}>
          {kelasList.map(kelas => {
            const selected = formData.kelasId === kelas.id;
            return (
              <TouchableOpacity
                key={kelas.id}
                style={[
                  styles.kelasCard,
                  selected && styles.kelasCardSelected,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, kelasId: kelas.id }))}
                activeOpacity={0.7}
              >
                <View style={styles.kelasIconContainer}>
                  <Icon 
                    name="users" 
                    type="font-awesome" 
                    size={20} 
                    color={selected ? "#fff" : "#3498db"} 
                  />
                </View>
                <Text style={[
                  styles.kelasName,
                  selected && styles.kelasNameSelected
                ]}>
                  {kelas.namaKelas}
                </Text>
                {selected && (
                  <View style={styles.selectedIndicator}>
                    <Icon name="check" type="font-awesome" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Subject Modal
  const renderSubjectModal = () => (
    <Modal
      visible={showSubjectModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSubjectModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pilih Mata Pelajaran</Text>
            <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
              <Icon name="times" type="font-awesome" size={20} color="#7f8c8d" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.subjectList}>
            {SUBJECTS.map((subject, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.subjectItem,
                  formData.subject === subject && styles.subjectItemSelected,
                ]}
                onPress={() => selectSubject(subject)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.subjectText,
                  formData.subject === subject && styles.subjectTextSelected,
                ]}>
                  {subject}
                </Text>
                {formData.subject === subject && (
                  <Icon name="check" type="font-awesome" size={16} color="#3498db" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" type="font-awesome" size={20} color="#2c3e50" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Buat Tugas Baru</Text>
            <Text style={styles.headerSubtitle}>Buat tugas untuk santri</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Judul Tugas <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Icon name="edit" type="font-awesome" size={16} color="#95a5a6" />
              <TextInput
                style={styles.textInput}
                placeholder="Masukkan judul tugas"
                placeholderTextColor="#bdc3c7"
                value={formData.title}
                onChangeText={text => handleInputChange('title', text)}
                maxLength={100}
                editable={!submitting}
              />
            </View>
            <Text style={styles.charCounter}>
              {formData.title.length}/100 karakter
            </Text>
          </View>

          {/* Subject Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Mata Pelajaran <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.selectInput,
                !formData.subject && styles.selectInputEmpty,
              ]}
              onPress={() => setShowSubjectModal(true)}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Icon name="book" type="font-awesome" size={16} color="#95a5a6" />
              <Text style={[
                styles.selectText,
                !formData.subject && styles.placeholderText,
              ]}>
                {formData.subject || 'Pilih mata pelajaran'}
              </Text>
              <Icon name="chevron-down" type="font-awesome" size={14} color="#95a5a6" />
            </TouchableOpacity>
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Deskripsi Tugas <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Icon name="align-left" type="font-awesome" size={16} color="#95a5a6" />
              <TextInput
                style={styles.textArea}
                placeholder="Jelaskan detail tugas yang harus dikerjakan..."
                placeholderTextColor="#bdc3c7"
                value={formData.description}
                onChangeText={text => handleInputChange('description', text)}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                editable={!submitting}
              />
            </View>
            <Text style={styles.charCounter}>
              {formData.description.length}/500 karakter
            </Text>
          </View>

          {/* Deadline Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Deadline <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => Platform.OS === 'ios' ? setShowDateModal(true) : setShowDateModal(true)}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Icon name="calendar" type="font-awesome" size={16} color="#95a5a6" />
              <Text style={styles.dateText}>
                {formatDate(selectedDate)}
              </Text>
              <Icon name="chevron-right" type="font-awesome" size={14} color="#95a5a6" />
            </TouchableOpacity>
          </View>

          {/* Attachment URL Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Link Materi (Opsional)</Text>
            <Text style={styles.inputHint}>
              Google Drive, YouTube, atau link materi pendukung
            </Text>
            <View style={styles.inputContainer}>
              <Icon name="link" type="font-awesome" size={16} color="#95a5a6" />
              <TextInput
                style={styles.textInput}
                placeholder="https://drive.google.com/..."
                placeholderTextColor="#bdc3c7"
                value={formData.attachment_url}
                onChangeText={text => handleInputChange('attachment_url', text)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                editable={!submitting}
              />
            </View>
          </View>

          {/* Kelas Selection */}
          {renderKelasSelection()}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.9}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="plus-circle" type="font-awesome" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Buat Tugas</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Batalkan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Subject Modal */}
      {renderSubjectModal()}

      {/* Date Picker Modal for iOS */}
      {showDateModal && Platform.OS === 'ios' && (
        <Modal
          visible={showDateModal}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.dateModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pilih Deadline</Text>
                <TouchableOpacity onPress={() => setShowDateModal(false)}>
                  <Icon name="check" type="font-awesome" size={20} color="#3498db" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={handleDateChange}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Date Picker for Android */}
      {showDateModal && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  // Form
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  inputHint: {
    fontSize: 13,
    color: '#95a5a6',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
    minHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'right',
    marginTop: 6,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectInputEmpty: {
    borderColor: '#dfe6e9',
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
  },
  placeholderText: {
    color: '#bdc3c7',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
  },
  // Kelas Selection
  kelasSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  loadingKelasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
  },
  loadingKelasText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 12,
  },
  kelasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  kelasCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
  },
  kelasCardSelected: {
    backgroundColor: '#ebf5fb',
    borderColor: '#3498db',
  },
  kelasIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ebf5fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  kelasName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  kelasNameSelected: {
    color: '#3498db',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Actions
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#b0d4f0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d5dbdb',
    backgroundColor: '#ffffff',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  dateModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  subjectList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: 400,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  subjectItemSelected: {
    backgroundColor: '#f8f9fa',
  },
  subjectText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  subjectTextSelected: {
    color: '#3498db',
    fontWeight: '600',
  },
  datePicker: {
    width: '100%',
    backgroundColor: '#ffffff',
  },
});

export default TaskPengajar;