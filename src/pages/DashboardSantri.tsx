// screens/SantriDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { userService, User, Task } from '../services/user';

const DashboardSantri = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState<string>('belum');
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1️⃣ Ambil data user
      const userResult = await userService.getUser(1); // testing ID 1
      if (userResult.success && userResult.data) {
        const userData = userResult.data;
        setUser(userData);

        // 2️⃣ Ambil data dashboard dari API
        const dashboardResult = await userService.getDashboardData(userData.id);
        if (dashboardResult.success && dashboardResult.data) {
          // Urutkan tasks berdasarkan deadline
          const sortedTasks = dashboardResult.data.tasks.sort(
            (a: Task, b: Task) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
          setTasks(sortedTasks);
          setAttendance(dashboardResult.data.attendance);
          setAnnouncements(dashboardResult.data.announcements);
        }
      } else {
        Alert.alert('Error', userResult.error || 'Gagal memuat data user');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  const handleAbsen = async (status: 'hadir' | 'izin' | 'sakit') => {
    if (!user) return;

    try {
      const result = await userService.submitAttendance(status, user.id);
      if (result.success) {
        Alert.alert('Sukses', `Absen ${status} berhasil dicatat!`);
        setAttendance(status);
      } else {
        Alert.alert('Error', result.error || 'Gagal mengirim absen ke database');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Terjadi kesalahan');
    }
  };

  const renderAttendanceButton = () => {
    if (attendance === 'belum') {
      return (
        <View style={styles.absenContainer}>
          <Text style={styles.sectionSubtitle}>Silakan absen:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.hadirButton]}
              onPress={() => handleAbsen('hadir')}
            >
              <Text style={styles.buttonText}>Hadir ✅</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.izinButton]}
              onPress={() => handleAbsen('izin')}
            >
              <Text style={styles.buttonText}>Izin ⚠️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.sakitButton]}
              onPress={() => handleAbsen('sakit')}
            >
              <Text style={styles.buttonText}>Sakit ❌</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.attendanceStatus,
          { backgroundColor: attendance === 'hadir' ? '#E8F5E9' : '#FFF3E0' },
        ]}
      >
        <Text
          style={[
            styles.attendanceText,
            { color: attendance === 'hadir' ? '#4CAF50' : '#FF9800' },
          ]}
        >
          ✓ Sudah absen ({attendance})
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Assalamu'alaikum,</Text>
        <Text style={styles.userName}>{user?.name || 'Santri'}</Text>
        <Text style={styles.classInfo}>
          {user?.kelas?.namaKelas || 'Kelas: Belum ditentukan'}
        </Text>
      </View>

      {/* Absensi */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Absensi Hari Ini</Text>
        {renderAttendanceButton()}
      </View>

      {/* Tugas */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tugas ({tasks.length})</Text>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <View
              key={task.id}
              style={[
                styles.taskItem,
                { borderLeftColor: task.status === 'selesai' ? '#4CAF50' : '#FF9800' },
              ]}
            >
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDeadline}>
                Deadline: {new Date(task.deadline).toLocaleDateString('id-ID')}
              </Text>
              <Text
                style={[
                  styles.taskStatus,
                  { color: task.status === 'selesai' ? '#4CAF50' : '#FF9800' },
                ]}
              >
                {task.status === 'selesai' ? '✓ Selesai' : 'Belum dikumpulkan'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Tidak ada tugas</Text>
        )}
      </View>

      {/* Pengumuman */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pengumuman</Text>
        {announcements.length > 0 ? (
          announcements.map((item, index) => (
            <View key={index} style={styles.announcementItem}>
              <Text style={styles.announcementText}>• {item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Tidak ada pengumuman</Text>
        )}
      </View>

      {/* Quick Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Info Singkat</Text>
        <Text style={styles.infoText}>• Total tugas: {tasks.length}</Text>
        <Text
          style={[
            styles.infoText,
            { color: attendance === 'hadir' ? '#4CAF50' : '#FF9800' },
          ]}
        >
          • Status absen: {attendance === 'belum' ? 'Belum absen' : attendance}
        </Text>
        <Text style={styles.infoText}>• Role: {user?.role}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  header: { backgroundColor: '#4A90E2', padding: 20, paddingTop: 40 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  userName: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  classInfo: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 5 },
  card: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  absenContainer: { marginTop: 8 },
  sectionSubtitle: { fontSize: 14, color: '#666', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  hadirButton: { backgroundColor: '#4CAF50', marginRight: 4 },
  izinButton: { backgroundColor: '#FF9800', marginHorizontal: 4 },
  sakitButton: { backgroundColor: '#F44336', marginLeft: 4 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  attendanceStatus: { padding: 16, borderRadius: 8, alignItems: 'center' },
  attendanceText: { fontSize: 16, fontWeight: 'bold' },
  taskItem: { backgroundColor: '#F9F9F9', padding: 12, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  taskDeadline: { fontSize: 14, color: '#666', marginTop: 4 },
  taskStatus: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  announcementItem: { marginBottom: 10 },
  announcementText: { fontSize: 14, color: '#666', lineHeight: 20 },
  emptyText: { color: '#999', textAlign: 'center', padding: 20, fontSize: 16 },
  infoCard: { backgroundColor: '#E3F2FD', margin: 16, marginTop: 16, marginBottom: 32, borderRadius: 12, padding: 16 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#1976D2', marginBottom: 12 },
  infoText: { fontSize: 14, color: '#424242', marginBottom: 6 },
});

export default DashboardSantri;
