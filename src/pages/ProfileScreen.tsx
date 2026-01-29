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
  Dimensions,
  Animated,
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

const { width } = Dimensions.get('window');

// Default avatar dengan gradient
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

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();

    // Pulsating animation for CTA button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

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

  const formatDate = (dateString?: string | null) =>
    dateString
      ? new Date(dateString).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '-';

  const formatGender = (gender?: string | null) => {
    switch (gender) {
      case 'L':
        return 'Laki-laki';
      case 'P':
        return 'Perempuan';
      default:
        return 'Tidak disebutkan';
    }
  };

  const getRoleInfo = () => {
    switch (profileData.user.role) {
      case 'santri':
        return {
          name: 'user',
          color: '#10B981',
          label: 'Santri',
          description: 'Anggota aktif pesantren'
        };
      case 'pengajar':
        return {
          name: 'user',
          color: '#3B82F6',
          label: 'Pengajar',
          description: 'Tenaga pengajar pesantren'
        };
      case 'admin':
        return {
          name: 'user',
          color: '#8B5CF6',
          label: 'Admin',
          description: 'Administrator sistem'
        };
      default:
        return {
          name: 'user',
          color: '#6B7280',
          label: 'Pengguna',
          description: 'Pengguna sistem'
        };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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

  const roleInfo = getRoleInfo();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      <Animated.ScrollView 
        style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
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
        {/* Hero Section dengan Background Gradient */}
        <View style={[styles.heroSection, { backgroundColor: '#1e3a8a' }]}>
          {/* Background Pattern */}
          <View style={styles.patternContainer}>
            {[...Array(20)].map((_, i) => (
              <View key={i} style={[styles.patternDot, {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.3 + 0.1,
              }]} />
            ))}
          </View>

          {/* Profile Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {profileData.profile.fotoUrl ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: roleInfo.color }]}>
                  <Text style={styles.avatarInitials}>
                    {getInitials(profileData.profile.namaLengkap || 'U')}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={[styles.editPhotoButton, { backgroundColor: roleInfo.color }]}
                onPress={openEditModal}
                activeOpacity={0.8}
              >
                <Icon name="camera" type="font-awesome" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profileData.profile.namaLengkap || 'Belum diisi'}
            </Text>
            <Text style={styles.profileEmail}>{profileData.user.email}</Text>
            
            <View style={styles.roleContainer}>
              <View style={[styles.roleBadge, { backgroundColor: roleInfo.color }]}>
                <Icon 
                  name={roleInfo.name}
                  type="font-awesome" 
                  size={14} 
                  color="#fff"
                />
                <Text style={styles.roleText}>
                  {roleInfo.label}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Cards Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard} activeOpacity={0.9}>
              <View style={[styles.statCardContent, { backgroundColor: '#f0f9ff' }]}>
                <View style={[styles.statIconCircle, { backgroundColor: '#bae6fd' }]}>
                  <Icon name="check" type="font-awesome" size={18} color="#0369a1" />
                </View>
                <Text style={styles.statNumber}>Aktif</Text>
                <Text style={styles.statLabel}>Status</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} activeOpacity={0.9}>
              <View style={[styles.statCardContent, { backgroundColor: '#fef3c7' }]}>
                <View style={[styles.statIconCircle, { backgroundColor: '#fde68a' }]}>
                  <Icon name="user" type="font-awesome" size={18} color="#92400e" />
                </View>
                <Text style={styles.statNumber}>
                  {profileData.user.role.charAt(0).toUpperCase() + profileData.user.role.slice(1)}
                </Text>
                <Text style={styles.statLabel}>Role</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} activeOpacity={0.9}>
              <View style={[styles.statCardContent, { backgroundColor: '#dcfce7' }]}>
                <View style={[styles.statIconCircle, { backgroundColor: '#bbf7d0' }]}>
                  <Icon name="id-badge" type="font-awesome" size={18} color="#166534" />
                </View>
                <Text style={styles.statNumber}>#{profileData.user.id.toString().padStart(4, '0')}</Text>
                <Text style={styles.statLabel}>ID</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Cards Grid */}
        <View style={styles.cardsGrid}>
          {/* Personal Info Card */}
          <View style={[styles.infoCard, { backgroundColor: '#ffffff' }]}>
            <View style={styles.cardHeader}>
              <Icon name="user-circle" type="font-awesome" size={20} color="#1e40af" />
              <Text style={styles.cardTitle}>Informasi Pribadi</Text>
            </View>
            
            <View style={styles.infoItem}>
              <View style={[styles.infoIconContainer, { backgroundColor: '#dbeafe' }]}>
                <Icon name="phone" type="font-awesome" size={14} color="#1e40af" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Telepon</Text>
                <Text style={styles.infoValue}>
                  {profileData.profile.noHp || 'Belum diatur'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <View style={[styles.infoIconContainer, { backgroundColor: '#dcfce7' }]}>
                <Icon name="map-marker" type="font-awesome" size={14} color="#166534" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Alamat</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {profileData.profile.alamat || 'Belum diatur'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <View style={[styles.infoIconContainer, { backgroundColor: '#fef3c7' }]}>
                <Icon name="birthday-cake" type="font-awesome" size={14} color="#92400e" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tanggal Lahir</Text>
                <Text style={styles.infoValue}>
                  {formatDate(profileData.profile.tanggalLahir)}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <View style={[styles.infoIconContainer, { backgroundColor: '#fce7f3' }]}>
                <Icon name="venus-mars" type="font-awesome" size={14} color="#be185d" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Jenis Kelamin</Text>
                <Text style={styles.infoValue}>
                  {formatGender(profileData.profile.jenisKelamin)}
                </Text>
              </View>
            </View>
          </View>

          {/* Account Info Card - DIKEMBALIKAN TAPI TANPA BERGAUNGSINCE */}
          <View style={[styles.infoCard, { backgroundColor: '#ffffff' }]}>
            <View style={styles.cardHeader}>
              <Icon name="user" type="font-awesome" size={20} color="#7c3aed" />
              <Text style={styles.cardTitle}>Info Akun</Text>
            </View>
            
            <View style={styles.infoItem}>
              <View style={[styles.infoIconContainer, { backgroundColor: '#f3e8ff' }]}>
                <Icon name="envelope" type="font-awesome" size={14} color="#7c3aed" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profileData.user.email}</Text>
              </View>
            </View>
            
            {/* ITEM BERGAUNGSINCE DIHAPUS DARI SINI */}
            
            <View style={styles.infoItem}>
              <View style={[styles.infoIconContainer, { backgroundColor: '#d1fae5' }]}>
                <Icon name="check-circle" type="font-awesome" size={14} color="#059669" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Status Akun</Text>
                <Text style={[styles.infoValue, { color: '#059669' }]}>Terverifikasi</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <Animated.View style={[styles.actionsContainer, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#2563eb' }]}
            onPress={openEditModal}
            activeOpacity={0.85}
          >
            <View style={styles.buttonContent}>
              <Icon name="edit" type="font-awesome" size={16} color="#fff" />
              <Text style={styles.primaryButtonText}>Edit Profil</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: '#fef2f2' }]}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <View style={styles.buttonContent}>
              <Icon
                name="sign-out"
                type="font-awesome"
                size={16}
                color="#dc2626"
              />
              <Text style={styles.secondaryButtonText}>Keluar</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Icon name="shield" type="font-awesome" size={20} color="#9ca3af" />
          <Text style={styles.footerText}>
            Akun Anda dilindungi keamanan tingkat tinggi
          </Text>
          <Text style={styles.footerSubtext}>
            © 2026 Sistem Absensi Pesantren 
          </Text>
        </View>
      </Animated.ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { backgroundColor: '#1e40af' }]}>
              <View style={styles.modalTitleContainer}>
                <Icon name="edit" type="font-awesome" size={20} color="#fff" />
                <Text style={styles.modalTitle}>Edit Profil</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                disabled={updating}
                style={styles.modalCloseButton}
                activeOpacity={0.85}
              >
                <Icon
                  name="times"
                  type="font-awesome"
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Profile Photo Upload */}
              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.photoPicker}
                disabled={updating}
                activeOpacity={0.85}
              >
                <View style={styles.avatarPickerContainer}>
                  <View style={styles.avatarPickerWrapper}>
                    {editForm.fotoUrl ? (
                      <Image source={{ uri: editForm.fotoUrl }} style={styles.modalAvatar} />
                    ) : (
                      <View style={[styles.modalAvatarFallback, { backgroundColor: roleInfo.color }]}>
                        <Text style={styles.modalAvatarInitials}>
                          {getInitials(editForm.namaLengkap || 'U')}
                        </Text>
                      </View>
                    )}
                    <View style={styles.avatarOverlay}>
                      <Icon name="camera" type="font-awesome" size={20} color="#fff" />
                    </View>
                  </View>
                  <Text style={styles.changePhotoText}>Ketuk untuk ganti foto profil</Text>
                  <Text style={styles.changePhotoSubtext}>Ukuran maksimal 2MB</Text>
                </View>
              </TouchableOpacity>

              {/* Form Fields */}
              {[
                {
                  label: 'Nama Lengkap *',
                  icon: 'user',
                  placeholder: 'Masukkan nama lengkap',
                  value: editForm.namaLengkap ?? '',
                  onChange: (t: string) => setEditForm({ ...editForm, namaLengkap: t }),
                  required: true
                },
                {
                  label: 'Nomor Telepon',
                  icon: 'phone',
                  placeholder: 'Masukkan nomor telepon',
                  value: editForm.noHp ?? '',
                  onChange: (t: string) => setEditForm({ ...editForm, noHp: t }),
                  keyboardType: 'phone-pad' as const
                },
                {
                  label: 'Alamat',
                  icon: 'map-marker',
                  placeholder: 'Masukkan alamat lengkap',
                  value: editForm.alamat ?? '',
                  onChange: (t: string) => setEditForm({ ...editForm, alamat: t }),
                  multiline: true
                },
              ].map((field, index) => (
                <View key={index} style={styles.formGroup}>
                  <View style={styles.labelRow}>
                    <Icon name={field.icon as any} type="font-awesome" size={14} color="#4b5563" />
                    <Text style={styles.formLabel}>{field.label}</Text>
                  </View>
                  <View style={styles.inputContainer}>
                    {field.multiline ? (
                      <TextInput
                        style={[styles.textInput, styles.textArea]}
                        placeholder={field.placeholder}
                        placeholderTextColor="#9ca3af"
                        value={field.value}
                        onChangeText={field.onChange}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        editable={!updating}
                      />
                    ) : (
                      <TextInput
                        style={styles.textInput}
                        placeholder={field.placeholder}
                        placeholderTextColor="#9ca3af"
                        value={field.value}
                        onChangeText={field.onChange}
                        keyboardType={field.keyboardType}
                        editable={!updating}
                      />
                    )}
                  </View>
                </View>
              ))}

              {/* Date Picker */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Icon name="calendar" type="font-awesome" size={14} color="#4b5563" />
                  <Text style={styles.formLabel}>Tanggal Lahir</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateInputContainer}
                  disabled={updating}
                  activeOpacity={0.85}
                >
                  <Icon name="calendar" type="font-awesome" size={16} color="#6b7280" />
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

              {/* Gender Selection */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Icon name="venus-mars" type="font-awesome" size={14} color="#4b5563" />
                  <Text style={styles.formLabel}>Jenis Kelamin</Text>
                </View>
                <View style={styles.genderContainer}>
                  {['L', 'P'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderOption,
                        editForm.jenisKelamin === gender && styles.genderOptionActive
                      ]}
                      onPress={() => setEditForm({ ...editForm, jenisKelamin: gender })}
                      disabled={updating}
                      activeOpacity={0.85}
                    >
                      <Icon 
                        name={gender === 'L' ? 'mars' : 'venus'} 
                        type="font-awesome" 
                        size={16} 
                        color={editForm.jenisKelamin === gender ? '#fff' : '#6b7280'} 
                      />
                      <Text style={[
                        styles.genderOptionText,
                        editForm.jenisKelamin === gender && styles.genderOptionTextActive
                      ]}>
                        {gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
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
                style={[styles.saveButton, updating && styles.saveButtonDisabled]}
                onPress={handleUpdateProfile}
                disabled={updating || !editForm.namaLengkap?.trim()}
                activeOpacity={0.85}
              >
                <View style={[styles.saveButtonContent, { backgroundColor: updating ? '#93c5fd' : '#2563eb' }]}>
                  {updating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="check" type="font-awesome" size={16} color="#fff" />
                      <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
  
  // Hero Section
  heroSection: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  // Avatar Section
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  
  // Profile Info
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  profileEmail: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleContainer: {
    alignItems: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  
  // Stats Cards
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  statCardContent: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Cards Grid
  cardsGrid: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.6)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
    marginLeft: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    lineHeight: 22,
  },
  
  // Action Buttons
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 14,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fecaca',
  },
  buttonContent: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginLeft: 10,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modalScrollContent: {
    paddingBottom: 30,
  },
  photoPicker: {
    marginBottom: 24,
  },
  avatarPickerContainer: {
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
  },
  avatarPickerWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  modalAvatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  modalAvatarInitials: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 15,
    color: '#4b5563',
    fontWeight: '600',
    marginBottom: 4,
  },
  changePhotoSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  formGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
  },
  textInput: {
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    paddingRight: 10,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    paddingBottom: 16,
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
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
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
  genderOptionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  genderOptionText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 8,
  },
  genderOptionTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonContent: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
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