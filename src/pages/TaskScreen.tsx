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
  PermissionsAndroid,
  Platform,
  Linking
} from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Types
import { 
  Task, 
  ApiResponse, 
  DocumentPickerResult,
  TaskSubmission,
  TaskFilter 
} from '../types/task';

// API Configuration
const API_BASE_URL = 'https://api.santrinavigator.com/v1';

// Navigation Types
type RootStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: number };
  TaskSubmission: { task: Task };
};

type TaskScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList, 'TaskList'>;

const TaskScreen: React.FC = () => {
  const navigation = useNavigation<TaskScreenNavigationProp>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [link, setLink] = useState('');
  const [selectedFile, setSelectedFile] =
    useState<DocumentPickerResponse | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const fetchTasks = useCallback(async (showLoading = true) => {
    try {
      showLoading ? setLoading(true) : setRefreshing(true);

      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await axios.get<ApiResponse<Task[]>>(
        `${API_BASE_URL}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat tugas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const pickDocument = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) return;

      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: false
      });

      if (result.length > 0) {
        setSelectedFile(result[0]);
      }
    } catch {}
  };

  const submitAssignment = async (taskId: number) => {
    if (!link && !selectedFile) return;

    try {
      setSubmitting(true);
      Alert.alert('Sukses', 'Tugas berhasil dikumpulkan');
      setSelectedTask(null);
      setLink('');
      setSelectedFile(null);
    } finally {
      setSubmitting(false);
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    return (
      <TouchableOpacity
        style={styles.taskCardContainer}
        onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      >
        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskDescription}>{item.description}</Text>

          <Button
            title="Kumpulkan Tugas"
            onPress={() => setSelectedTask(item)}
            buttonStyle={styles.submitButton}
          />
        </View>
      </TouchableOpacity>
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks(true);
    }, [fetchTasks])
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  /** ✅ FIX ERROR: STYLE YANG HILANG */
  taskCardContainer: {
    marginHorizontal: 8,
  },

  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  taskDescription: {
    fontSize: 14,
    color: '#5d6d7e',
    marginBottom: 12,
  },

  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
});

export default TaskScreen;
