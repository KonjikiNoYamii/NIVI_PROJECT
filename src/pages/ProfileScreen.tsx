import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Button, Icon, Avatar } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

// Types
import { ApiResponse } from '../types/task';

// API Configuration
const API_BASE_URL = 'https://api.santrinavigator.com/v1';

// Types untuk Profile
interface Profile {
  id: number;
  userId: number;
  namaLengkap: string;
  noHp?: string;
  alamat?: string;
  fotoUrl?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

interface ProfileData {
  user: User;
  profile: Profile;
}

// Default avatar URL
const DEFAULT_AVATAR_URL = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

// Demo data untuk development
const DEMO_PROFILE_DATA: ProfileData = {
  user: {
    id: 1,
    email: 'santri@example.com',
    role: 'student',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  profile: {
    id: 1,
    userId: 1,
    namaLengkap: 'Ahmad Santoso',
    noHp: '081234567890',
    alamat: 'Jl. Pendidikan No. 123, Jakarta Selatan',
    fotoUrl: DEFAULT_AVATAR_URL,
    tanggalLahir: '2005-08-15T00:00:00.000Z',
    jenisKelamin: 'L',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
};

// Mode development (ubah jadi false saat production)
const IS_DEVELOPMENT = __DEV__ || true;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData>(DEMO_PROFILE_DATA);
  const [apiAvailable, setApiAvailable] = useState<boolean>(false);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date('2005-08-15'));

  // Fetch profile data
  const fetchProfile = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Jika development mode, langsung pakai data demo
      if (IS_DEVELOPMENT) {
        // Simulasi loading API
        setTimeout(() => {
          setProfileData(DEMO_PROFILE_DATA);
          setSelectedDate(new Date(DEMO_PROFILE_DATA.profile.tanggalLahir || new Date()));
          setApiAvailable(false); // API tidak tersedia di mode demo
          setLoading(false);
        }, 800);
        return;
      }
      
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        // Tidak ada token, pakai data demo
        setProfileData(DEMO_PROFILE_DATA);
        setApiAvailable(false);
        setLoading(false);
        return;
      }

