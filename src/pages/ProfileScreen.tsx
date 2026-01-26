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
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'react-native-image-picker';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Icon } from 'react-native-elements';
import { API } from '../services/api';
// API Base

// Types
interface Profile {
  id?: number;
  userId?: number;
  namaLengkap: string;
  noHp?: string | null;
  alamat?: string | null;
  fotoUrl?: string | null;
  tanggalLahir?: string | null;
  jenisKelamin?: string | null;
  createdAt?: string;
  updatedAt?: string;
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

// Default avatar
const DEFAULT_AVATAR_URL =
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    user: {
      id: 0,
      email: '',
      role: '',
      createdAt: '',
    },
    profile: {
      id: undefined,
      userId: undefined,
      namaLengkap: '',
      noHp: null,
      alamat: null,
      fotoUrl: DEFAULT_AVATAR_URL,
      tanggalLahir: null,
      jenisKelamin: null,
    },
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Fetch profile dari server
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.data;

      setProfileData({
        user: {
          id: data.user?.id ?? 0,
          email: data.user?.email ?? '',
          role: data.user?.role ?? '',
          createdAt: data.user?.createdAt ?? '',
        },
        profile: {
          id: data.profile?.id,
          namaLengkap: data.profile?.namaLengkap ?? '',
          noHp: data.profile?.noHp ?? '',
          alamat: data.profile?.alamat ?? '',
          fotoUrl: data.profile?.fotoUrl ?? '',
          tanggalLahir: data.profile?.tanggalLahir,
          jenisKelamin: data.profile?.jenisKelamin,
        },
      });
    } catch (err) {
      console.log('fetchProfile error', err);
      Alert.alert('Error', 'Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const avatarUri = profileData.profile.fotoUrl
  ? profileData.profile.fotoUrl.startsWith('http')
    ? profileData.profile.fotoUrl
    : `${API}${profileData.profile.fotoUrl}`
  : DEFAULT_AVATAR_URL;


  // Date picker
  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setEditForm({ ...editForm, tanggalLahir: date.toISOString() });
    }
  };

  // Open edit modal
  const openEditModal = () => {
    setEditForm({
      namaLengkap: profileData.profile.namaLengkap ?? '',
      noHp: profileData.profile.noHp ?? '',
      alamat: profileData.profile.alamat ?? '',
      tanggalLahir: profileData.profile.tanggalLahir ?? null,
      jenisKelamin: profileData.profile.jenisKelamin ?? null,
      fotoUrl: profileData.profile.fotoUrl || null,
    });
    setShowEditModal(true);
  };
  console.log('FOTO URL =>', profileData.profile.fotoUrl);

  // Save profile ke server
  const saveProfileToServer = async (data: Partial<Profile>) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Token tidak ditemukan');

    const formData = new FormData();

    formData.append('namaLengkap', data.namaLengkap ?? '');
    formData.append('noHp', data.noHp ?? '');
    formData.append('alamat', data.alamat ?? '');
    formData.append('jenisKelamin', data.jenisKelamin ?? '');

    if (data.tanggalLahir) {
      formData.append(
        'tanggalLahir',
        new Date(data.tanggalLahir).toISOString(),
      );
    }

    // ⬇️ INI BAGIAN PALING PENTING
    if (data.fotoUrl && data.fotoUrl.startsWith('file://')) {
      formData.append('image', {
        uri: data.fotoUrl,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);
    }

    const res = await axios.put(`${API}/profile/me`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data.data;
  };

  // Update profile
  const handleUpdateProfile = async () => {
    if (!editForm.namaLengkap?.trim()) {
      Alert.alert('Peringatan', 'Nama lengkap wajib diisi');
      return;
    }

    setUpdating(true);

    try {
      await saveProfileToServer(editForm);

      await fetchProfile();

      Alert.alert('Sukses', 'Profil berhasil diperbarui');
      setShowEditModal(false);
    } catch (err) {
      console.log('update profile error', err);
      Alert.alert('Error', 'Gagal menyimpan profil');
    } finally {
      setUpdating(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    Alert.alert('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('profile');
          navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
        },
      },
    ]);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 600,
      maxHeight: 600,
    });

    if (result.didCancel) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setEditForm(prev => ({
      ...prev,
      fotoUrl: asset.uri,
    }));
  };

  const formatDate = (dateString?: string) =>
    dateString
      ? new Date(dateString).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '-';

  const formatGender = (gender?: string) => {
    switch (gender) {
      case 'L':
        return 'Laki-laki';
      case 'P':
        return 'Perempuan';
      default:
        return 'Tidak disebutkan';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Memuat profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />

            <TouchableOpacity
              style={styles.editPhotoButton}
              onPress={() => {
                setEditForm({
  ...profileData.profile,
  fotoUrl: profileData.profile.fotoUrl || null,
});

                setShowEditModal(true);
              }}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>
            {profileData.profile.namaLengkap || 'Belum diisi'}
          </Text>
          <Text style={styles.profileEmail}>{profileData.user.email}</Text>

          <View style={styles.roleBadge}>
            <Icon name="user-o" type="font-awesome" size={14} />
            <Text style={styles.roleText}>
              {profileData.user.role === 'santri'
                ? 'Santri'
                : profileData.user.role === 'pengajar'
                ? 'Pengajar'
                : 'Admin'}
            </Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informasi Pribadi</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="phone" type="font-awesome" size={16} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nomor Telepon</Text>
                <Text style={styles.infoValue}>
                  {profileData.profile.noHp || 'Tidak ada'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="map-marker" type="font-awesome" size={16} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Alamat</Text>
                <Text style={styles.infoValue}>
                  {profileData.profile.alamat || 'Tidak ada'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="birthday-cake" type="font-awesome" size={16} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tanggal Lahir</Text>
                <Text style={styles.infoValue}>
                  {formatDate(profileData.profile.tanggalLahir || '-')}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="venus-mars" type="font-awesome" size={16} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Jenis Kelamin</Text>
                <Text style={styles.infoValue}>
                  {formatGender(profileData.profile.jenisKelamin || '-')}
                </Text>
              </View>
            </View>
            
            {/* Bagian "Bergabung Sejak" telah dihapus di sini */}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={openEditModal}
            activeOpacity={0.8}
          >
            <Icon name="edit" type="font-awesome" size={18} color="#3498db" />
            <Text style={styles.editButtonText}>Edit Profil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Icon
              name="sign-out"
              type="font-awesome"
              size={18}
              color="#e74c3c"
            />
            <Text style={styles.logoutButtonText}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profil</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                disabled={updating}
              >
                <Icon
                  name="times"
                  type="font-awesome"
                  size={20}
                  color="#7f8c8d"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.photoPicker}
                disabled={updating}
              >
                <Image
                  source={{ uri: editForm.fotoUrl || DEFAULT_AVATAR_URL }}
                  style={styles.modalAvatar}
                />
                <View style={styles.changePhotoButton}>
                  <Icon
                    name="camera"
                    type="font-awesome"
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.changePhotoText}>Ganti Foto</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nama Lengkap *</Text>
                <View style={styles.inputContainer}>
                  <Icon
                    name="user"
                    type="font-awesome"
                    size={16}
                    color="#95a5a6"
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Masukkan nama lengkap"
                    placeholderTextColor="#bdc3c7"
                    value={editForm.namaLengkap ?? ''}
                    onChangeText={t =>
                      setEditForm({ ...editForm, namaLengkap: t })
                    }
                    editable={!updating}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nomor Telepon</Text>
                <View style={styles.inputContainer}>
                  <Icon
                    name="phone"
                    type="font-awesome"
                    size={16}
                    color="#95a5a6"
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Masukkan nomor telepon"
                    placeholderTextColor="#bdc3c7"
                    value={editForm.noHp ?? ''}
                    onChangeText={t => setEditForm({ ...editForm, noHp: t })}
                    keyboardType="phone-pad"
                    editable={!updating}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Alamat</Text>
                <View style={styles.inputContainer}>
                  <Icon
                    name="map-marker"
                    type="font-awesome"
                    size={16}
                    color="#95a5a6"
                  />
                  <TextInput
                    style={[styles.textInput, { height: 80 }]}
                    placeholder="Masukkan alamat lengkap"
                    placeholderTextColor="#bdc3c7"
                    value={editForm.alamat ?? ''}
                    onChangeText={t => setEditForm({ ...editForm, alamat: t })}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!updating}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tanggal Lahir</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateInputContainer}
                  disabled={updating}
                >
                  <Icon name="calendar" type="font-awesome" size={16} />
                  <Text style={styles.dateInputText}>
                    {editForm.tanggalLahir
                      ? formatDate(editForm.tanggalLahir)
                      : 'Pilih tanggal lahir'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                  />
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Jenis Kelamin</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      editForm.jenisKelamin === 'L' &&
                        styles.genderButtonActive,
                    ]}
                    onPress={() =>
                      setEditForm({ ...editForm, jenisKelamin: 'L' })
                    }
                    disabled={updating}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        editForm.jenisKelamin === 'L' &&
                          styles.genderButtonTextActive,
                      ]}
                    >
                      Laki-laki
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      editForm.jenisKelamin === 'P' &&
                        styles.genderButtonActive,
                    ]}
                    onPress={() =>
                      setEditForm({ ...editForm, jenisKelamin: 'P' })
                    }
                    disabled={updating}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        editForm.jenisKelamin === 'P' &&
                          styles.genderButtonTextActive,
                      ]}
                    >
                      Perempuan
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
                disabled={updating}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  updating && styles.saveButtonDisabled,
                ]}
                onPress={handleUpdateProfile}
                disabled={updating || !editForm.namaLengkap?.trim()}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  // Profile Header
  profileHeader: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#f0f0f0',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3498db',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 12,
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ebf5fb',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    marginLeft: 6,
  },
  // Info Section
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#95a5a6',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
  },
  // Actions Section
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ebf5fb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#3498db',
  },
  editButtonText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#fecaca',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
    marginLeft: 10,
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
    maxHeight: '90%',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  photoPicker: {
    alignItems: 'center',
    marginVertical: 20,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  changePhotoText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
    paddingRight: 10,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateInputText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 4,
  },
  genderButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d5dbdb',
    borderRadius: 12,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 12,
    marginLeft: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#b0d4f0',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default ProfileScreen;