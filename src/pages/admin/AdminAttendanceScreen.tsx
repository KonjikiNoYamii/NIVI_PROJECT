// App.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Platform,
  StatusBar
} from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

// Tipe data untuk absensi
interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpha';
  location: string;
  notes?: string;
}

// Tipe data untuk pengguna
interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
}

// Tipe data untuk filter
interface FilterOptions {
  date: string;
  status: string;
  department: string;
  searchQuery: string;
}

const AdminAttendanceScreen: React.FC = () => {
  // State untuk data
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    { id: '1', userId: '101', userName: 'Ahmad Rizki', date: '2023-10-15', checkIn: '08:00', checkOut: '17:00', status: 'hadir', location: 'Kantor Pusat' },
    { id: '2', userId: '102', userName: 'Budi Santoso', date: '2023-10-15', checkIn: '08:15', checkOut: '17:30', status: 'terlambat', location: 'Kantor Cabang A' },
    { id: '3', userId: '103', userName: 'Citra Dewi', date: '2023-10-15', checkIn: '08:05', checkOut: null, status: 'hadir', location: 'Kantor Pusat' },
    { id: '4', userId: '104', userName: 'Dian Pratama', date: '2023-10-15', checkIn: '09:30', checkOut: '17:00', status: 'izin', location: 'Remote', notes: 'Ijin dokter' },
    { id: '5', userId: '105', userName: 'Eko Wijaya', date: '2023-10-15', checkIn: '08:00', checkOut: '16:45', status: 'sakit', location: 'Rumah' },
    { id: '6', userId: '106', userName: 'Fitriani', date: '2023-10-14', checkIn: '08:10', checkOut: '17:10', status: 'hadir', location: 'Kantor Pusat' },
    { id: '7', userId: '107', userName: 'Gunawan', date: '2023-10-14', checkIn: '08:00', checkOut: '17:00', status: 'hadir', location: 'Kantor Cabang B' },
    { id: '8', userId: '108', userName: 'Hendra', date: '2023-10-14', checkIn: '10:00', checkOut: '17:00', status: 'terlambat', location: 'Kantor Pusat' },
  ]);
  
  const [users, setUsers] = useState<User[]>([
    { id: '101', name: 'Ahmad Rizki', email: 'ahmad@example.com', department: 'IT', position: 'Frontend Developer' },
    { id: '102', name: 'Budi Santoso', email: 'budi@example.com', department: 'Marketing', position: 'Marketing Specialist' },
    { id: '103', name: 'Citra Dewi', email: 'citra@example.com', department: 'HR', position: 'HR Manager' },
    { id: '104', name: 'Dian Pratama', email: 'dian@example.com', department: 'Finance', position: 'Accountant' },
    { id: '105', name: 'Eko Wijaya', email: 'eko@example.com', department: 'IT', position: 'Backend Developer' },
    { id: '106', name: 'Fitriani', email: 'fitri@example.com', department: 'Marketing', position: 'Digital Marketing' },
    { id: '107', name: 'Gunawan', email: 'gunawan@example.com', department: 'Operations', position: 'Operations Manager' },
    { id: '108', name: 'Hendra', email: 'hendra@example.com', department: 'Finance', position: 'Financial Analyst' },
  ]);
  
  // State untuk UI
  const [filter, setFilter] = useState<FilterOptions>({
    date: new Date().toISOString().split('T')[0],
    status: 'all',
    department: 'all',
    searchQuery: '',
  });
  
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<AttendanceRecord>>({
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:00',
    checkOut: '17:00',
    status: 'hadir',
    location: 'Kantor Pusat',
  });
  
  // Statistik
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
  });
  
  // Filter data berdasarkan opsi
  const filteredRecords = attendanceRecords.filter(record => {
    // Filter berdasarkan tanggal
    if (filter.date && record.date !== filter.date) return false;
    
    // Filter berdasarkan status
    if (filter.status !== 'all' && record.status !== filter.status) return false;
    
    // Filter berdasarkan departemen
    if (filter.department !== 'all') {
      const user = users.find(u => u.id === record.userId);
      if (!user || user.department !== filter.department) return false;
    }
    
    // Filter berdasarkan pencarian
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      const user = users.find(u => u.id === record.userId);
      if (!user?.name.toLowerCase().includes(query) && 
          !record.location.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Hitung statistik
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter(record => record.date === today);
    
    const presentToday = todayRecords.filter(record => record.status === 'hadir').length;
    const lateToday = todayRecords.filter(record => record.status === 'terlambat').length;
    const absentToday = todayRecords.filter(record => 
      ['izin', 'sakit', 'alpha'].includes(record.status)
    ).length;
    
    setStats({
      totalEmployees: users.length,
      presentToday,
      lateToday,
      absentToday,
    });
  }, [attendanceRecords, users]);
  
  // Handler untuk refresh
  const onRefresh = () => {
    setRefreshing(true);
    // Simulasi fetch data dari API
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };
  
  // Handler untuk mengubah status absensi
  const handleUpdateStatus = (id: string, newStatus: AttendanceRecord['status']) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.id === id ? { ...record, status: newStatus } : record
      )
    );
  };
  
  // Handler untuk menambahkan absensi manual
  const handleAddAttendance = () => {
    if (!newRecord.userId || !newRecord.date) {
      Alert.alert('Error', 'Harap pilih karyawan dan tanggal');
      return;
    }
    
    const user = users.find(u => u.id === newRecord.userId);
    
    const record: AttendanceRecord = {
      id: Date.now().toString(),
      userId: newRecord.userId!,
      userName: user?.name || 'Unknown',
      date: newRecord.date!,
      checkIn: newRecord.checkIn || '08:00',
      checkOut: newRecord.checkOut || null,
      status: newRecord.status as AttendanceRecord['status'] || 'hadir',
      location: newRecord.location || 'Kantor Pusat',
      notes: newRecord.notes,
    };
    
    setAttendanceRecords(prev => [record, ...prev]);
    setAddModalVisible(false);
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      checkIn: '08:00',
      checkOut: '17:00',
      status: 'hadir',
      location: 'Kantor Pusat',
    });
    Alert.alert('Sukses', 'Absensi berhasil ditambahkan');
  };
  
  // Handler untuk menghapus absensi
  const handleDeleteAttendance = (id: string) => {
    Alert.alert(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus data absensi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: () => {
            setAttendanceRecords(prev => prev.filter(record => record.id !== id));
            setModalVisible(false);
          }
        }
      ]
    );
  };
  
  // Format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Warna berdasarkan status
  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch(status) {
      case 'hadir': return '#4CAF50';
      case 'terlambat': return '#FF9800';
      case 'izin': return '#2196F3';
      case 'sakit': return '#9C27B0';
      case 'alpha': return '#F44336';
      default: return '#757575';
    }
  };
  
  // Render item absensi
  const renderAttendanceItem = (record: AttendanceRecord) => {
    const user = users.find(u => u.id === record.userId);
    
    return (
      <TouchableOpacity
        key={record.id}
        style={styles.attendanceItem}
        onPress={() => {
          setSelectedRecord(record);
          setModalVisible(true);
        }}
      >
        <View style={styles.attendanceHeader}>
          <View>
            <Text style={styles.userName}>{record.userName}</Text>
            <Text style={styles.userDept}>{user?.department} • {user?.position}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) }]}>
            <Text style={styles.statusText}>{record.status.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.attendanceDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>Check-in: {record.checkIn}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.detailText}>
              Check-out: {record.checkOut || 'Belum'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{record.location}</Text>
          </View>
        </View>
        
        <Text style={styles.dateText}>{formatDate(record.date)}</Text>
      </TouchableOpacity>
    );
  };
  
  // Daftar departemen unik
  const departments = ['all', ...Array.from(new Set(users.map(user => user.department)))];
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Absensi</Text>
          <Text style={styles.headerSubtitle}>Kelola data kehadiran karyawan</Text>
        </View>
        <TouchableOpacity 
          style={styles.statsButton}
          onPress={() => setStatsModalVisible(true)}
        >
          <Ionicons name="stats-chart" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <Text style={styles.sectionTitle}>Filter Data</Text>
        
        <View style={styles.filterRow}>
          <View style={styles.filterInput}>
            <Ionicons name="calendar-outline" size={18} color="#666" style={styles.filterIcon} />
            <TextInput
              style={styles.filterTextInput}
              value={filter.date}
              onChangeText={(text) => setFilter({...filter, date: text})}
              placeholder="YYYY-MM-DD"
            />
          </View>
          
          <View style={styles.filterInput}>
            <Ionicons name="search-outline" size={18} color="#666" style={styles.filterIcon} />
            <TextInput
              style={styles.filterTextInput}
              value={filter.searchQuery}
              onChangeText={(text) => setFilter({...filter, searchQuery: text})}
              placeholder="Cari nama atau lokasi..."
            />
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Status:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.statusFilters}>
                <TouchableOpacity
                  style={[
                    styles.statusFilter,
                    filter.status === 'all' && styles.statusFilterActive
                  ]}
                  onPress={() => setFilter({...filter, status: 'all'})}
                >
                  <Text style={[
                    styles.statusFilterText,
                    filter.status === 'all' && styles.statusFilterTextActive
                  ]}>Semua</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.statusFilter,
                    filter.status === 'hadir' && styles.statusFilterActive
                  ]}
                  onPress={() => setFilter({...filter, status: 'hadir'})}
                >
                  <Text style={[
                    styles.statusFilterText,
                    filter.status === 'hadir' && styles.statusFilterTextActive
                  ]}>Hadir</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.statusFilter,
                    filter.status === 'terlambat' && styles.statusFilterActive
                  ]}
                  onPress={() => setFilter({...filter, status: 'terlambat'})}
                >
                  <Text style={[
                    styles.statusFilterText,
                    filter.status === 'terlambat' && styles.statusFilterTextActive
                  ]}>Terlambat</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.statusFilter,
                    filter.status === 'izin' && styles.statusFilterActive
                  ]}
                  onPress={() => setFilter({...filter, status: 'izin'})}
                >
                  <Text style={[
                    styles.statusFilterText,
                    filter.status === 'izin' && styles.statusFilterTextActive
                  ]}>Izin</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.statusFilter,
                    filter.status === 'sakit' && styles.statusFilterActive
                  ]}
                  onPress={() => setFilter({...filter, status: 'sakit'})}
                >
                  <Text style={[
                    styles.statusFilterText,
                    filter.status === 'sakit' && styles.statusFilterTextActive
                  ]}>Sakit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.statusFilter,
                    filter.status === 'alpha' && styles.statusFilterActive
                  ]}
                  onPress={() => setFilter({...filter, status: 'alpha'})}
                >
                  <Text style={[
                    styles.statusFilterText,
                    filter.status === 'alpha' && styles.statusFilterTextActive
                  ]}>Alpha</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Departemen:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.departmentFilters}>
                {departments.map(dept => (
                  <TouchableOpacity
                    key={dept}
                    style={[
                      styles.departmentFilter,
                      filter.department === dept && styles.departmentFilterActive
                    ]}
                    onPress={() => setFilter({...filter, department: dept})}
                  >
                    <Text style={[
                      styles.departmentFilterText,
                      filter.department === dept && styles.departmentFilterTextActive
                    ]}>{dept === 'all' ? 'Semua' : dept}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
      
      {/* Data Section */}
      <View style={styles.dataContainer}>
        <View style={styles.dataHeader}>
          <Text style={styles.sectionTitle}>
            Data Absensi ({filteredRecords.length} ditemukan)
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Tambah</Text>
          </TouchableOpacity>
        </View>
        
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Tidak ada data absensi</Text>
            <Text style={styles.emptyStateSubtext}>
              Coba ubah filter atau tambah data absensi baru
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {filteredRecords.map(renderAttendanceItem)}
          </ScrollView>
        )}
      </View>
      
      {/* Modal Detail */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRecord && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detail Absensi</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalBody}>
                  <View style={styles.modalUserInfo}>
                    <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedRecord.status) }]}>
                      <Text style={styles.modalStatusText}>{selectedRecord.status.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.modalUserName}>{selectedRecord.userName}</Text>
                    <Text style={styles.modalDate}>{formatDate(selectedRecord.date)}</Text>
                  </View>
                  
                  <View style={styles.modalDetails}>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="time-outline" size={20} color="#666" />
                      <Text style={styles.modalDetailLabel}>Check-in:</Text>
                      <Text style={styles.modalDetailValue}>{selectedRecord.checkIn}</Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="time" size={20} color="#666" />
                      <Text style={styles.modalDetailLabel}>Check-out:</Text>
                      <Text style={styles.modalDetailValue}>{selectedRecord.checkOut || 'Belum'}</Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="location-outline" size={20} color="#666" />
                      <Text style={styles.modalDetailLabel}>Lokasi:</Text>
                      <Text style={styles.modalDetailValue}>{selectedRecord.location}</Text>
                    </View>
                    
                    {selectedRecord.notes && (
                      <View style={styles.modalDetailRow}>
                        <Ionicons name="document-text-outline" size={20} color="#666" />
                        <Text style={styles.modalDetailLabel}>Catatan:</Text>
                        <Text style={styles.modalDetailValue}>{selectedRecord.notes}</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.modalSectionTitle}>Ubah Status</Text>
                  <View style={styles.statusActions}>
                    <TouchableOpacity
                      style={[styles.statusAction, { backgroundColor: '#4CAF50' }]}
                      onPress={() => handleUpdateStatus(selectedRecord.id, 'hadir')}
                    >
                      <Text style={styles.statusActionText}>Hadir</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.statusAction, { backgroundColor: '#FF9800' }]}
                      onPress={() => handleUpdateStatus(selectedRecord.id, 'terlambat')}
                    >
                      <Text style={styles.statusActionText}>Terlambat</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.statusAction, { backgroundColor: '#2196F3' }]}
                      onPress={() => handleUpdateStatus(selectedRecord.id, 'izin')}
                    >
                      <Text style={styles.statusActionText}>Izin</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.statusAction, { backgroundColor: '#9C27B0' }]}
                      onPress={() => handleUpdateStatus(selectedRecord.id, 'sakit')}
                    >
                      <Text style={styles.statusActionText}>Sakit</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAttendance(selectedRecord.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                    <Text style={styles.deleteButtonText}>Hapus Data Absensi</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Modal Tambah Absensi */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Absensi Manual</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pilih Karyawan</Text>
                <View style={styles.picker}>
                  {users.map(user => (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.userOption,
                        newRecord.userId === user.id && styles.userOptionSelected
                      ]}
                      onPress={() => setNewRecord({...newRecord, userId: user.id})}
                    >
                      <Text style={[
                        styles.userOptionText,
                        newRecord.userId === user.id && styles.userOptionTextSelected
                      ]}>
                        {user.name} ({user.department})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tanggal</Text>
                <TextInput
                  style={styles.textInput}
                  value={newRecord.date}
                  onChangeText={(text) => setNewRecord({...newRecord, date: text})}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Check-in</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newRecord.checkIn}
                    onChangeText={(text) => setNewRecord({...newRecord, checkIn: text})}
                    placeholder="08:00"
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Check-out</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newRecord.checkOut || ''}
                    onChangeText={(text) => setNewRecord({...newRecord, checkOut: text || null})}
                    placeholder="17:00"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusOptions}>
                  {['hadir', 'terlambat', 'izin', 'sakit', 'alpha'].map(status => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        newRecord.status === status && { backgroundColor: getStatusColor(status as any) }
                      ]}
                      onPress={() => setNewRecord({...newRecord, status: status as any})}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        newRecord.status === status && styles.statusOptionTextSelected
                      ]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lokasi</Text>
                <TextInput
                  style={styles.textInput}
                  value={newRecord.location}
                  onChangeText={(text) => setNewRecord({...newRecord, location: text})}
                  placeholder="Kantor Pusat"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catatan (Opsional)</Text>
                <TextInput
                  style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                  value={newRecord.notes}
                  onChangeText={(text) => setNewRecord({...newRecord, notes: text})}
                  placeholder="Tambahkan catatan jika perlu"
                  multiline
                />
              </View>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddAttendance}
              >
                <Text style={styles.submitButtonText}>Simpan Absensi</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Modal Statistik */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={statsModalVisible}
        onRequestClose={() => setStatsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statsModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Statistik Hari Ini</Text>
              <TouchableOpacity onPress={() => setStatsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalEmployees}</Text>
                <Text style={styles.statLabel}>Total Karyawan</Text>
                <Ionicons name="people-outline" size={32} color="#4CAF50" style={styles.statIcon} />
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.presentToday}</Text>
                <Text style={styles.statLabel}>Hadir</Text>
                <Ionicons name="checkmark-circle-outline" size={32} color="#2196F3" style={styles.statIcon} />
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.lateToday}</Text>
                <Text style={styles.statLabel}>Terlambat</Text>
                <Ionicons name="time-outline" size={32} color="#FF9800" style={styles.statIcon} />
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.absentToday}</Text>
                <Text style={styles.statLabel}>Tidak Hadir</Text>
                <Ionicons name="close-circle-outline" size={32} color="#F44336" style={styles.statIcon} />
              </View>
            </View>
            
            <View style={styles.statsSummary}>
              <Text style={styles.summaryTitle}>Rekap Kehadiran Hari Ini</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Persentase Kehadiran:</Text>
                <Text style={styles.summaryValue}>
                  {stats.totalEmployees > 0 
                    ? Math.round((stats.presentToday / stats.totalEmployees) * 100) 
                    : 0}%
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Keterlambatan:</Text>
                <Text style={styles.summaryValue}>{stats.lateToday} orang</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ketidakhadiran:</Text>
                <Text style={styles.summaryValue}>{stats.absentToday} orang</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statsButton: {
    backgroundColor: '#2196F3',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  filterIcon: {
    marginRight: 8,
  },
  filterTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginRight: 12,
    minWidth: 80,
  },
  statusFilters: {
    flexDirection: 'row',
  },
  statusFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  statusFilterActive: {
    backgroundColor: '#2196F3',
  },
  statusFilterText: {
    fontSize: 12,
    color: '#666',
  },
  statusFilterTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  departmentFilters: {
    flexDirection: 'row',
  },
  departmentFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  departmentFilterActive: {
    backgroundColor: '#4CAF50',
  },
  departmentFilterText: {
    fontSize: 12,
    color: '#666',
  },
  departmentFilterTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  dataContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  dataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  attendanceItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userDept: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  attendanceDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  statsModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalUserInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalUserName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: '#666',
  },
  modalDetails: {
    marginBottom: 24,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 12,
    minWidth: 80,
  },
  modalDetailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  statusAction: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  statusActionText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  picker: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    maxHeight: 150,
  },
  userOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  userOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  userOptionText: {
    fontSize: 14,
    color: '#333',
  },
  userOptionTextSelected: {
    color: '#2196F3',
    fontWeight: '500',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  statusOptionText: {
    fontSize: 12,
    color: '#666',
  },
  statusOptionTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    position: 'relative',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  statsSummary: {
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

export default AdminAttendanceScreen;