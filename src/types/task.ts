/**
 * Interface untuk data tugas
 */
export interface Task {
  id: number;
  subject: string;
  title: string;
  description: string;
  deadline: string; // ISO string format: "2024-01-20T23:59:59"
  status: 'pending' | 'submitted' | 'late' | 'graded';
  submission_link?: string;
  submission_file?: string;
  score?: number;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  teacher_name?: string;
  teacher_id?: number;
  attachments?: TaskAttachment[];
}

/**
 * Interface untuk lampiran tugas
 */
export interface TaskAttachment {
  id: number;
  task_id: number;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

/**
 * Interface untuk pengumpulan tugas
 */
export interface TaskSubmission {
  id: number;
  task_id: number;
  student_id: number;
  submission_link?: string;
  submission_file?: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
  graded_at?: string;
  status: 'submitted' | 'graded' | 'late';
}

/**
 * Interface untuk data yang dikirim saat submit tugas
 */
export interface SubmitTaskData {
  task_id: number;
  submission_link?: string;
  submission_file?: File | null;
  student_notes?: string;
}

/**
 * Interface untuk data yang dikirim saat membuat tugas baru (pengajar)
 */
export interface CreateTaskRequest {
  title: string;
  description: string;
  subject: string;
  deadline: string; // ISO string format
  assigned_to: number[]; // Array of student IDs
  attachment_url?: string;
}

/**
 * Interface untuk data yang dikirim saat mengedit tugas
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  subject?: string;
  deadline?: string;
  assigned_to?: number[];
  attachment_url?: string;
}

/**
 * Interface untuk data santri
 */
export interface Santri {
  id: number;
  name: string;
  email?: string;
  class?: string;
  phone?: string;
  avatar?: string;
  nis?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface untuk data pengajar/guru
 */
export interface Teacher {
  id: number;
  name: string;
  email: string;
  subjects?: string[];
  avatar?: string;
  phone?: string;
}

/**
 * Interface untuk response API
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: PaginationData;
}

/**
 * Interface untuk response dari API santri
 */
export interface SantriResponse extends ApiResponse<Santri[]> {}

/**
 * Interface untuk data tugas yang dibuat (response)
 */
export interface CreatedTask {
  id: number;
  subject: string;
  title: string;
  description: string;
  deadline: string;
  assigned_to: number[];
  attachment_url?: string;
  created_at: string;
  updated_at: string;
  teacher_id: number;
  teacher_name: string;
}

/**
 * Interface untuk pagination
 */
export interface PaginationData {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Interface untuk filter tugas
 */
export interface TaskFilter {
  status?: 'all' | 'pending' | 'submitted' | 'late' | 'graded';
  subject?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: 'deadline' | 'created_at' | 'subject';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Interface untuk filter santri
 */
export interface SantriFilter {
  class?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Interface untuk document picker result
 */
export interface DocumentPickerResult {
  uri: string;
  name: string;
  type: string;
  size: number;
  fileCopyUri?: string;
  copyError?: string;
}

/**
 * Interface untuk user
 */
export interface User {
  id: number;
  name: string;
  email: string;
  nis?: string;
  class: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
}

/**
 * Interface untuk mata pelajaran
 */
export interface Subject {
  id: number;
  name: string;
  code: string;
  teacher_id: number;
  teacher_name: string;
  color?: string;
  icon?: string;
}

/**
 * Interface untuk kelas/section
 */
export interface Class {
  id: number;
  name: string;
  level: string;
  year: number;
  teacher_id?: number;
  teacher_name?: string;
  student_count: number;
}

/**
 * Interface untuk statistics tugas
 */
export interface TaskStatistics {
  total: number;
  pending: number;
  submitted: number;
  late: number;
  graded: number;
  average_score?: number;
}

/**
 * Interface untuk notification/pemberitahuan
 */
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'task' | 'announcement' | 'reminder' | 'system';
  data?: any;
  read: boolean;
  created_at: string;
}

/**
 * Interface untuk error response
 */
export interface ErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

/**
 * Type untuk navigation params
 */
export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  
  // Main Stack
  Dashboard: undefined;
  TaskList: undefined;
  TaskDetail: { taskId: number };
  TaskSubmission: { task: Task };
  TaskPengajar: undefined; // Tambahkan ini untuk screen tambah tugas
  Attendance: undefined;
  Profile: undefined;
  
  // Settings Stack
  Settings: undefined;
  ChangePassword: undefined;
  EditProfile: undefined;
};

/**
 * Type untuk navigation props
 */
export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: {
    navigate: (screen: T, params?: RootStackParamList[T]) => void;
    goBack: () => void;
    reset: (config: any) => void;
    setParams: (params: Partial<RootStackParamList[T]>) => void;
    dispatch: (action: any) => void;
    canGoBack: () => boolean;
    isFocused: () => boolean;
    addListener: (event: string, callback: () => void) => () => void;
    removeListener: (event: string, callback: () => void) => void;
  };
  route: {
    params: RootStackParamList[T];
    key: string;
    name: T;
  };
};

/**
 * Type untuk tab navigation
 */
export type TabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Attendance: undefined;
  Profile: undefined;
};

/**
 * Utility types
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
export type TaskStatus = 'pending' | 'submitted' | 'late' | 'graded';