import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  TextInput,
  Modal,
  Dimensions
} from 'react-native';
import { Icon, Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = 'https://api.santrinavigator.com/v1';

// Types
interface Profile {
  id: number;
  userId: number;
  namaLengkap: string;
  noHp: string | null;
  alamat: string | null;
  fotoUrl: string | null;
  tanggalLahir: string | null;
  jenisKelamin: string | null;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  emailVerified: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const ProfileScreen: React.FC = () => {
  // State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    namaLengkap: '',
    noHp: '',
    alamat: '',
    tanggalLahir: '',
    jenisKelamin: '',
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const profileImageScale = useRef(new Animated.Value(1)).current;

  const { width } = Dimensions.get('window');

  // Fetch profile data
  const fetchProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Sesi telah berakhir. Silakan login kembali.');
        return;
      }

      // Fetch profile
      const profileResponse = await axios.get<ApiResponse<Profile>>(
        `${API_BASE_URL}/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (profileResponse.data.success) {
        const profileData = profileResponse.data.data;
        setProfile(profileData);
        
        // Set form data
        setFormData({
          namaLengkap: profileData.namaLengkap,
          noHp: profileData.noHp || '',
          alamat: profileData.alamat || '',
          tanggalLahir: profileData.tanggalLahir 
            ? formatDateForInput(profileData.tanggalLahir)
            : '',
          jenisKelamin: profileData.jenisKelamin || '',
        });
      }

      // Fetch user data
      const userResponse = await axios.get<ApiResponse<User>>(
        `${API_BASE_URL}/user`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (userResponse.data.success) {
        setUser(userResponse.data.data);
      }

      // Animate content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ]).start();

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<any>>;
      console.error('Error fetching profile:', axiosError.message);
      
      if (axiosError.response?.status === 401) {
        Alert.alert('Sesi Berakhir', 'Silakan login kembali');
      } else {
        Alert.alert('Error', 'Gagal memuat data profil. Periksa koneksi internet Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (): Promise<void> => {
    try {
      setUploading(true);
      
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Sesi telah berakhir');
        return;
      }

      const response = await axios.put<ApiResponse<Profile>>(
        `${API_BASE_URL}/profile`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        Alert.alert('Sukses', 'Profil berhasil diperbarui!');
        setProfile(response.data.data);
        setEditing(false);
        fetchProfile();
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<Profile>>;
      console.error('Error updating profile:', axiosError.response?.data);
      
      let errorMessage = 'Gagal memperbarui profil';
      if (axiosError.response?.status === 400) {
        errorMessage = 'Data tidak valid';
      } else if (axiosError.response?.status === 409) {
        errorMessage = 'Konflik data';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      return date.toLocaleDateString('id-ID', options);
    } catch {
      return dateString;
    }
  };

  // Get gender icon and color
  const getGenderInfo = (jenisKelamin: string | null) => {
    switch (jenisKelamin?.toLowerCase()) {
      case 'laki-laki':
        return { icon: 'male', color: '#3498db' };
      case 'perempuan':
        return { icon: 'female', color: '#e84393' };
      default:
        return { icon: 'user', color: '#7f8c8d' };
    }
  };

  // Get initials
  const getInitials = (namaLengkap: string): string => {
    return namaLengkap
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Animation for profile image
  const animateProfileImage = () => {
    Animated.sequence([
      Animated.timing(profileImageScale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(profileImageScale, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Handle change photo
  const handleChangePhoto = (): void => {
    Alert.alert(
      'Ubah Foto Profil',
      'Fitur upload foto akan tersedia dalam versi selanjutnya.',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Memuat profil...</Text>
      </SafeAreaView>
    );
  }

  const genderInfo = getGenderInfo(profile?.jenisKelamin || null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Background */}
      <Animated.View 
        style={[
          styles.headerBackground,
          {
            opacity: headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0]
              })
            }]
          }
        ]}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => {
                animateProfileImage();
                setModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Animated.View 
                style={[
                  styles.profileImageContainer,
                  { transform: [{ scale: profileImageScale }] }
                ]}
              >
                {profile?.fotoUrl ? (
                  <Image 
                    source={{ uri: profile.fotoUrl }} 
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.profileImagePlaceholder, { backgroundColor: genderInfo.color + '20' }]}>
                    <Text style={[styles.profileInitials, { color: genderInfo.color }]}>
                      {getInitials(profile?.namaLengkap || '')}
                    </Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.cameraButton}
                  onPress={handleChangePhoto}
                >
                  <Icon 
                    name="camera" 
                    type="font-awesome" 
                    size={14} 
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
            
            <View style={styles.headerText}>
              <Text style={styles.profileName}>
                {profile?.namaLengkap}
              </Text>
              <Text style={styles.profileRole}>
                {user?.role === 'admin' ? 'Administrator' : 'Pengguna'}
              </Text>
              <View style={styles.profileMeta}>
                <Icon 
                  name={genderInfo.icon} 
                  type="font-awesome" 
                  size={14} 
                  color={genderInfo.color}
                />
                <Text style={[styles.profileGender, { color: genderInfo.color }]}>
                  {profile?.jenisKelamin || 'Belum diatur'}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Main Content */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }]
            }
          ]}
        >
          {/* User Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="user-circle" type="font-awesome" size={20} color="#3498db" />
              <Text style={styles.cardTitle}>Informasi Akun</Text>
              {!editing && (
                <TouchableOpacity 
                  onPress={() => setEditing(true)}
                  style={styles.editButton}
                >
                  <Icon name="edit" type="font-awesome" size={16} color="#3498db" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.infoGrid}>
              {/* Email */}
              <View style={styles.infoItem}>
                <View style={styles.infoLabelContainer}>
                  <Icon name="envelope" type="font-awesome" size={14} color="#7f8c8d" />
                  <Text style={styles.infoLabel}>Email</Text>
                </View>
                <Text style={styles.infoValue}>{user?.email}</Text>
                {user?.emailVerified && (
                  <View style={styles.verifiedBadge}>
                    <Icon name="check-circle" type="font-awesome" size={12} color="#27ae60" />
                    <Text style={styles.verifiedText}>Terverifikasi</Text>
                  </View>
                )}
              </View>

              {/* Username */}
              <View style={styles.infoItem}>
                <View style={styles.infoLabelContainer}>
                  <Icon name="user" type="font-awesome" size={14} color="#7f8c8d" />
                  <Text style={styles.infoLabel}>Username</Text>
                </View>
                <Text style={styles.infoValue}>{user?.username}</Text>
              </View>

              {/* Nama Lengkap */}
              <View style={styles.infoItem}>
                <View style={styles.infoLabelContainer}>
                  <Icon name="id-card" type="font-awesome" size={14} color="#7f8c8d" />
                  <Text style={styles.infoLabel}>Nama Lengkap</Text>
                </View>
                {editing ? (
                  <TextInput
                    style={styles.textInput}
                    value={formData.namaLengkap}
                    onChangeText={(text) => setFormData({...formData, namaLengkap: text})}
                    placeholder="Nama lengkap"
                  />
                ) : (
                  <Text style={styles.infoValue}>{profile?.namaLengkap}</Text>
                )}
              </View>

              {/* Nomor HP */}
              <View style={styles.infoItem}>
                <View style={styles.infoLabelContainer}>
                  <Icon name="phone" type="font-awesome" size={14} color="#7f8c8d" />
                  <Text style={styles.infoLabel}>Nomor HP</Text>
                </View>
                {editing ? (
                  <TextInput
                    style={styles.textInput}
                    value={formData.noHp}
                    onChangeText={(text) => setFormData({...formData, noHp: text})}
                    placeholder="08xxxxxxxxxx"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.infoValue}>{profile?.noHp || 'Belum diatur'}</Text>
                )}
              </View>

              {/* Tanggal Lahir */}
              <View style={styles.infoItem}>
                <View style={styles.infoLabelContainer}>
                  <Icon name="birthday-cake" type="font-awesome" size={14} color="#7f8c8d" />
                  <Text style={styles.infoLabel}>Tanggal Lahir</Text>
                </View>
                {editing ? (
                  <TextInput
                    style={styles.textInput}
                    value={formData.tanggalLahir}
                    onChangeText={(text) => setFormData({...formData, tanggalLahir: text})}
                    placeholder="YYYY-MM-DD"
                  />
                ) : (
                  <Text style={styles.infoValue}>
                    {profile?.tanggalLahir ? formatDateForDisplay(profile.tanggalLahir) : 'Belum diatur'}
                  </Text>
                )}
              </View>

              {/* Jenis Kelamin */}
              <View style={styles.infoItem}>
                <View style={styles.infoLabelContainer}>
                  <Icon name="venus-mars" type="font-awesome" size={14} color="#7f8c8d" />
                  <Text style={styles.infoLabel}>Jenis Kelamin</Text>
                </View>
                {editing ? (
                  <View style={styles.genderOptions}>
                    <TouchableOpacity
                      style={[
                        styles.genderOption,
                        formData.jenisKelamin === 'Laki-laki' && styles.genderOptionSelected
                      ]}
                      onPress={() => setFormData({...formData, jenisKelamin: 'Laki-laki'})}
                    >
                      <Icon name="male" type="font-awesome" size={14} color="#3498db" />
                      <Text style={styles.genderOptionText}>Laki-laki</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderOption,
                        formData.jenisKelamin === 'Perempuan' && styles.genderOptionSelected
                      ]}
                      onPress={() => setFormData({...formData, jenisKelamin: 'Perempuan'})}
                    >
                      <Icon name="female" type="font-awesome" size={14} color="#e84393" />
                      <Text style={styles.genderOptionText}>Perempuan</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.infoValue}>{profile?.jenisKelamin || 'Belum diatur'}</Text>
                )}
              </View>

              {/* Alamat */}
              <View style={[styles.infoItem, styles.fullWidthItem]}>
                <View style={styles.infoLabelContainer}>
                  <Icon name="map-marker" type="font-awesome" size={14} color="#7f8c8d" />
                  <Text style={styles.infoLabel}>Alamat</Text>
                </View>
                {editing ? (
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={formData.alamat}
                    onChangeText={(text) => setFormData({...formData, alamat: text})}
                    placeholder="Alamat lengkap"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                ) : (
                  <Text style={[styles.infoValue, styles.multilineText]}>
                    {profile?.alamat || 'Belum diatur'}
                  </Text>
                )}
              </View>

              {/* Member Since */}
              <View style={[styles.infoItem, styles.fullWidthItem]}>
                <View style={styles.infoLabelContainer}>
                  <Icon name="calendar-plus" type="font-awesome" size={14} color="#7f8c8d" />
                  <Text style={styles.infoLabel}>Bergabung Sejak</Text>
                </View>
                <Text style={styles.infoValue}>
                  {profile?.createdAt ? formatDateForDisplay(profile.createdAt) : '-'}
                </Text>
              </View>
            </View>

            {/* Edit Actions */}
            {editing && (
              <View style={styles.editActions}>
                <Button
                  title="Batal"
                  onPress={() => {
                    setEditing(false);
                    setFormData({
                      namaLengkap: profile?.namaLengkap || '',
                      noHp: profile?.noHp || '',
                      alamat: profile?.alamat || '',
                      tanggalLahir: profile?.tanggalLahir 
                        ? formatDateForInput(profile.tanggalLahir)
                        : '',
                      jenisKelamin: profile?.jenisKelamin || '',
                    });
                  }}
                  type="outline"
                  buttonStyle={styles.cancelButton}
                  titleStyle={styles.cancelButtonText}
                  disabled={uploading}
                  containerStyle={styles.actionButton}
                />
                <Button
                  title={uploading ? "Menyimpan..." : "Simpan Perubahan"}
                  onPress={updateProfile}
                  disabled={uploading}
                  buttonStyle={styles.saveButton}
                  loading={uploading}
                  loadingProps={{ color: '#fff', size: 'small' }}
                  containerStyle={styles.actionButton}
                  linearGradientProps={{
                    colors: ['#3498db', '#2980b9'],
                    start: { x: 0, y: 0 },
                    end: { x: 1, y: 0 }
                  }}
                />
              </View>
            )}
          </View>

          {/* Account Actions */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="cog" type="font-awesome" size={20} color="#3498db" />
              <Text style={styles.cardTitle}>Pengaturan Akun</Text>
            </View>

            <View style={styles.actionList}>
              <TouchableOpacity style={styles.actionItem} onPress={handleChangePhoto}>
                <View style={styles.actionIconContainer}>
                  <Icon name="camera" type="font-awesome" size={18} color="#3498db" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Ubah Foto Profil</Text>
                  <Text style={styles.actionSubtitle}>Unggah foto baru untuk profil Anda</Text>
                </View>
                <Icon name="chevron-right" type="font-awesome" size={16} color="#bdc3c7" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <View style={styles.actionIconContainer}>
                  <Icon name="lock" type="font-awesome" size={18} color="#2ecc71" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Ubah Password</Text>
                  <Text style={styles.actionSubtitle}>Perbarui kata sandi akun Anda</Text>
                </View>
                <Icon name="chevron-right" type="font-awesome" size={16} color="#bdc3c7" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <View style={styles.actionIconContainer}>
                  <Icon name="bell" type="font-awesome" size={18} color="#f39c12" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Notifikasi</Text>
                  <Text style={styles.actionSubtitle}>Kelola pengaturan notifikasi</Text>
                </View>
                <Icon name="chevron-right" type="font-awesome" size={16} color="#bdc3c7" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionItem, styles.logoutItem]}
                onPress={() => {
                  Alert.alert(
                    'Keluar',
                    'Apakah Anda yakin ingin keluar dari akun ini?',
                    [
                      { text: 'Batal', style: 'cancel' },
                      { text: 'Keluar', style: 'destructive' }
                    ]
                  );
                }}
              >
                <View style={styles.actionIconContainer}>
                  <Icon name="sign-out" type="font-awesome" size={18} color="#e74c3c" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, styles.logoutText]}>Keluar</Text>
                  <Text style={styles.actionSubtitle}>Keluar dari akun Anda</Text>
                </View>
                <Icon name="chevron-right" type="font-awesome" size={16} color="#bdc3c7" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Profile Image Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {profile?.fotoUrl ? (
              <Image 
                source={{ uri: profile.fotoUrl }} 
                style={styles.modalImage}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.modalPlaceholder, { backgroundColor: genderInfo.color + '20' }]}>
                <Text style={[styles.modalInitials, { color: genderInfo.color }]}>
                  {getInitials(profile?.namaLengkap || '')}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="times" type="font-awesome" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#3498db',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: '700',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3498db',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerText: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 8,
    backgroundColor: '#ebf5fb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileGender: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginLeft: 12,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ebf5fb',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#3498db',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 20,
  },
  fullWidthItem: {
    width: '100%',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '600',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  multilineText: {
    lineHeight: 22,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d5f4e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 11,
    color: '#27ae60',
    fontWeight: '600',
    marginLeft: 4,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#d5dbdb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
    marginTop: 4,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  genderOptions: {
    flexDirection: 'row',
    marginTop: 4,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#d5dbdb',
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  genderOptionSelected: {
    borderColor: '#3498db',
    backgroundColor: '#ebf5fb',
  },
  genderOptionText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    marginLeft: 6,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  cancelButton: {
    borderColor: '#bdc3c7',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionList: {
    marginTop: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  logoutText: {
    color: '#e74c3c',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  modalPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  modalInitials: {
    fontSize: 80,
    fontWeight: '700',
  },
  closeModalButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;