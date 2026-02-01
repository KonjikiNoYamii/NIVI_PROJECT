import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API } from '../../services/api';
import { Icon } from 'react-native-elements';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from '@react-native-vector-icons/ionicons';
import { TextInput } from 'react-native-gesture-handler';

interface Kelas {
  id: number;
  namaKelas: string;
  deskripsi?: string;
  santri?: any[];
  tugas?: any[];
  createdAt?: string;
}

interface Mapel {
  id: number;
  nama: string;
  kode:string
  deskripsi?: string;
  createdAt?: string;
}

interface Pengajar {
  id: number;
  name: string;
  email: string;
  profile?: {
    name?: string;
  } | null;
}

const KelasListScreen = () => {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedKelasId, setSelectedKelasId] = useState<number | null>(null);
  const [selectedKelasName, setSelectedKelasName] = useState('');

  const [pengajarKelas, setPengajarKelas] = useState<Pengajar[]>([]);
  const [loadingPengajarKelas, setLoadingPengajarKelas] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'kelas' | 'mapel';
    id: number;
    name: string;
  } | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [activeTab, setActiveTab] = useState<'kelas' | 'mapel'>('kelas');

  // NEW: State for pengajar modal
  const [pengajarModalVisible, setPengajarModalVisible] = useState(false);
  const [pengajarModalPosition, setPengajarModalPosition] = useState({
    top: 0,
    left: 0,
  });

  const [editKode, setEditKode] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [editType, setEditType] = useState<'kelas' | 'mapel' | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [editNama, setEditNama] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadKelas(), loadMapel()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadKelas = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API}/kelas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || res.data || [];
      setKelasList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading kelas:', error);
      Alert.alert('Error', 'Gagal mengambil data kelas');
    }
  };

  const loadMapel = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API}/mapel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = res.data?.data ?? res.data;
      setMapelList(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.error('Error loading mapel:', error);
      Alert.alert('Error', 'Gagal mengambil mata pelajaran');
    }
  };

  const fetchPengajarByKelas = async (kelasId: number) => {
    setLoadingPengajarKelas(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API}/admin/kelas/${kelasId}/pengajar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = res.data?.data ?? res.data;
      const list = Array.isArray(raw) ? raw : raw?.pengajar || [];

      const formattedPengajar = list.map((p: any) => ({
        id: p.id,
        name: p.profiles?.name || p.name || p.email.split('@')[0] || 'Pengajar',
        email: p.email,
        profile: p.profiles,
      }));

      setPengajarKelas(formattedPengajar);
    } catch (error) {
      console.error('Error loading pengajar:', error);
      Alert.alert('Error', 'Gagal mengambil pengajar kelas');
    } finally {
      setLoadingPengajarKelas(false);
    }
  };

  /* ================= HANDLE DELETE ================= */
  const handleDelete = (type: 'kelas' | 'mapel', id: number, name: string) => {
    setItemToDelete({ type, id, name });
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setLoadingDelete(true);
    try {
      const token = await AsyncStorage.getItem('token');

      if (itemToDelete.type === 'kelas') {
        await axios.delete(`${API}/kelas/${itemToDelete.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert('Berhasil', 'Kelas berhasil dihapus');
        if (selectedKelasId === itemToDelete.id) {
          setSelectedKelasId(null);
          setSelectedKelasName('');
        }
        loadKelas();
      } else {
        await axios.delete(`${API}/mapel/${itemToDelete.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert('Berhasil', 'Mata pelajaran berhasil dihapus');
        loadMapel();
      }

      setDeleteModal(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error('Error deleting:', error);
      Alert.alert('Gagal', error.response?.data?.message || 'Gagal menghapus');
    } finally {
      setLoadingDelete(false);
    }
  };

  const submitEdit = async () => {
    if (!editId || !editType) return;

    if (!editNama.trim()) {
      Alert.alert('Validasi', 'Nama tidak boleh kosong');
      return;
    }

    if (editType === 'mapel' && !editKode.trim()) {
      Alert.alert('Validasi', 'Kode mata pelajaran tidak boleh kosong');
      return;
    }

    setLoadingEdit(true);
    try {
      const token = await AsyncStorage.getItem('token');

      if (editType === 'kelas') {
        await axios.put(
          `${API}/kelas/${editId}`,
          { namaKelas: editNama },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        loadKelas();
        Alert.alert('Berhasil', 'Kelas berhasil diperbarui');
      }

      if (editType === 'mapel') {
        await axios.put(
          `${API}/mapel/${editId}`,
          {
            nama: editNama,
            kode: editKode,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        loadMapel();
        Alert.alert('Berhasil', 'Mata pelajaran berhasil diperbarui');
      }

      setEditModal(false);
    } catch (error: any) {
      Alert.alert(
        'Gagal',
        error.response?.data?.message ||
          'Gagal menyimpan perubahan mata pelajaran',
      );
    } finally {
      setLoadingEdit(false);
    }
  };

  // NEW: Handle pengajar button press with positioning
  const handlePengajarPress = (item: Kelas, event: any) => {
    const { pageX, pageY } = event.nativeEvent;

    // Set position for modal (adjust as needed)
    setPengajarModalPosition({
      top: pageY + 10, // Show modal 10px below the button
      left: pageX - 150, // Center the modal horizontally
    });

    // Fetch pengajar data
    setSelectedKelasId(item.id);
    setSelectedKelasName(item.namaKelas);
    setPengajarModalVisible(true);

    // Fetch pengajar data
    fetchPengajarByKelas(item.id);
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openEdit = (type: 'kelas' | 'mapel', item: any) => {
    setEditType(type);
    setEditId(item.id);

    if (type === 'mapel') {
      setEditNama(item.nama);
      setEditKode(item.kode);
    } else {
      setEditNama(item.namaKelas);
    }

    setEditModal(true);
  };

  /* ================= RENDER FUNCTIONS ================= */
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Daftar Kelas & Mapel</Text>
        <Text style={styles.headerSubtitle}>
          Kelola kelas dan mata pelajaran
        </Text>
      </View>
      <TouchableOpacity style={styles.headerIcon}>
        <FontAwesome6 name="school" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'kelas' && styles.tabButtonActive,
        ]}
        onPress={() => setActiveTab('kelas')}
        activeOpacity={0.85}
      >
        <View style={styles.tabContent}>
          <FontAwesome6
            name="users"
            size={16}
            color={activeTab === 'kelas' ? '#fff' : '#6b7280'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'kelas' && styles.tabTextActive,
            ]}
          >
            Kelas ({kelasList.length})
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'mapel' && styles.tabButtonActive,
        ]}
        onPress={() => setActiveTab('mapel')}
        activeOpacity={0.85}
      >
        <View style={styles.tabContent}>
          <FontAwesome6
            name="book-open"
            size={16}
            color={activeTab === 'mapel' ? '#fff' : '#6b7280'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'mapel' && styles.tabTextActive,
            ]}
          >
            Mapel ({mapelList.length})
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderKelasItem = ({ item }: { item: Kelas }) => {
    return (
      <View style={styles.kelasCard}>
        <View style={styles.kelasCardHeader}>
          <View style={styles.kelasIconContainer}>
            <FontAwesome6 name="users" size={20} color="#2563eb" />
          </View>

          <View style={styles.kelasInfo}>
            <View style={styles.kelasTitleRow}>
              <Text style={styles.kelasTitle}>{item.namaKelas}</Text>
            </View>

            <View style={styles.kelasStats}>
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={12} color="#6b7280" />
                <Text style={styles.statText}>
                  {item.santri?.length || 0} Santri
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="list-outline" size={12} color="#6b7280" />
                <Text style={styles.statText}>
                  {item.tugas?.length || 0} Tugas
                </Text>
              </View>
            </View>

            {item.deskripsi && (
              <Text style={styles.kelasDeskripsi} numberOfLines={2}>
                {item.deskripsi}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.kelasActions}>
          <TouchableOpacity
            style={styles.pengajarButton}
            onPress={e => handlePengajarPress(item, e)}
            activeOpacity={0.85}
          >
            <Icon name="users" type="font-awesome" size={12} color="#f59e0b" />
            <Text style={styles.pengajarButtonText}>Lihat Pengajar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEdit('kelas', item)}
          >
            <Icon name="edit" type="font-awesome" size={12} color="#6b7280" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete('kelas', item.id, item.namaKelas)}
            activeOpacity={0.85}
          >
            <Icon name="trash" type="font-awesome" size={12} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMapelItem = ({ item }: { item: Mapel }) => (
    <View style={styles.mapelCard}>
      <View style={styles.mapelCardHeader}>
        <View style={styles.mapelIconContainer}>
          <FontAwesome6 name="book-open" size={18}  />
        </View>

        <View style={styles.mapelInfo}>
          <Text style={styles.mapelTitle}>{item.nama}</Text>
<Text style={styles.mapelKode}>{item.kode}</Text>
          {item.deskripsi && (
            <Text style={styles.mapelDeskripsi} numberOfLines={2}>
              {item.deskripsi}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.mapelActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEdit('mapel', item)}
        >
          <Icon name="edit" type="font-awesome" size={12} color="#6b7280" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete('mapel', item.id, item.nama)}
          activeOpacity={0.85}
        >
          <Icon name="trash" type="font-awesome" size={12} color="#ef4444" />
          <Text style={styles.deleteButtonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // NEW: Render Pengajar Modal
  const renderPengajarModal = () => (
    <Modal
      visible={pengajarModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setPengajarModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={() => setPengajarModalVisible(false)}
      >
        <View
          style={[
            styles.pengajarModalContent,
            {
              top: pengajarModalPosition.top,
              left: Math.max(
                16,
                Math.min(
                  pengajarModalPosition.left,
                  // Ensure modal doesn't go off screen
                  // You may need to calculate screen width dynamically
                  // This is a simple approximation
                  300,
                ),
              ),
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.pengajarModalHeader}>
            <View style={styles.detailTitleContainer}>
              <FontAwesome6
                name="chalkboard-teacher"
                size={16}
                color="#f59e0b"
              />
              <Text style={styles.pengajarModalTitle}>
                Pengajar Kelas {selectedKelasName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setPengajarModalVisible(false)}
              style={styles.closeModalButton}
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {loadingPengajarKelas ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.loadingText}>Memuat data pengajar...</Text>
            </View>
          ) : pengajarKelas.length === 0 ? (
            <View style={styles.emptyPengajarContainer}>
              <FontAwesome6 name="user-slash" size={24} color="#d1d5db" />
              <Text style={styles.emptyPengajarText}>
                Belum ada pengajar di kelas ini
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.pengajarList}
            >
              {pengajarKelas.map(p => (
                <View key={p.id} style={styles.pengajarItem}>
                  <View style={styles.pengajarAvatar}>
                    <Text style={styles.pengajarAvatarText}>
                      {(p.name || 'P').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.pengajarInfo}>
                    <Text style={styles.pengajarName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.pengajarEmail} numberOfLines={1}>
                      {p.email}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderDeleteModal = () => (
    <Modal
      visible={deleteModal}
      transparent
      animationType="fade"
      onRequestClose={() => setDeleteModal(false)}
    >

      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIconContainer}>
              <Icon
                name="exclamation-triangle"
                type="font-awesome"
                size={24}
                color="#ef4444"
              />
            </View>
            <Text style={styles.modalTitle}>
              Hapus{' '}
              {itemToDelete?.type === 'kelas' ? 'Kelas' : 'Mata Pelajaran'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Apakah Anda yakin ingin menghapus{' '}
              {itemToDelete?.type === 'kelas' ? 'kelas' : 'mata pelajaran'} ini?
            </Text>
          </View>

          {itemToDelete && (
            <View style={styles.itemToDeleteInfo}>
              <View
                style={[
                  styles.deleteIconContainer,
                  {
                    backgroundColor:
                      itemToDelete.type === 'kelas' ? '#eff6ff' : '#f5f3ff',
                  },
                ]}
              >
                <FontAwesome6
                  name={itemToDelete.type === 'kelas' ? 'users' : 'book-open'}
                  size={20}
                  color={itemToDelete.type === 'kelas' ? '#2563eb' : '#7c3aed'}
                />
              </View>
              <View style={styles.itemToDeleteDetails}>
                <Text style={styles.deleteItemName}>{itemToDelete.name}</Text>
                <Text style={styles.deleteItemType}>
                  {itemToDelete.type === 'kelas' ? 'Kelas' : 'Mata Pelajaran'}
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.warningText}>
            {itemToDelete?.type === 'kelas'
              ? 'Semua data terkait kelas ini akan terhapus. Tindakan ini tidak dapat dibatalkan.'
              : 'Mata pelajaran ini akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan.'}
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setDeleteModal(false)}
              disabled={loadingDelete}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCancelButtonText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalDeleteButton,
                loadingDelete && styles.disabled,
              ]}
              onPress={confirmDelete}
              disabled={loadingDelete}
              activeOpacity={0.85}
            >
              {loadingDelete ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Icon
                    name="trash"
                    type="font-awesome"
                    size={14}
                    color="#fff"
                  />
                  <Text style={styles.modalDeleteButtonText}>Hapus</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

const renderEditModal = () => (
  <Modal
    visible={editModal}
    transparent
    animationType="fade"
    onRequestClose={() => setEditModal(false)}
  >
    <View style={styles.modalBackdrop}>
      <View style={styles.editModalContent}>
        {/* Header */}
        <View style={styles.editModalHeader}>
          <View style={styles.editModalIconContainer}>
            <FontAwesome6 
              name={editType === 'kelas' ? 'users' : 'book-open'} 
              size={24} 
              color={editType === 'kelas' ? '#2563eb' : '#7c3aed'} 
            />
          </View>
          <Text style={styles.editModalTitle}>
            Edit {editType === 'kelas' ? 'Kelas' : 'Mata Pelajaran'}
          </Text>
          <TouchableOpacity
            style={styles.editModalCloseButton}
            onPress={() => setEditModal(false)}
            activeOpacity={0.85}
          >
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.editFormContainer}>
          {/* Nama */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {editType === 'kelas' ? 'Nama Kelas' : 'Nama Mata Pelajaran'}
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={editNama}
                onChangeText={setEditNama}
                style={styles.input}
                placeholder={`Masukkan ${editType === 'kelas' ? 'nama kelas' : 'nama mata pelajaran'}`}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Kode Mapel (hanya untuk mapel) */}
          {editType === 'mapel' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Kode Mata Pelajaran
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={editKode}
                  onChangeText={setEditKode}
                  style={styles.input}
                  placeholder="Contoh: MAT-001"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="characters"
                  maxLength={20}
                />
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.editModalActions}>
          <TouchableOpacity
            style={styles.editCancelButton}
            onPress={() => setEditModal(false)}
            disabled={loadingEdit}
            activeOpacity={0.85}
          >
            <Text style={styles.editCancelButtonText}>Batal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.editSaveButton, loadingEdit && styles.disabled]}
            onPress={submitEdit}
            disabled={loadingEdit}
            activeOpacity={0.85}
          >
            {loadingEdit ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.editSaveButtonText}>Simpan Perubahan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome6
        name={activeTab === 'kelas' ? 'school' : 'book-open-reader'}
        size={60}
        color="#d1d5db"
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'kelas' ? 'Belum ada kelas' : 'Belum ada mata pelajaran'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'kelas'
          ? 'Tambahkan kelas baru untuk memulai'
          : 'Tambahkan mata pelajaran baru untuk sistem'}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <ScrollView
        style={styles.scrollView}
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
        {renderHeader()}
        {renderTabSelector()}

        {/* Kelas List */}
        {activeTab === 'kelas' && (
          <View style={styles.listContainer}>
            {kelasList.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={kelasList}
                keyExtractor={item => item.id.toString()}
                renderItem={renderKelasItem}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        )}

        {/* Mapel List */}
        {activeTab === 'mapel' && (
          <View style={styles.listContainer}>
            {mapelList.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={mapelList}
                keyExtractor={item => item.id.toString()}
                renderItem={renderMapelItem}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {renderDeleteModal()}
      {renderPengajarModal()}
      {renderEditModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header
  header: {
    backgroundColor: '#1e3a8a',
    paddingTop: Platform.OS === 'android' ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#c7d2fe',
    fontSize: 14,
    fontWeight: '500',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 12,
    marginTop: 4,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#2563eb',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  tabTextActive: {
    color: '#fff',
  },

  // List Container
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  // Kelas Card
  kelasCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  kelasCardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  kelasIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  kelasInfo: {
    flex: 1,
  },
  kelasTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kelasTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2933',
    flex: 1,
  },
  kelasStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  kelasDeskripsi: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  kelasActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },

  // NEW: Pengajar Button
  pengajarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  pengajarButtonText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginLeft: 6,
  },

  // Mapel Card
  mapelCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mapelCardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mapelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f5f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  mapelInfo: {
    flex: 1,
  },
  mapelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2933',
    marginBottom: 6,
  },
    mapelKode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2933',
    marginBottom: 6,
  },
  mapelDeskripsi: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  mapelActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },

  // Action Buttons
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  editButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 6,
  },

  // NEW: Pengajar Modal
  pengajarModalContent: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: 300,
    maxHeight: 400,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1000,
  },
  pengajarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pengajarModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2933',
    marginLeft: 10,
  },
  closeModalButton: {
    padding: 4,
  },
  detailTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pengajarList: {
    maxHeight: 300,
  },
  pengajarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pengajarAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pengajarAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563eb',
  },
  pengajarInfo: {
    flex: 1,
  },
  pengajarName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2933',
    marginBottom: 2,
  },
  pengajarEmail: {
    fontSize: 11,
    color: '#6b7280',
  },

  // Loading & Empty States
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyPengajarContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyPengajarText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
    fontWeight: '500',
  },

  // Modal Backdrop
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Delete Modal (existing styles)
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  itemToDeleteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  deleteIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemToDeleteDetails: {
    flex: 1,
  },
  deleteItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2933',
    marginBottom: 4,
  },
  deleteItemType: {
    fontSize: 13,
    color: '#6b7280',
  },
  warningText: {
    fontSize: 13,
    color: '#6b7280',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fde68a',
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  modalDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#dc2626',
  },
  modalDeleteButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.7,
  },

  // Spacer
  spacer: {
    height: 100,
  },

    editModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  editModalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  editModalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2933',
  },
  editModalCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
  editFormContainer: {
    padding: 24,
    paddingTop: 16,
    maxHeight: 500,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 16,
    color: '#1f2933',
    paddingVertical: 14,
    minHeight: 48,
  },
  textareaContainer: {
    minHeight: 100,
  },
  textarea: {
    minHeight: 100,
    paddingTop: 16,
    paddingBottom: 16,
  },
  editModalActions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  editCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  editCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  editSaveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    gap: 8,
  },
  editSaveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
});

export default KelasListScreen;
