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
  Platform
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

// Types
import { ApiResponse } from '../types/task';

// Define CreateTaskRequest type locally
interface CreateTaskRequest {
  title: string;
  description: string;
  subject: string;
  deadline: string;
  assigned_to: number[];
  attachment_url?: string;
}

interface Santri {
  id: number;
  name: string;
  email?: string;
  class?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// API Configuration
const API_BASE_URL = 'https://api.santrinavigator.com/v1';

const TaskPengajar: React.FC = () => {
  const navigation = useNavigation();

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loadingSantri, setLoadingSantri] = useState<boolean>(true);

  // Form State
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    subject: '',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: [],
    attachment_url: ''
  });

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  // Fetch santri list on component mount
  useEffect(() => {
    fetchSantriList();
  }, []);

  // Fetch santri list
  const fetchSantriList = useCallback(async (): Promise<void> => {
    try {
      setLoadingSantri(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Sesi telah berakhir. Silakan login kembali.');
        return;
      }

      const response = await axios.get<ApiResponse<Santri[]>>(`${API_BASE_URL}/santri`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.success) {
        setSantriList(response.data.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<Santri[]>>;
      console.error('Error fetching santri:', axiosError.message);
      
      if (axiosError.response?.status === 401) {
        Alert.alert('Sesi Berakhir', 'Silakan login kembali');
      } else {
        Alert.alert('Error', 'Gagal memuat daftar santri');
      }
    } finally {
      setLoadingSantri(false);
    }
  }, []);

  // Handle date change
  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      setFormData({
        ...formData,
        deadline: date.toISOString()
      });
    }
  };

  // Handle form input change
  const handleInputChange = (field: keyof CreateTaskRequest, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Handle santri selection
  const handleSantriSelection = (santriId: number) => {
    const currentAssigned = [...formData.assigned_to];
    const index = currentAssigned.indexOf(santriId);
    
    if (index > -1) {
      // Remove if already selected
      currentAssigned.splice(index, 1);
    } else {
      // Add if not selected
      currentAssigned.push(santriId);
    }
    
    setFormData({
      ...formData,
      assigned_to: currentAssigned
    });
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

    if (formData.assigned_to.length === 0) {
      Alert.alert('Peringatan', 'Pilih minimal satu santri');
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
        deadline: new Date(formData.deadline).toISOString()
      };

      const response = await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/tasks`,
        taskData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        Alert.alert(
          'Sukses',
          'Tugas berhasil dibuat!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setFormData({
                  title: '',
                  description: '',
                  subject: '',
                  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  assigned_to: [],
                  attachment_url: ''
                });
                setSelectedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
                
                // Navigate back
                navigation.goBack();
              }
            }
          ]
        );
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

  // Format date for display
  const formatDateDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render santri selection
  const renderSantriSelection = () => {
    if (loadingSantri) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3498db" />
          <Text style={styles.loadingText}>Memuat daftar santri...</Text>
        </View>
      );
    }

    return (
      <View style={styles.santriSelectionContainer}>
        <Text style={styles.sectionTitle}>Pilih Santri</Text>
        <Text style={styles.sectionSubtitle}>
          {formData.assigned_to.length} santri terpilih
        </Text>
        
        <ScrollView 
          style={styles.santriList}
          showsVerticalScrollIndicator={false}
        >
          {santriList.map((santri) => {
            const isSelected = formData.assigned_to.includes(santri.id);
            
            return (
              <TouchableOpacity
                key={santri.id}
                style={[
                  styles.santriItem,
                  isSelected && styles.santriItemSelected
                ]}
                onPress={() => handleSantriSelection(santri.id)}
                activeOpacity={0.7}
              >
                <View style={styles.santriInfo}>
                  <Text style={styles.santriName}>{santri.name}</Text>
                  <Text style={styles.santriClass}>Kelas: {santri.class || '-'}</Text>
                </View>
                <View style={[
                  styles.selectionIndicator,
                  isSelected && styles.selectionIndicatorSelected
                ]}>
                  {isSelected && (
                    <Icon name="check" type="font-awesome" size={14} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Render form
  const renderForm = () => (
    <ScrollView 
      style={styles.formContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.formContent}
    >
      {/* Title Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Judul Tugas *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Masukkan judul tugas"
          value={formData.title}
          onChangeText={(text) => handleInputChange('title', text)}
          maxLength={100}
        />
        <Text style={styles.charCounter}>
          {formData.title.length}/100 karakter
        </Text>
      </View>

      {/* Subject Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Mata Pelajaran *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.subject}
            onValueChange={(value) => handleInputChange('subject', value)}
            style={styles.picker}
          >
            <Picker.Item label="Pilih Mata Pelajaran" value="" />
            <Picker.Item label="Al-Qur'an" value="Al-Qur'an" />
            <Picker.Item label="Hadits" value="Hadits" />
            <Picker.Item label="Fiqih" value="Fiqih" />
            <Picker.Item label="Aqidah" value="Aqidah" />
            <Picker.Item label="Akhlak" value="Akhlak" />
            <Picker.Item label="Bahasa Arab" value="Bahasa Arab" />
            <Picker.Item label="Nahwu" value="Nahwu" />
            <Picker.Item label="Shorof" value="Shorof" />
            <Picker.Item label="Sejarah Islam" value="Sejarah Islam" />
            <Picker.Item label="Tahfidz" value="Tahfidz" />
            <Picker.Item label="Lainnya" value="Lainnya" />
          </Picker>
        </View>
      </View>

      {/* Description Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Deskripsi Tugas *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Jelaskan detail tugas yang harus dikerjakan..."
          value={formData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.charCounter}>
          {formData.description.length}/500 karakter
        </Text>
      </View>

      {/* Deadline Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Deadline *</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Icon name="calendar" type="font-awesome" size={20} color="#3498db" />
          <Text style={styles.dateText}>
            {formatDateDisplay(formData.deadline)}
          </Text>
          <Icon name="chevron-right" type="font-awesome" size={16} color="#95a5a6" />
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      {/* Attachment URL Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Link Materi (Opsional)</Text>
        <Text style={styles.inputSubLabel}>
          Google Drive, YouTube, atau link materi pendukung
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="https://drive.google.com/..."
          value={formData.attachment_url}
          onChangeText={(text) => handleInputChange('attachment_url', text)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </View>

      {/* Santri Selection */}
      {renderSantriSelection()}

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Button
          title={submitting ? "Membuat Tugas..." : "Buat Tugas"}
          onPress={handleSubmit}
          disabled={submitting}
          buttonStyle={styles.submitButton}
          loading={submitting}
          loadingProps={{ color: '#fff', size: 'small' }}
          icon={
            <Icon
              name="plus-circle"
              type="font-awesome"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
          }
        />
        
        <Button
          title="Batal"
          onPress={() => navigation.goBack()}
          type="outline"
          buttonStyle={styles.cancelButton}
          titleStyle={styles.cancelButtonText}
          disabled={submitting}
        />
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" type="font-awesome" size={20} color="#2c3e50" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Tambah Tugas Baru</Text>
          <Text style={styles.headerSubtitle}>Untuk Santri</Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Memuat...</Text>
        </View>
      ) : (
        renderForm()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7f8c8d',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  inputSubLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbdb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCounter: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'right',
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbdb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbdb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
  },
  santriSelectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 12,
    fontWeight: '500',
  },
  santriList: {
    maxHeight: 200,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  santriItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  santriItemSelected: {
    backgroundColor: '#ebf5fb',
  },
  santriInfo: {
    flex: 1,
  },
  santriName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  santriClass: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d5dbdb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicatorSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  submitContainer: {
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 12,
  },
  cancelButton: {
    borderColor: '#95a5a6',
    borderRadius: 8,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#7f8c8d',
  },
});

export default TaskPengajar;