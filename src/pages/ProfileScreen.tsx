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
  StatusBar,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'react-native-image-picker';
import { Icon } from 'react-native-elements';
import { API } from '../services/api';

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
  const [refreshing, setRefreshing] = useState(false);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
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

  const getRoleIcon = () => {
    switch (profileData.user.role) {
      case 'santri':
        return { name: 'user', color: '#10B981' };
      case 'pengajar':
        return { name: 'user', color: '#3B82F6' };
      case 'admin':
        return { name: 'user', color: '#8B5CF6' };
      default:
        return { name: 'user', color: '#6B7280' };
    }
  };

  const getRoleColor = () => {
    switch (profileData.user.role) {
      case 'santri':
        return '#10B981';
      case 'pengajar':
        return '#3B82F6';
      case 'admin':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Memuat profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const roleIcon = getRoleIcon();
  const roleColor = getRoleColor();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image source={{ uri: avatarUri }} style={styles.logo} />
            <View style={styles.logoBadge}>
              <Icon name="user" type="font-awesome" size={20} color="#2563eb" />
            </View>
          </View>
          
          <Text style={styles.welcomeText}>
            {profileData.profile.namaLengkap || 'Belum diisi'}
          </Text>
          <Text style={styles.subtitle}>
            {profileData.user.email}
          </Text>
          
          <View style={[styles.roleBadge, { backgroundColor: `${roleColor}15` }]}>
            <Icon 
              name={roleIcon.name}
              type="font-awesome" 
              size={16} 
              color={roleColor}
            />
            <Text style={[styles.roleText, { color: roleColor }]}>
              {profileData.user.role === 'santri'
                ? 'Santri'
                : profileData.user.role === 'pengajar'
                ? 'Pengajar'
                : 'Admin'}
            </Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Informasi Pribadi</Text>
          
          {/* Nomor Telepon */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Icon name="phone" type="font-awesome" size={14} color="#6b7280" />
              <Text style={styles.label}>Nomor Telepon</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoValue}>
                {profileData.profile.noHp || 'Belum diisi'}
              </Text>
            </View>
          </View>

          {/* Alamat */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Icon name="map-marker" type="font-awesome" size={14} color="#6b7280" />
              <Text style={styles.label}>Alamat</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoValue}>
                {profileData.profile.alamat || 'Belum diisi'}
              </Text>
            </View>
          </View>

          {/* Tanggal Lahir */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Icon name="calendar" type="font-awesome" size={14} color="#6b7280" />
              <Text style={styles.label}>Tanggal Lahir</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoValue}>
                {formatDate(profileData.profile.tanggalLahir || '-')}
              </Text>
            </View>
          </View>

          {/* Jenis Kelamin */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Icon name="venus-mars" type="font-awesome" size={14} color="#6b7280" />
              <Text style={styles.label}>Jenis Kelamin</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoValue}>
                {formatGender(profileData.profile.jenisKelamin || '-')}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={openEditModal}
            activeOpacity={0.85}
          >
            <Icon name="edit" type="font-awesome" size={16} color="#2563eb" />
            <Text style={styles.editButtonText}>Edit Profil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Icon
              name="sign-out"
              type="font-awesome"
              size={16}
              color="#EF4444"
            />
            <Text style={styles.logoutButtonText}>Keluar</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Sistem Absensi Pesantren
          </Text>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profil</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                disabled={updating}
                style={styles.modalCloseButton}
                activeOpacity={0.85}
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
              contentContainerStyle={styles.modalScrollContent}
            >
              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.photoPicker}
                disabled={updating}
                activeOpacity={0.85}
              >
                <View style={styles.logoContainerModal}>
                  <Image
                    source={{ uri: editForm.fotoUrl || DEFAULT_AVATAR_URL }}
                    style={styles.modalLogo}
                  />
                  <View style={styles.logoBadgeModal}>
                    <Icon
                      name="camera"
                      type="font-awesome"
                      size={16}
                      color="#fff"
                    />
                  </View>
                </View>
                <Text style={styles.changePhotoText}>Ketuk untuk ganti foto</Text>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="user" type="font-awesome" size={14} color="#6b7280" />
                  <Text style={styles.label}>Nama Lengkap *</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan nama lengkap"
                    placeholderTextColor="#9ca3af"
                    value={editForm.namaLengkap ?? ''}
                    onChangeText={t =>
                      setEditForm({ ...editForm, namaLengkap: t })
                    }
                    editable={!updating}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="phone" type="font-awesome" size={14} color="#6b7280" />
                  <Text style={styles.label}>Nomor Telepon</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan nomor telepon"
                    placeholderTextColor="#9ca3af"
                    value={editForm.noHp ?? ''}
                    onChangeText={t => setEditForm({ ...editForm, noHp: t })}
                    keyboardType="phone-pad"
                    editable={!updating}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="map-marker" type="font-awesome" size={14} color="#6b7280" />
                  <Text style={styles.label}>Alamat</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, { height: 80 }]}
                    placeholder="Masukkan alamat lengkap"
                    placeholderTextColor="#9ca3af"
                    value={editForm.alamat ?? ''}
                    onChangeText={t => setEditForm({ ...editForm, alamat: t })}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!updating}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="calendar" type="font-awesome" size={14} color="#6b7280" />
                  <Text style={styles.label}>Tanggal Lahir</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateInputContainer}
                  disabled={updating}
                  activeOpacity={0.85}
                >
                  <Icon name="calendar" type="font-awesome" size={16} color="#9ca3af" />
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

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="venus-mars" type="font-awesome" size={14} color="#6b7280" />
                  <Text style={styles.label}>Jenis Kelamin</Text>
                </View>
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
                    activeOpacity={0.85}
                  >
                    <Icon 
                      name="mars" 
                      type="font-awesome" 
                      size={14} 
                      color={editForm.jenisKelamin === 'L' ? '#fff' : '#6b7280'} 
                      style={styles.genderIcon}
                    />
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
                    activeOpacity={0.85}
                  >
                    <Icon 
                      name="venus" 
                      type="font-awesome" 
                      size={14} 
                      color={editForm.jenisKelamin === 'P' ? '#fff' : '#6b7280'} 
                      style={styles.genderIcon}
                    />
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
                activeOpacity={0.85}
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
                activeOpacity={0.85}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="check" type="font-awesome" size={16} color="#fff" />
                    <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                  </>
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
    backgroundColor: "#f1f5f9",
  },
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
  
  // Header Section (Seperti di Login)
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: Platform.OS === 'ios' ? 20 : 10,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  
  // Form Card (Seperti di Login)
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  
  // Input Groups (Seperti di Login)
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    paddingRight: 10,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingRight: 10,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateInputText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  
  // Gender Container
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  genderIcon: {
    marginRight: 8,
  },
  genderButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Actions Container
  actionsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2563eb',
  },
  editButtonText: {
    fontSize: 16,
    color: '#2563eb',
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
  
  // Footer (Seperti di Login)
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalScroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  photoPicker: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainerModal: {
    position: 'relative',
    marginBottom: 12,
  },
  modalLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  logoBadgeModal: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563eb',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 25,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;