      // Coba fetch dari API
      const response = await axios.get<ApiResponse<ProfileData>>(
        `${API_BASE_URL}/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      );

      if (response.data.success) {
        setProfileData(response.data.data);
        setApiAvailable(true);
        if (response.data.data.profile.tanggalLahir) {
          setSelectedDate(new Date(response.data.data.profile.tanggalLahir));
        }
      }
    } catch (error) {
      console.log('API Profile belum tersedia, menggunakan data demo');
      setProfileData(DEMO_PROFILE_DATA);
      setApiAvailable(false);
      
      // Tampilkan alert hanya jika bukan development mode
      if (!IS_DEVELOPMENT) {
        Alert.alert(
          'Info', 
          'Server tidak dapat diakses. Menampilkan data demo.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle image picker
  const handleImagePick = () => {
    if (!apiAvailable) {
      Alert.alert(
        'Mode Demo',
        'Fitur upload foto membutuhkan koneksi ke server'
      );
      return;
    }
    
    Alert.alert(
      'Ubah Foto Profil',
      'Pilih sumber foto',
      [
        { text: 'Kamera', onPress: () => pickImage('camera') },
        { text: 'Galeri', onPress: () => pickImage('gallery') },
        { text: 'Batal', style: 'cancel' }
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    const options: ImagePicker.ImageLibraryOptions | ImagePicker.CameraOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
      includeBase64: false,
    };

    try {
      let response: ImagePicker.ImagePickerResponse;
      
      if (source === 'camera') {
        response = await ImagePicker.launchCamera(options as ImagePicker.CameraOptions);
      } else {
        response = await ImagePicker.launchImageLibrary(options as ImagePicker.ImageLibraryOptions);
      }

      if (response.didCancel) {
        return;
      }

      if (response.errorCode || response.errorMessage) {
        Alert.alert('Error', 'Gagal memilih gambar');
        return;
      }

      if (response.assets && response.assets[0]) {
        await uploadProfileImage(response.assets[0]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Gagal memilih gambar');
    }
  };

  // Upload profile image
  const uploadProfileImage = async (imageAsset: ImagePicker.Asset) => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Sesi telah berakhir');
        return;
      }

      const formData = new FormData();
      formData.append('foto', {
        uri: imageAsset.uri,
        type: imageAsset.type || 'image/jpeg',
        name: imageAsset.fileName || 'profile.jpg',
      } as any);

      const response = await axios.post<ApiResponse<Profile>>(
        `${API_BASE_URL}/profile/photo`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setProfileData({
          ...profileData,
          profile: {
            ...profileData.profile,
            fotoUrl: response.data.data.fotoUrl,
          }
        });
        Alert.alert('Sukses', 'Foto profil berhasil diperbarui');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Gagal mengupload foto profil');
    } finally {
      setUpdating(false);
    }
  };

  // Open edit modal
  const openEditModal = () => {
    if (!apiAvailable) {
      Alert.alert(
        'Mode Demo',
        'Fitur edit profil membutuhkan koneksi ke server'
      );
      return;
    }
    
    setEditForm({
      namaLengkap: profileData.profile.namaLengkap,
      noHp: profileData.profile.noHp || '',
      alamat: profileData.profile.alamat || '',
      tanggalLahir: profileData.profile.tanggalLahir,
      jenisKelamin: profileData.profile.jenisKelamin || '',
    });
    setShowEditModal(true);
  };

  // Handle date change for date picker
  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      setEditForm({
        ...editForm,
        tanggalLahir: date.toISOString(),
      });
    }
  };

  // Update profile
  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Sesi telah berakhir');
        return;
      }

      // Filter out empty strings
      const cleanData: any = {};
      Object.entries(editForm).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          cleanData[key] = value;
        }
      });

      const response = await axios.put<ApiResponse<Profile>>(
        `${API_BASE_URL}/profile`,
        cleanData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setProfileData({
          ...profileData,
          profile: response.data.data,
        });
        setShowEditModal(false);
        Alert.alert('Sukses', 'Profil berhasil diperbarui');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<Profile>>;
      console.error('Update error:', axiosError.response?.data);
      
      let errorMessage = 'Gagal memperbarui profil';
      if (axiosError.response?.status === 400) {
        errorMessage = 'Data tidak valid';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userData');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format gender for display
  const formatGender = (gender?: string): string => {
    switch (gender) {
      case 'L': return 'Laki-laki';
      case 'P': return 'Perempuan';
      default: return '-';
    }
  };

  // Use effect to fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Render Personal Information Card
  const renderPersonalInfoCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Informasi Pribadi</Text>
      </View>
      <View style={styles.cardDivider} />
      
      <View style={styles.infoItem}>
        <Icon name="user" type="font-awesome" size={20} color="#3498db" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Nama Lengkap</Text>
          <Text style={styles.infoValue}>{profileData.profile.namaLengkap}</Text>
        </View>
      </View>

      <View style={styles.infoItem}>
        <Icon name="phone" type="font-awesome" size={20} color="#3498db" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>No. HP</Text>
          <Text style={styles.infoValue}>{profileData.profile.noHp || '-'}</Text>
        </View>
      </View>

      <View style={styles.infoItem}>
        <Icon name="transgender" type="font-awesome" size={20} color="#3498db" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Jenis Kelamin</Text>
          <Text style={styles.infoValue}>
            {formatGender(profileData.profile.jenisKelamin)}
          </Text>
        </View>
      </View>

      <View style={styles.infoItem}>
        <Icon name="birthday-cake" type="font-awesome" size={20} color="#3498db" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Tanggal Lahir</Text>
          <Text style={styles.infoValue}>
            {formatDate(profileData.profile.tanggalLahir)}
          </Text>
        </View>
      </View>

      <View style={styles.infoItem}>
        <Icon name="map-marker" type="font-awesome" size={20} color="#3498db" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Alamat</Text>
          <Text style={styles.infoValue}>
            {profileData.profile.alamat || '-'}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render Account Information Card
  const renderAccountInfoCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Informasi Akun</Text>
      </View>
      <View style={styles.cardDivider} />
      
      <View style={styles.infoItem}>
        <Icon name="envelope" type="font-awesome" size={20} color="#3498db" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{profileData.user.email}</Text>
        </View>
      </View>

      <View style={styles.infoItem}>
        <Icon name="user-tag" type="font-awesome" size={20} color="#3498db" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>
            {profileData.user.role === 'student' ? 'Santri' : 
             profileData.user.role === 'teacher' ? 'Pengajar' : 'Admin'}
          </Text>
        </View>
      </View>

      <View style={styles.infoItem}>
        <Icon name="calendar" type="font-awesome" size={20} color="#3498db" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Bergabung Sejak</Text>
          <Text style={styles.infoValue}>
            {formatDate(profileData.user.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Memuat data profil...</Text>
          {IS_DEVELOPMENT && (
            <Text style={styles.loadingSubtext}>
              Mode Development: Menggunakan data demo
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* API Status Warning */}
        {!apiAvailable && (
          <View style={styles.apiWarning}>
            <Icon name="info-circle" type="font-awesome" size={20} color="#f39c12" />
            <Text style={styles.apiWarningText}>
              Mode Demo: Data yang ditampilkan adalah contoh
            </Text>
            <TouchableOpacity 
              onPress={fetchProfile} 
              style={styles.retryIcon}
            >
              <Icon name="refresh" type="font-awesome" size={16} color="#3498db" />
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleImagePick} disabled={updating}>
              <View style={styles.avatarWrapper}>
                <Avatar
                  rounded
                  size="xlarge"
                  source={{
                    uri: profileData.profile.fotoUrl || DEFAULT_AVATAR_URL
                  }}
                  title={profileData.profile.namaLengkap.charAt(0)}
                  containerStyle={styles.avatar}
                />
                {updating && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                  </View>
                )}
              </View>
              <View style={styles.cameraIconContainer}>
                <Icon
                  name="camera"
                  type="font-awesome"
                  size={20}
                  color="#ffffff"
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileData.profile.namaLengkap}</Text>
            <Text style={styles.profileEmail}>{profileData.user.email}</Text>
            <Text style={styles.profileRole}>
              {profileData.user.role === 'student' ? 'Santri' : 
               profileData.user.role === 'teacher' ? 'Pengajar' : 'Admin'}
            </Text>
          </View>

          <Button
            title="Edit Profil"
            type="outline"
            onPress={openEditModal}
            buttonStyle={styles.editButton}
            titleStyle={styles.editButtonText}
            icon={
              <Icon
                name="edit"
                type="font-awesome"
                size={16}
                color="#3498db"
                style={{ marginRight: 8 }}
              />
            }
          />
        </View>

        {/* Personal Information Card */}
        {renderPersonalInfoCard()}

        {/* Account Information Card */}
        {renderAccountInfoCard()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Ubah Password"
            type="outline"
            buttonStyle={styles.actionButton}
            titleStyle={styles.actionButtonText}
            icon={
              <Icon
                name="key"
                type="font-awesome"
                size={16}
                color="#7f8c8d"
                style={{ marginRight: 8 }}
              />
            }
            onPress={() => {
              if (!apiAvailable) {
                Alert.alert(
                  'Mode Demo',
                  'Fitur ubah password membutuhkan koneksi ke server'
                );
              } else {
                navigation.navigate('ChangePassword' as never);
              }
            }}
          />
          
          <Button
            title="Keluar"
            type="outline"
            buttonStyle={[styles.actionButton, styles.logoutButton]}
            titleStyle={[styles.actionButtonText, styles.logoutButtonText]}
            icon={
              <Icon
                name="sign-out"
                type="font-awesome"
                size={16}
                color="#e74c3c"
                style={{ marginRight: 8 }}
              />
            }
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !updating && setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profil</Text>
              <TouchableOpacity
                onPress={() => !updating && setShowEditModal(false)}
                disabled={updating}
              >
                <Icon name="times" type="font-awesome" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Lengkap *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan nama lengkap"
                  value={editForm.namaLengkap}
                  onChangeText={(text) => setEditForm({...editForm, namaLengkap: text})}
                  editable={!updating}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>No. HP</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan nomor HP"
                  value={editForm.noHp}
                  onChangeText={(text) => setEditForm({...editForm, noHp: text})}
                  keyboardType="phone-pad"
                  editable={!updating}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Jenis Kelamin</Text>
                <View style={styles.genderOptions}>
                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      editForm.jenisKelamin === 'L' && styles.genderOptionSelected
                    ]}
                    onPress={() => setEditForm({...editForm, jenisKelamin: 'L'})}
                    disabled={updating}
                  >
                    <Icon
                      name="male"
                      type="font-awesome"
                      size={20}
                      color={editForm.jenisKelamin === 'L' ? '#fff' : '#3498db'}
                    />
                    <Text style={[
                      styles.genderOptionText,
                      editForm.jenisKelamin === 'L' && styles.genderOptionTextSelected
                    ]}>
                      Laki-laki
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      editForm.jenisKelamin === 'P' && styles.genderOptionSelected
                    ]}
                    onPress={() => setEditForm({...editForm, jenisKelamin: 'P'})}
                    disabled={updating}
                  >
                    <Icon
                      name="female"
                      type="font-awesome"
                      size={20}
                      color={editForm.jenisKelamin === 'P' ? '#fff' : '#e84393'}
                    />
                    <Text style={[
                      styles.genderOptionText,
                      editForm.jenisKelamin === 'P' && styles.genderOptionTextSelected
                    ]}>
                      Perempuan
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tanggal Lahir</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                  disabled={updating}
                >
                  <Icon name="calendar" type="font-awesome" size={20} color="#3498db" />
                  <Text style={styles.dateInputText}>
                    {editForm.tanggalLahir ? formatDate(editForm.tanggalLahir) : 'Pilih tanggal'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alamat</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Masukkan alamat lengkap"
                  value={editForm.alamat}
                  onChangeText={(text) => setEditForm({...editForm, alamat: text})}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!updating}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Batal"
                onPress={() => !updating && setShowEditModal(false)}
                type="outline"
                buttonStyle={styles.cancelButton}
                titleStyle={styles.cancelButtonText}
                disabled={updating}
                containerStyle={styles.modalButton}
              />
              <Button
                title={updating ? "Menyimpan..." : "Simpan Perubahan"}
                onPress={handleUpdateProfile}
                disabled={updating || !editForm.namaLengkap?.trim()}
                buttonStyle={styles.saveButton}
                loading={updating}
                containerStyle={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  apiWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9e6',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  apiWarningText: {
    flex: 1,
    marginLeft: 12,
    color: '#f39c12',
    fontSize: 14,
  },
  retryIcon: {
    padding: 4,
  },
  profileHeader: {
    backgroundColor: '#ffffff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  profileRole: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    backgroundColor: '#ebf5fb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  editButton: {
    borderColor: '#3498db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  editButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  // Custom Card Styles
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 0,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'left',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  actionButtons: {
    padding: 16,
    marginBottom: 24,
  },
  actionButton: {
    borderColor: '#d5dbdb',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    borderColor: '#e74c3c',
  },
  logoutButtonText: {
    color: '#e74c3c',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 400,
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
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#d5dbdb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#d5dbdb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  genderOptionSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  genderOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 8,
  },
  genderOptionTextSelected: {
    color: '#ffffff',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#d5dbdb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateInputText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: '#95a5a6',
    borderRadius: 8,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
  },
});

export default ProfileScreen;