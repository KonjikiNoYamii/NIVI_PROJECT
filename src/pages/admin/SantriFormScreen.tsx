import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { santriService } from '../../services/santriService';
import { CreateSantriDTO, UpdateSantriDTO } from '../../types/santri';

type RouteParams = {
  santriId?: string;
};

const SantriFormScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const params = route.params as RouteParams;
  const isEdit = !!params?.santriId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'lahir' | 'masuk'>('lahir');

  const [formData, setFormData] = useState<CreateSantriDTO>({
    nis: '',
    nama: '',
    jenisKelamin: 'L',
    tanggalLahir: new Date().toISOString().split('T')[0],
    tempatLahir: '',
    alamat: '',
    namaAyah: '',
    namaIbu: '',
    noTelepon: '',
    tanggalMasuk: new Date().toISOString().split('T')[0],
    kelas: 'Kelas 1',
    status: 'Aktif',
  });

  useEffect(() => {
    if (isEdit && params.santriId) {
      loadSantriData();
    }
    
    navigation.setOptions({
      title: isEdit ? 'Edit Santri' : 'Tambah Santri',
    });
  }, [isEdit, params.santriId]);

  const loadSantriData = async () => {
    try {
      setLoading(true);
      const data = await santriService.getById(params.santriId!);
      
      setFormData({
        nis: data.nis,
        nama: data.nama,
        jenisKelamin: data.jenisKelamin,
        tanggalLahir: data.tanggalLahir.split('T')[0],
        tempatLahir: data.tempatLahir,
        alamat: data.alamat,
        namaAyah: data.namaAyah,
        namaIbu: data.namaIbu,
        noTelepon: data.noTelepon,
        tanggalMasuk: data.tanggalMasuk.split('T')[0],
        kelas: data.kelas,
        status: data.status,
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data santri');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        [datePickerType === 'lahir' ? 'tanggalLahir' : 'tanggalMasuk']: dateString,
      }));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.nis.trim()) {
      Alert.alert('Validasi Error', 'NIS harus diisi');
      return;
    }
    
    if (!formData.nama.trim()) {
      Alert.alert('Validasi Error', 'Nama harus diisi');
      return;
    }
    
    if (!formData.noTelepon.trim()) {
      Alert.alert('Validasi Error', 'Nomor telepon harus diisi');
      return;
    }

    try {
      setSaving(true);
      
      if (isEdit && params.santriId) {
        const updateData: UpdateSantriDTO = { ...formData };
        await santriService.update(params.santriId, updateData);
        Alert.alert('Berhasil', 'Data santri berhasil diperbarui', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await santriService.create(formData);
        Alert.alert('Berhasil', 'Santri baru berhasil ditambahkan', [
          { 
            text: 'Tambah Lagi', 
            onPress: () => {
              // Reset form but keep some fields
              setFormData({
                ...formData,
                nis: '',
                nama: '',
                // Don't reset nis property here - it's already in formData
              });
            }
          },
          { 
            text: 'Selesai', 
            onPress: () => navigation.goBack(),
            style: 'default',
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Gagal menyimpan data santri'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Dasar</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NIS *</Text>
            <TextInput
              style={styles.input}
              value={formData.nis}
              onChangeText={text => setFormData({ ...formData, nis: text })}
              placeholder="Masukkan NIS"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap *</Text>
            <TextInput
              style={styles.input}
              value={formData.nama}
              onChangeText={text => setFormData({ ...formData, nama: text })}
              placeholder="Masukkan nama lengkap"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jenis Kelamin</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  formData.jenisKelamin === 'L' && styles.radioButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, jenisKelamin: 'L' })}
              >
                <Text style={[
                  styles.radioText,
                  formData.jenisKelamin === 'L' && styles.radioTextActive,
                ]}>
                  Laki-laki
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  formData.jenisKelamin === 'P' && styles.radioButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, jenisKelamin: 'P' })}
              >
                <Text style={[
                  styles.radioText,
                  formData.jenisKelamin === 'P' && styles.radioTextActive,
                ]}>
                  Perempuan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tanggal Lahir</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                setDatePickerType('lahir');
                setShowDatePicker(true);
              }}
            >
              <Icon name="calendar" size={20} color="#7f8c8d" />
              <Text style={styles.dateText}>
                {new Date(formData.tanggalLahir).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tempat Lahir</Text>
            <TextInput
              style={styles.input}
              value={formData.tempatLahir}
              onChangeText={text => setFormData({ ...formData, tempatLahir: text })}
              placeholder="Masukkan tempat lahir"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alamat</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.alamat}
              onChangeText={text => setFormData({ ...formData, alamat: text })}
              placeholder="Masukkan alamat lengkap"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Parent Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Orang Tua</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Ayah</Text>
            <TextInput
              style={styles.input}
              value={formData.namaAyah}
              onChangeText={text => setFormData({ ...formData, namaAyah: text })}
              placeholder="Masukkan nama ayah"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Ibu</Text>
            <TextInput
              style={styles.input}
              value={formData.namaIbu}
              onChangeText={text => setFormData({ ...formData, namaIbu: text })}
              placeholder="Masukkan nama ibu"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nomor Telepon *</Text>
            <TextInput
              style={styles.input}
              value={formData.noTelepon}
              onChangeText={text => setFormData({ ...formData, noTelepon: text })}
              placeholder="Masukkan nomor telepon"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* School Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Sekolah</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tanggal Masuk</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                setDatePickerType('masuk');
                setShowDatePicker(true);
              }}
            >
              <Icon name="calendar" size={20} color="#7f8c8d" />
              <Text style={styles.dateText}>
                {new Date(formData.tanggalMasuk).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kelas</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => {
                  Alert.alert(
                    'Pilih Kelas',
                    '',
                    [
                      'Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6',
                      'Kelas 7', 'Kelas 8', 'Kelas 9', 'Kelas 10', 'Kelas 11', 'Kelas 12',
                    ].map(kelas => ({
                      text: kelas,
                      onPress: () => setFormData({ ...formData, kelas }),
                    }))
                  );
                }}
              >
                <Text style={styles.pickerText}>{formData.kelas}</Text>
                <Icon name="chevron-down" size={20} color="#7f8c8d" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => {
                  Alert.alert(
                    'Pilih Status',
                    '',
                    [
                      { text: 'Aktif', onPress: () => setFormData({ ...formData, status: 'Aktif' }) },
                      { text: 'Non-Aktif', onPress: () => setFormData({ ...formData, status: 'Non-Aktif' }) },
                      { text: 'Lulus', onPress: () => setFormData({ ...formData, status: 'Lulus' }) },
                    ]
                  );
                }}
              >
                <Text style={styles.pickerText}>{formData.status}</Text>
                <Icon name="chevron-down" size={20} color="#7f8c8d" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon 
                name={isEdit ? "content-save" : "plus-circle"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.submitButtonText}>
                {isEdit ? 'Update Data' : 'Tambah Santri'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(
            datePickerType === 'lahir' ? formData.tanggalLahir : formData.tanggalMasuk
          )}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </ScrollView>
  );
};

export default SantriFormScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
    fontSize: 14,
  },
  form: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2c3e50',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
  },
  radioButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: 8,
  },
  radioButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  radioText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  radioTextActive: {
    color: '#fff',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dateText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#2c3e50',
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  pickerText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  submitButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 30,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
});