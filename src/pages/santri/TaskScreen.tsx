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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API } from '../../services/api';


interface Task {
  id: number;
  subject: string;
  title: string;
  description?: string;
  deadline: string;
status:
  | 'belum_submit'
  | 'pending'
  | 'reviewed'
  | 'rejected';
  submission_link?: string | null;
  submitted_at?: string | null;
}

const TaskScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionLink, setSubmissionLink] = useState('');

  const fetchTasks = useCallback(async (showLoading = true) => {
    try {
      showLoading ? setLoading(true) : setRefreshing(true);

      const token = await AsyncStorage.getItem('token');

      const res = await axios.get(`${API}/tugas/santri`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

const formatted: Task[] = res.data.data.map((t: any) => ({
  id: t.id,
  subject: 'Tugas',
  title: t.title,
  description: t.description,
  deadline: t.deadline,

  status: t.status ?? 'belum_submit',

  submission_link: t.submission_link ?? null,
  submitted_at: t.submitted_at ?? null,
}));


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

      Alert.alert('Sukses', 'Tugas berhasil dikumpulkan');
      setSelectedTask(null);
      setSubmissionLink('');
      fetchTasks(false);
    } catch {
      Alert.alert('Error', 'Gagal mengumpulkan tugas');
    } finally {
      setSubmitting(false);
    }
  };

  const isLate = (deadline: string) =>
    new Date(deadline).getTime() < new Date().getTime();

  const openLink = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) await Linking.openURL(url);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks(true);
    }, [fetchTasks]),
  );

  const renderItem = ({ item }: { item: Task }) => {
    const late = isLate(item.deadline) && item.status === 'pending';

    const getStatusLabel = (status: Task['status']) => {
switch (status) {
  case 'belum_submit':
    return 'Belum Dikumpulkan';
  case 'pending':
    return 'Menunggu Penilaian';
  case 'reviewed':
    return 'Sudah Dinilai';
  case 'rejected':
    return 'Ditolak';
}

};

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'belum_submit':
      return '#3498db';
    case 'reviewed':
      return '#2ecc71';
    case 'rejected':
      return '#e74c3c';
    default:
      return '#95a5a6';
  }
};


    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.subject}>{item.subject}</Text>
          <Text style={[styles.deadline, late && styles.late]}>
            {new Date(item.deadline).toLocaleDateString('id-ID')}
          </Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        
        {item.description && (
          <Text style={styles.desc}>{item.description}</Text>
        )}

{item.status === 'belum_submit' && (
  <TouchableOpacity
    style={[styles.submitBtn, late && styles.lateBtn]}
    onPress={() => setSelectedTask(item)}
  >
    <Text style={styles.submitText}>
      {late ? 'Kumpulkan (Terlambat)' : 'Kumpulkan'}
    </Text>
  </TouchableOpacity>
)}


{item.status !== 'belum_submit' && (
  <View style={styles.submittedContainer}>
    <Text style={styles.submittedText}>
      {getStatusLabel(item.status)}
    </Text>
  </View>
)}


        {item.submission_link && (
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => openLink(item.submission_link!)}
          >
            <Text style={styles.linkText}>Lihat Pengumpulan</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
<SafeAreaView style={styles.safe}>
  {loading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3498db" />
      <Text style={styles.loadingText}>Memuat tugas...</Text>
    </View>
  ) : (
    <FlatList
      data={tasks}
      keyExtractor={i => i.id.toString()}
      renderItem={renderItem}
      refreshing={refreshing}
      onRefresh={() => fetchTasks(false)}
      contentContainerStyle={
        tasks.length === 0
          ? { flex: 1, justifyContent: 'center' }
          : undefined
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
          >
            <Text style={styles.reloadText}>Muat Ulang</Text>
          </TouchableOpacity>
        </View>
      }
    />
  )}

      <Modal visible={!!selectedTask} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Pengumpulan Tugas</Text>

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
              <Text style={styles.inputLabel}>Link Tugas</Text>
              <Text style={styles.inputHint}>
                Masukkan link Google Drive / Github / dll
              </Text>

              <View style={styles.textInputContainer}>
                <TextInput
                  placeholder="https://..."
                  value={submissionLink}
                  onChangeText={setSubmissionLink}
                  style={styles.textInput}
                  autoCapitalize="none"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setSelectedTask(null);
                  setSubmissionLink('');
                }}
              >
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  submitting && styles.confirmDisabled,
                ]}
                disabled={submitting}
                onPress={() =>
                  selectedTask && submitAssignment(selectedTask.id)
                }
              >
                <Text style={styles.confirmText}>
                  {submitting ? 'Mengirim...' : 'Kumpulkan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TaskScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  refreshBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#bdc3c7',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  reloadBtn: {
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  reloadText: {
    color: '#3498db',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  // Task Card Styles
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subject: {
    backgroundColor: '#3498db',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '600',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadline: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
    marginLeft: 4,
  },
  late: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    color: '#5d6d7e',
    marginBottom: 12,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9e6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  score: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f39c12',
    marginLeft: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  lateBtn: {
    backgroundColor: '#e74c3c',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  submittedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d5f4e6',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  submittedText: {
    color: '#27ae60',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  submittedDate: {
    color: '#7f8c8d',
    fontSize: 12,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#ebf5fb',
    borderRadius: 8,
  },
  linkText: {
    marginLeft: 8,
    color: '#2980b9',
    fontWeight: '500',
    fontSize: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  taskInfo: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskSubject: {
    backgroundColor: '#3498db',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  taskDeadline: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d5dbdb',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#95a5a6',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 14,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmDisabled: {
    backgroundColor: '#b0d4f0',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});
