// types/index.ts
export type UserRole = 'santri' | 'pengajar' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  kelas_id?: number;
  kelas_nama?: string;
}

export interface Task {
  id: number;
  title: string;
  deadline: string;
  submitted?: boolean;
}

export interface Attendance {
  id: number;
  tanggal: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
}