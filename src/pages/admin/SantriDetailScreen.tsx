import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { santriService } from '../../services/santriService';
import { Santri } from '../../types/santri';

type RouteParams = {
  santriId: string;
};

const SantriDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { santriId } = route.params as RouteParams;

  const [loading, setLoading] = useState(true);
  const [santri, setSantri] = useState<Santri | null>(null);

  useEffect(() => {
    loadSantriData();
    
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('EditSantri', { santriId })}
        >
          <Icon name="pencil" size={22} color="#3498db" />
        </TouchableOpacity>
      ),
    });
  }, [santriId]);

  const loadSantriData = async () => {
    try {
      setLoading(true);
      const data = await santriService.getById(santriId);
      setSantri(data);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data santri');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    const message = `Assalamualaikum, saya dari admin pesantren.`;
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`);
  };

  if (loading || !santri) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Memuat data santri...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Profile */}
      <View style={styles.profileHeader}>
        <View style={[
          styles.avatar,
          santri.jenisKelamin === 'L' ? styles.avatarMale : styles.avatarFemale
        ]}>
          <Icon
            name={santri.jenisKelamin === 'L' ? 'gender-male' : 'gender-female'}
            size={40}
            color="#fff"
          />
        </View>
        <Text style={styles.profileName}>{santri.nama}</Text>
        <Text style={styles.profileNis}>NIS: {santri.nis}</Text>
        <View style={[
          styles.statusBadge,
          santri.status === 'Aktif' ? styles.statusActive :
          santri.status === 'Lulus' ? styles.statusGraduated :
          styles.statusInactive
        ]}>
          <Text style={styles.statusText}>{santri.status}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCall(santri.noTelepon)}
        >
          <Icon name="phone" size={20} color="#3498db" />
          <Text style={styles.actionText}>Telepon</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleWhatsApp(santri.noTelepon)}
        >
          <Icon name="whatsapp" size={20} color="#25D366" />
          <Text style={styles.actionText}>WhatsApp</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // Navigate to attendance history
            Alert.alert('Info', 'Fitur riwayat absensi akan datang');
          }}
        >
          <Icon name="history" size={20} color="#9b59b6" />
          <Text style={styles.actionText}>Riwayat</Text>
        </TouchableOpacity>
      </View>

      {/* Information Sections */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="information" size={20} color="#3498db" />
          <Text style={styles.sectionTitle}>Informasi Pribadi</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jenis Kelamin:</Text>
          <Text style={styles.infoValue}>
            {santri.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>TTL:</Text>
          <Text style={styles.infoValue}>
            {santri.tempatLahir}, {
              new Date(santri.tanggalLahir).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })
            }
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Alamat:</Text>
          <Text style={styles.infoValue}>{santri.alamat}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="account-group" size={20} color="#3498db" />
          <Text style={styles.sectionTitle}>Informasi Orang Tua</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nama Ayah:</Text>
          <Text style={styles.infoValue}>{santri.namaAyah}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nama Ibu:</Text>
          <Text style={styles.infoValue}>{santri.namaIbu}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>No. Telepon:</Text>
          <Text style={styles.infoValue}>{santri.noTelepon}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="school" size={20} color="#3498db" />
          <Text style={styles.sectionTitle}>Informasi Sekolah</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kelas:</Text>
          <Text style={styles.infoValue}>{santri.kelas}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tanggal Masuk:</Text>
          <Text style={styles.infoValue}>
            {new Date(santri.tanggalMasuk).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <View style={[
            styles.statusBadgeSmall,
            santri.status === 'Aktif' ? styles.statusActive :
            santri.status === 'Lulus' ? styles.statusGraduated :
            styles.statusInactive
          ]}>
            <Text style={styles.statusTextSmall}>{santri.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="clock" size={20} color="#3498db" />
          <Text style={styles.sectionTitle}>Informasi Sistem</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Dibuat:</Text>
          <Text style={styles.infoValue}>
            {new Date(santri.createdAt).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Terakhir Diupdate:</Text>
          <Text style={styles.infoValue}>
            {new Date(santri.updatedAt).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SantriDetailScreen;

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
  headerButton: {
    marginRight: 15,
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarMale: {
    backgroundColor: '#3498db',
  },
  avatarFemale: {
    backgroundColor: '#e84393',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  profileNis: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusActive: {
    backgroundColor: '#d5f4e6',
  },
  statusInactive: {
    backgroundColor: '#ffeaea',
  },
  statusGraduated: {
    backgroundColor: '#e8f4fc',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  actionContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionText: {
    marginTop: 5,
    fontSize: 12,
    color: '#7f8c8d',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  statusBadgeSmall: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  statusTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
});