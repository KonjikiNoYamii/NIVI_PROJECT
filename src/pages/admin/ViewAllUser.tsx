import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../../services/api';
import { Icon } from 'react-native-elements';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  profile?: {
    fotoUrl?: string;
  } | null;
}

const UserListScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Roles untuk filter
  const roles = ['all', 'admin', 'pengajar', 'santri'];
  const statuses = ['all', 'active', 'inactive'];

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API}/users/all/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.data || response.data || [];
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error: any) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Gagal memuat data pengguna');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setLoadingDelete(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${API}/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Berhasil', 'Pengguna berhasil dihapus');
      setDeleteModal(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      Alert.alert(
        'Gagal',
        error.response?.data?.message || 'Gagal menghapus pengguna',
      );
    } finally {
      setLoadingDelete(false);
    }
  };

  // Filter dan search
  useEffect(() => {
    let result = users;

    // Filter by role
    if (selectedRole !== 'all') {
      result = result.filter(user => user.role === selectedRole);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      const isActive = selectedStatus === 'active';
      result = result.filter(user => user.isActive === isActive);
    }

    // Search by name or email
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      );
    }

    setFilteredUsers(result);
  }, [users, selectedRole, selectedStatus, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useFocusEffect(
  useCallback(() => {
    loadUsers(); // Memuat ulang daftar pengguna setiap layar difokuskan
  }, [])
);


  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return '#dc2626';
      case 'pengajar':
        return '#2563eb';
      case 'santri':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'user-shield';
      case 'pengajar':
        return 'chalkboard-teacher';
      case 'santri':
        return 'user-graduate';
      default:
        return 'user';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const getRandomColor = (id: number) => {
    const colors = ['#2563eb', '#7c3aed', '#059669', '#f59e0b', '#dc2626'];
    return colors[id % colors.length];
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userCardHeader}>
        <View style={styles.userAvatarContainer}>
          {item.profile?.fotoUrl ? (
            <View style={styles.avatarImageContainer}>
              <Icon
                name={getRoleIcon(item.role)}
                type="font-awesome-5"
                size={16}
                color="#ffffff"
                style={styles.roleBadgeIcon}
              />
            </View>
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: `${getRandomColor(item.id)}15` },
              ]}
            >
              <Text
                style={[styles.avatarText, { color: getRandomColor(item.id) }]}
              >
                {getInitials(item.name)}
              </Text>
              <Icon
                name={getRoleIcon(item.role)}
                type="font-awesome-5"
                size={10}
                color={getRandomColor(item.id)}
                style={styles.roleBadgeIconSmall}
              />
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.name}
            </Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: `${getRoleColor(item.role)}15` },
              ]}
            >
              <Icon
                name={getRoleIcon(item.role)}
                type="font-awesome-5"
                size={10}
                color={getRoleColor(item.role)}
                style={styles.roleBadgeIconSmall}
              />
              <Text
                style={[styles.roleText, { color: getRoleColor(item.role) }]}
              >
                {item.role.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.userDetails}>
            <Ionicons name="mail-outline" size={12} color="#6b7280" />
            <Text style={styles.userEmail} numberOfLines={1}>
              {item.email}
            </Text>
          </View>

          <View style={styles.userMeta}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: item.isActive ? '#10b98115' : '#f3f4f6' },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: item.isActive ? '#10b981' : '#9ca3af' },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: item.isActive ? '#10b981' : '#6b7280' },
                ]}
              >
                {item.isActive ? 'Aktif' : 'Nonaktif'}
              </Text>
            </View>

            {item.createdAt && (
              <View style={styles.dateInfo}>
                <Ionicons name="calendar-outline" size={10} color="#9ca3af" />
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString('id-ID')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {}}
          activeOpacity={0.85}
        >
          <Icon name="edit" type="font-awesome" size={12} color="#6b7280" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
          activeOpacity={0.85}
        >
          <Icon name="trash" type="font-awesome" size={12} color="#ef4444" />
          <Text style={styles.deleteButtonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Manajemen Pengguna</Text>
        <Text style={styles.headerSubtitle}>
          Kelola data pengguna dan akses sistem
        </Text>
      </View>
      <TouchableOpacity style={styles.headerIcon}>
        <FontAwesome6 name="users-gear" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filterContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#9ca3af"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau email..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Role Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.roleFilterContainer}
      >
        {roles.map(role => (
          <TouchableOpacity
            key={role}
            style={[
              styles.filterButton,
              selectedRole === role && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedRole(role)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedRole === role && styles.filterButtonTextActive,
              ]}
            >
              {role === 'all' ? 'Semua Role' : role}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilterContainer}
      >
        {statuses.map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              styles.statusFilterButton,
              selectedStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus(status)}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.statusIndicator,
                status === 'active' && styles.statusIndicatorActive,
                status === 'inactive' && styles.statusIndicatorInactive,
              ]}
            />
            <Text
              style={[
                styles.filterButtonText,
                selectedStatus === status && styles.filterButtonTextActive,
              ]}
            >
              {status === 'all'
                ? 'Semua Status'
                : status === 'active'
                ? 'Aktif'
                : 'Nonaktif'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderResultsInfo = () => (
    <View style={styles.resultsInfo}>
      <Text style={styles.resultsText}>
        Menampilkan {filteredUsers.length} dari {users.length} pengguna
      </Text>
      {(selectedRole !== 'all' || selectedStatus !== 'all' || searchQuery) && (
        <TouchableOpacity
          style={styles.resetFilterButton}
          onPress={() => {
            setSelectedRole('all');
            setSelectedStatus('all');
            setSearchQuery('');
          }}
        >
          <Text style={styles.resetFilterText}>Reset Filter</Text>
        </TouchableOpacity>
      )}
    </View>
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
            <Text style={styles.modalTitle}>Hapus Pengguna</Text>
            <Text style={styles.modalSubtitle}>
              Apakah Anda yakin ingin menghapus pengguna ini?
            </Text>
          </View>

          {userToDelete && (
            <View style={styles.userToDeleteInfo}>
              <View
                style={[
                  styles.deleteAvatar,
                  { backgroundColor: `${getRandomColor(userToDelete.id)}15` },
                ]}
              >
                <Text
                  style={[
                    styles.deleteAvatarText,
                    { color: getRandomColor(userToDelete.id) },
                  ]}
                >
                  {getInitials(userToDelete.name)}
                </Text>
              </View>
              <View style={styles.userToDeleteDetails}>
                <Text style={styles.deleteUserName}>{userToDelete.name}</Text>
                <Text style={styles.deleteUserEmail}>{userToDelete.email}</Text>
                <View style={styles.deleteUserMeta}>
                  <Text
                    style={[
                      styles.deleteUserRole,
                      { color: getRoleColor(userToDelete.role) },
                    ]}
                  >
                    {userToDelete.role.toUpperCase()}
                  </Text>
                  <Text style={styles.deleteUserStatus}>
                    • {userToDelete.isActive ? 'Aktif' : 'Nonaktif'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <Text style={styles.warningText}>
            Tindakan ini tidak dapat dibatalkan. Semua data terkait pengguna ini
            akan dihapus permanen.
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
                  <Text style={styles.modalDeleteButtonText}>
                    Hapus Permanen
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Memuat data pengguna...</Text>
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
      >
        {renderHeader()}
        {renderFilters()}
        {renderResultsInfo()}

        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="users-slash" size={60} color="#d1d5db" />
            <Text style={styles.emptyTitle}>
              {searchQuery || selectedRole !== 'all' || selectedStatus !== 'all'
                ? 'Tidak ada hasil ditemukan'
                : 'Belum ada pengguna'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || selectedRole !== 'all' || selectedStatus !== 'all'
                ? 'Coba dengan filter atau kata kunci lain'
                : 'Tidak ada pengguna terdaftar di sistem'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={filteredUsers}
              keyExtractor={item => item.id.toString()}
              renderItem={renderUserItem}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {renderDeleteModal()}
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

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Filter Section
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#374151',
  },
  roleFilterContainer: {
    marginBottom: 8,
  },
  statusFilterContainer: {
    marginBottom: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  statusFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
    marginRight: 8,
  },
  statusIndicatorActive: {
    backgroundColor: '#10b981',
  },
  statusIndicatorInactive: {
    backgroundColor: '#6b7280',
  },

  // Results Info
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultsText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  resetFilterButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resetFilterText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },

  // List Container
  listContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 16,
  },

  // User Card
  userCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  userCardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userAvatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  avatarImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  roleBadgeIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
  },
  roleBadgeIconSmall: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 2,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2933',
    flex: 1,
    marginRight: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    flex: 1,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#9ca3af',
    marginLeft: 4,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
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

  // Empty State
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

  // Delete Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
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
  userToDeleteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  deleteAvatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  deleteAvatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  userToDeleteDetails: {
    flex: 1,
  },
  deleteUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2933',
    marginBottom: 4,
  },
  deleteUserEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  deleteUserMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteUserRole: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },
  deleteUserStatus: {
    fontSize: 12,
    color: '#9ca3af',
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
    flex: 2,
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
});

export default UserListScreen;
