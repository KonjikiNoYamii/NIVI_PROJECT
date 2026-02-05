import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Linking,
  StatusBar,
  Platform,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { API } from '../../services/api';
import Ionicons from '@react-native-vector-icons/ionicons';
import Loading from '../../components/loading';

interface Task {
  id: number;
  subject: string;
  title: string;
  description?: string;
  deadline: string;
  status: 'belum_submit' | 'pending' | 'reviewed' | 'rejected';
  submission_link?: string | null;
  submitted_at?: string | null;
  nilai?: number | null;
}

const TaskScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [showLoading, setShowLoading] = useState(false); // modal loading submit
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async (showLoading = true) => {
    try {
      showLoading ? setLoading(true) : setRefreshing(true);

      const token = await AsyncStorage.getItem('token');

      const res = await axios.get(`${API}/tugas/santri`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formatted: Task[] = res.data.data.map((t: any) => {
        const submission = t.submission?.[0]; // submission santri ini

        return {
          id: t.id,
          subject: t.mataPelajaran?.nama ?? 'Mata Pelajaran',
          title: t.title,
          description: t.description,
          deadline: t.deadline,

          status: submission?.status ?? 'belum_submit',

          submission_link: submission?.linkUrl ?? null,
          submitted_at: submission?.submittedAt ?? null,
          nilai: submission?.nilai?.nilai ?? null,
        };
      });

      setTasks(formatted);
    } catch {
      Alert.alert('Error', 'Gagal memuat tugas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const submitAssignment = async (taskId: number) => {
    if (!submissionLink.trim()) {
      Alert.alert('Peringatan', 'Link wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      setShowLoading(true); // tampilkan modal

      const token = await AsyncStorage.getItem('token');

      await axios.post(
        `${API}/submission`,
        {
          tugasId: taskId,
          linkUrl: submissionLink,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // pastikan modal terlihat minimal 2,5 detik
      await new Promise(resolve => setTimeout<any>(resolve, 2500));

      Alert.alert('Sukses', 'Tugas berhasil dikumpulkan');
      setSelectedTask(null);
      setSubmissionLink('');
      fetchTasks(false);
    } catch {
      Alert.alert('Error', 'Gagal mengumpulkan tugas');
    } finally {
      setSubmitting(false);
      setShowLoading(false); // tutup modal
    }
  };

  const isLate = (deadline: string) =>
    new Date(deadline).getTime() < new Date().getTime();

const openLink = async (url: string) => {
  if (!url) {
    Alert.alert('Error', 'Link tidak tersedia');
    return;
  }

  const finalUrl = url.startsWith('http')
    ? url
    : `https://${url}`;

  try {
    await Linking.openURL(finalUrl);
  } catch {
    Alert.alert('Error', 'Gagal membuka link');
  }
};


  useFocusEffect(
    useCallback(() => {
      fetchTasks(true);
    }, [fetchTasks]),
  );



  // Bagian renderItem di TaskScreen
  const renderItem = ({ item }: { item: Task }) => {
    const late = isLate(item.deadline) && item.status === 'pending';

    // Fungsi label status baru
    const getStatusLabel = (status: Task['status']) => {
      switch (status) {
        case 'belum_submit':
          return 'Belum Dikumpulkan';
        case 'pending':
          return 'Menunggu Penilaian';
        case 'reviewed':
          return 'Diterima';
        case 'rejected':
          return 'Ditolak';
      }
    };

    // Fungsi warna status
    const getStatusColor = (status: Task['status']) => {
      switch (status) {
        case 'belum_submit':
          return '#dc2626';
        case 'pending':
          return '#f59e0b';
        case 'reviewed':
          return '#059669';
        case 'rejected':
          return '#dc2626';
      }
    };

    const archiveTask = async (taskId: number) => {
      try {
        const token = await AsyncStorage.getItem('token');

        await axios.patch(
          `${API}/tugas/santri/${taskId}/archive`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        Alert.alert('Sukses', 'Tugas berhasil diarsipkan');
        fetchTasks(false);
      } catch (e: any) {
        Alert.alert(
          'Gagal',
          e?.response?.data?.message ?? 'Tidak dapat mengarsipkan tugas',
        );
      }
    };
    const canArchive = (task: Task) => {
      if (!isLate(task.deadline)) return false;

      return (
        task.status === 'belum_submit' ||
        task.status === 'reviewed' ||
        task.status === 'rejected'
      );
    };

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.subjectContainer}>
            <Text style={styles.subject}>{item.subject}</Text>
          </View>
          <Text style={[styles.deadline, late && styles.late]}>
            {new Date(item.deadline).toLocaleDateString('id-ID')}
          </Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        {item.description && (
          <Text style={styles.desc}>{item.description}</Text>
        )}

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}15` },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        {/* Tombol kumpulkan hanya muncul jika belum submit */}
        {item.status === 'belum_submit' && (
          <TouchableOpacity
            style={[styles.button, late && styles.lateBtn]}
            onPress={() => setSelectedTask(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {late ? 'Kumpulkan (Terlambat)' : 'Kumpulkan'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Submitted info */}
        {item.status !== 'belum_submit' && item.submitted_at && (
          <View style={styles.submittedContainer}>
            <Text style={styles.submittedDate}>
              Dikumpulkan: {new Date(item.submitted_at).toLocaleString('id-ID')}
            </Text>
          </View>
        )}

        {/* Link tugas */}
        {item.submission_link && (
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => setDetailTask(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.linkText}>Lihat Pengumpulan</Text>
          </TouchableOpacity>
        )}

        {canArchive(item) && (
          <TouchableOpacity
            style={styles.archiveBtn}
            onPress={() =>
              Alert.alert(
                'Arsipkan Tugas',
                'Tugas yang diarsipkan akan dipindahkan ke arsip. Lanjutkan?',
                [
                  { text: 'Batal', style: 'cancel' },
                  {
                    text: 'Arsipkan',
                    style: 'destructive',
                    onPress: () => archiveTask(item.id),
                  },
                ],
              )
            }
          >
            <Text style={styles.archiveText}>Arsipkan</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Daftar Tugas</Text>
        <Text style={styles.headerSubtitle}>{tasks.length} tugas tersedia</Text>
      </View>
    </View>
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listTitle}>Semua Tugas</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Memuat tugas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <FlatList
        data={tasks}
        keyExtractor={i => i.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTasks(false)}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        contentContainerStyle={
          tasks.length === 0
            ? { flexGrow: 1, paddingBottom: 100 }
            : [styles.listContainer, { paddingBottom: 100 }]
        }
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderListHeader()}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Belum Ada Tugas</Text>
            <Text style={styles.emptySubtitle}>
              Saat ini belum ada tugas yang diberikan oleh pengajar.
            </Text>

            <TouchableOpacity
              style={styles.reloadBtn}
              onPress={() => fetchTasks(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.reloadText}>Muat Ulang</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />

      {/* Floating Button ke Arsip */}
      <TouchableOpacity
        style={[styles.fab, isFocused && styles.fabFocused]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ArsipTugas')}
      >
        <Ionicons
          name={isFocused ? 'archive' : 'archive-outline'}
          size={22}
          color="#fff"
        />
      </TouchableOpacity>

      <Modal visible={!!selectedTask} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pengumpulan Tugas</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedTask(null);
                  setSubmissionLink('');
                }}
                style={styles.modalCloseButton}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{selectedTask.title}</Text>
                <Text style={styles.taskDeadline}>
                  Deadline:{' '}
                  {new Date(selectedTask.deadline).toLocaleString('id-ID')}
                </Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Link Tugas</Text>
              <Text style={styles.inputHint}>
                Masukkan link Google Drive / Github / dll
              </Text>

              <TextInput
                placeholder="https://..."
                placeholderTextColor="#9ca3af"
                value={submissionLink}
                onChangeText={setSubmissionLink}
                style={styles.input}
                autoCapitalize="none"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedTask(null);
                  setSubmissionLink('');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, submitting && styles.disabled]}
                disabled={submitting}
                onPress={() =>
                  selectedTask && submitAssignment(selectedTask.id)
                }
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Kumpulkan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!detailTask} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Pengumpulan</Text>
              <TouchableOpacity
                onPress={() => setDetailTask(null)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {detailTask && (
              <>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{detailTask.title}</Text>
                  <Text style={styles.submittedDate}>
                    Dikumpulkan:{' '}
                    {detailTask.submitted_at
                      ? new Date(detailTask.submitted_at).toLocaleString(
                          'id-ID',
                        )
                      : '-'}
                  </Text>
                </View>

                {/* STATUS */}
                <View style={styles.statusContainer}>
                  <Text style={styles.label}>Status</Text>
                  <Text style={{ fontWeight: '700' }}>{detailTask.status}</Text>
                </View>

                {/* NILAI */}
                {detailTask.status === 'reviewed' && (
                  <View style={styles.nilaiContainer}>
                    <Text style={styles.nilaiLabel}>Nilai</Text>
                    <Text style={styles.nilaiValue}>
                      {(detailTask as any).nilai ?? '-'}
                    </Text>
                  </View>
                )}

                {/* LINK */}
                {detailTask.submission_link && (
                  <TouchableOpacity
                    style={[styles.button, { marginTop: 20 }]}
                    onPress={() => openLink(detailTask.submission_link!)}
                  >
                    <Text style={styles.buttonText}>Buka Link Pengumpulan</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Loading saat submit */}
      <Loading visible={showLoading} />
    </SafeAreaView>
  );
};

export default TaskScreen;

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  /* HEADER BLOK BIRU - SEKARANG DI DALAM LIST */
  header: {
    backgroundColor: '#1e3a8a',
    paddingTop: Platform.OS === 'android' ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20, // Spasi antara header dan konten
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    marginTop: 6,
    color: '#c7d2fe',
    fontSize: 14,
  },

  // List Styles
  list: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  listHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },

  // List Container
  listContainer: {
    paddingTop: 0, // Header sudah ada marginBottom
    paddingBottom: 32,
  },

  // Card Styles
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectContainer: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subject: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  deadline: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  late: {
    color: '#dc2626',
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2933',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lateBtn: {
    backgroundColor: '#dc2626',
  },
  submittedContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  submittedDate: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  linkContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
    minHeight: 400,
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
    color: '#9ca3af',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  reloadBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },
  reloadText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  taskInfo: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2933',
    marginBottom: 8,
  },
  taskDeadline: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.7,
  },

  archiveBtn: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#e74c3c',
    alignItems: 'center',
  },
  archiveText: {
    color: '#e74c3c',
    fontWeight: '600',
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 110,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: '#fff',
  },
  fabFocused: {
    backgroundColor: '#4f46e5', // lebih gelap saat aktif
  },
  nilaiContainer: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  nilaiLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
  },

  nilaiValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#047857',
  },
});
