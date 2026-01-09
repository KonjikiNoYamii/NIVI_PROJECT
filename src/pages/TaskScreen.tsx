import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  ScrollView,
  Linking
} from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Types
import { 
  Task, 
  ApiResponse
} from '../types/task';

// API Configuration
const API_BASE_URL = 'https://api.santrinavigator.com/v1';

// Navigation Types
type RootStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: number };
};

type TaskScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskList'>;

const TaskScreen: React.FC = () => {
  const navigation = useNavigation<TaskScreenNavigationProp>();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionLink, setSubmissionLink] = useState<string>('');

  // Fetch tasks from API
  const fetchTasks = useCallback(async (showLoading: boolean = true): Promise<void> => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Sesi telah berakhir. Silakan login kembali.');
        return;
      }

      const response = await axios.get<ApiResponse<Task[]>>(`${API_BASE_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<Task[]>>;
      console.error('Error fetching tasks:', axiosError.message);
      
      if (axiosError.response?.status === 401) {
        Alert.alert('Sesi Berakhir', 'Silakan login kembali');
      } else {
        Alert.alert('Error', 'Gagal memuat tugas. Periksa koneksi internet Anda.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Submit assignment with link only
  const submitAssignment = async (taskId: number): Promise<void> => {
    if (!submissionLink.trim()) {
      Alert.alert('Peringatan', 'Harap masukkan link pengumpulan tugas');
      return;
    }

    // Validasi URL format
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlPattern.test(submissionLink)) {
      Alert.alert('Peringatan', 'Format link tidak valid. Pastikan link dimulai dengan http:// atau https://');
      return;
    }

    try {
      setSubmitting(true);
      
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Sesi telah berakhir');
        return;
      }

      // Simpan ke API
      const response = await axios.post<ApiResponse<Task>>(
        `${API_BASE_URL}/tasks/${taskId}/submit`,
        {
          submission_link: submissionLink,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Sukses', 'Tugas berhasil dikumpulkan!');
        resetSubmissionForm();
        fetchTasks(false); // Refresh list
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<Task>>;
      console.error('Submission error:', axiosError.response?.data);
      
      let errorMessage = 'Gagal mengumpulkan tugas';
      if (axiosError.response?.status === 400) {
        errorMessage = 'Data tidak valid';
      } else if (axiosError.response?.status === 409) {
        errorMessage = 'Tugas sudah dikumpulkan sebelumnya';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset submission form
  const resetSubmissionForm = (): void => {
    setSelectedTask(null);
    setSubmissionLink('');
  };

  // Navigate to task detail
  const navigateToTaskDetail = (taskId: number): void => {
    navigation.navigate('TaskDetail', { taskId });
  };

  // Open link in browser
  const openLink = (url: string): void => {
    Linking.openURL(url).catch(err => 
      console.error('Failed to open URL:', err)
    );
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if task is late
  const isTaskLate = (deadline: string, status: string): boolean => {
    return new Date(deadline) < new Date() && status === 'pending';
  };

  // Render task item
 const renderTaskItem = ({ item }: { item: Task }) => {
    const isLate = isTaskLate(item.deadline, item.status);
    
    return (
      <TouchableOpacity 
        style={styles.taskCardContainer}
        onPress={() => navigateToTaskDetail(item.id)}
      >
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View style={styles.subjectBadge}>
              <Text style={styles.subjectText}>{item.subject}</Text>
            </View>
            <View style={styles.deadlineContainer}>
              <Icon 
                name={isLate ? "exclamation-triangle" : "clock-o"} 
                type="font-awesome" 
                size={14} 
                color={isLate ? "#e74c3c" : "#7f8c8d"} 
              />
              <Text style={[styles.dateText, isLate && styles.lateDate]}>
                {formatDate(item.deadline)}
              </Text>
            </View>
          </View>

          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              item.status === 'submitted' || item.status === 'graded' 
                ? styles.submittedBadge 
                : isLate
                ? styles.lateBadge
                : styles.pendingBadge
            ]}>
              <Text style={styles.statusText}>
                {item.status === 'submitted' ? 'Terkumpul' :
                 item.status === 'graded' ? 'Dinilai' :
                 isLate ? 'Terlambat' : 'Belum Dikumpulkan'}
              </Text>
            </View>
            
            {item.score !== undefined && (
              <View style={styles.scoreContainer}>
                <Icon name="star" type="font-awesome" size={14} color="#f1c40f" />
                <Text style={styles.scoreText}>{item.score}</Text>
              </View>
            )}
          </View>

          {item.status === 'pending' || isLate ? (
            <Button
              title={isLate ? "Kumpulkan (Terlambat)" : "Kumpulkan Tugas"}
              onPress={() => setSelectedTask(item)}
              buttonStyle={isLate ? styles.lateButton : styles.submitButton}
              containerStyle={styles.buttonContainer}
              icon={
                <Icon
                  name={isLate ? "exclamation-triangle" : "upload"}
                  type="font-awesome"
                  size={16}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
              }
            />
          ) : (
            <View style={styles.submittedContainer}>
              <Icon name="check-circle" type="font-awesome" size={20} color="#27ae60" />
              <Text style={styles.submittedText}>Sudah Dikumpulkan</Text>
              {item.submitted_at && (
                <Text style={styles.submittedDate}>
                  {formatDate(item.submitted_at)}
                </Text>
              )}
            </View>
          )}

          {item.submission_link && (
            <TouchableOpacity
              onPress={() => openLink(item.submission_link!)}
              style={styles.linkContainer}
            >
              <Icon name="external-link" type="font-awesome" size={16} color="#3498db" />
              <Text style={styles.linkText}>Lihat Pengumpulan</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  // Render submission modal
  const renderSubmissionModal = () => {
    if (!selectedTask) return null;

    const isLate = isTaskLate(selectedTask.deadline, selectedTask.status);

    return (
      <View style={styles.modalOverlay}>
        <ScrollView 
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isLate ? "Kumpulkan (Terlambat)" : "Kumpulkan Tugas"}
              </Text>
              <TouchableOpacity 
                onPress={resetSubmissionForm}
                style={styles.closeButton}
                disabled={submitting}
              >
                <Icon name="times" type="font-awesome" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.taskInfo}>
              <View style={styles.subjectContainer}>
                <Text style={styles.taskSubject}>{selectedTask.subject}</Text>
              </View>
              <Text style={styles.taskTitle}>{selectedTask.title}</Text>
              <Text style={styles.taskDeadline}>
                Deadline: {new Date(selectedTask.deadline).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>

            {/* Link Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Link Pengumpulan Tugas
              </Text>
              <Text style={styles.inputSubLabel}>
                (Google Drive, GitHub, Google Docs, atau link lainnya)
              </Text>
              
              <View style={styles.textInputContainer}>
                <Icon name="link" type="font-awesome" size={20} color="#3498db" />
                <TextInput
                  style={styles.textInput}
                  placeholder="https://drive.google.com/file/d/..."
                  value={submissionLink}
                  onChangeText={setSubmissionLink}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  editable={!submitting}
                  multiline={true}
                  numberOfLines={2}
                />
              </View>
              
              <Text style={styles.inputHint}>
                Contoh: Google Drive, Google Docs, GitHub Gist, Pastebin, atau link sharing lainnya
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <Button
                title="Batal"
                onPress={resetSubmissionForm}
                type="outline"
                buttonStyle={styles.cancelButton}
                titleStyle={styles.cancelButtonText}
                disabled={submitting}
                containerStyle={styles.buttonHalf}
              />
              <Button
                title={submitting ? "Mengirim..." : "Kirim Tugas"}
                onPress={() => submitAssignment(selectedTask.id)}
                disabled={submitting || !submissionLink.trim()}
                buttonStyle={styles.confirmButton}
                loading={submitting}
                loadingProps={{ color: '#fff', size: 'small' }}
                containerStyle={styles.buttonHalf}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Use focus effect to refresh tasks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTasks(true);
      return () => {
        // Cleanup if needed
      };
    }, [fetchTasks])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tugas</Text>
          <Text style={styles.headerSubtitle}>
            {tasks.filter(t => t.status === 'pending').length} tugas menunggu
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => fetchTasks(false)} 
            style={styles.refreshButton}
            disabled={refreshing}
          >
            <Icon 
              name="refresh" 
              type="font-awesome" 
              size={20} 
              color={refreshing ? "#95a5a6" : "#2c3e50"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Memuat tugas...</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="clipboard" type="font-awesome" size={80} color="#ecf0f1" />
          <Text style={styles.emptyTitle}>Tidak ada tugas</Text>
          <Text style={styles.emptySubtitle}>
            Semua tugas sudah selesai atau belum ada tugas yang diberikan
          </Text>
          <Button
            title="Muat Ulang"
            onPress={() => fetchTasks(true)}
            type="outline"
            buttonStyle={styles.reloadButton}
          />
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => fetchTasks(false)}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                Daftar Tugas ({tasks.length})
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>Tidak ada tugas tersedia</Text>
            </View>
          }
        />
      )}

      {/* Submission Modal */}
      {renderSubmissionModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

   taskCardContainer: {
    marginHorizontal: 8,
    marginBottom: 12,
  },
  
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
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
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#bdc3c7',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  reloadButton: {
    borderColor: '#3498db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  listContainer: {
    padding: 8,
    paddingBottom: 20,
  },
  listHeader: {
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  emptyList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#95a5a6',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  subjectText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#7f8c8d',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  lateDate: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 14,
    color: '#5d6d7e',
    marginBottom: 12,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#f39c12',
  },
  submittedBadge: {
    backgroundColor: '#27ae60',
  },
  lateBadge: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f39c12',
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingVertical: 10,
  },
  lateButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 10,
  },
  buttonContainer: {
    marginTop: 4,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    width: '100%',
    maxHeight: '90%',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 16,
  },
  taskInfo: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  subjectContainer: {
    backgroundColor: '#3498db',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  taskSubject: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  taskDeadline: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
    marginTop: 4,
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
  inputSubLabel: {
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
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
    color: '#2c3e50',
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 6,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  buttonHalf: {
    flex: 1,
  },
  cancelButton: {
    borderColor: '#95a5a6',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#7f8c8d',
  },
  confirmButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
  },
});

export default TaskScreen;