import { api, ApiResponse } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'santri' | 'pengajar' | 'admin';
  kelas_id?: number;
}

export interface SimpleTask {
  id: number;
  title: string;
  deadline: string;
  status: 'belum' | 'selesai';
}

class UserService {
  // Ambil data user berdasarkan ID
  // Format Supabase: /nama_tabel?kolom=eq.nilai
  async getUser(userId: number): Promise<ApiResponse<User>> {
    const result = await api.get<User[]>(`/users?id=eq.${userId}&select=*`);
    
    if (result.success && result.data && result.data.length > 0) {
      return { success: true, data: result.data[0] }; // Ambil objek pertama
    }
    return { success: false, error: "User tidak ditemukan" };
  }

  // Submit absensi ke tabel 'attendance'
  async submitAttendance(status: 'hadir' | 'izin' | 'sakit', userId: number): Promise<ApiResponse<{ message: string }>> {
    const payload = { 
      user_id: userId, 
      status: status,
      created_at: new Date().toISOString()
    };
    
    const result = await api.post<any>('/attendance', payload);
    
    if (result.success) {
      return { success: true, data: { message: "Absensi berhasil dicatat" } };
    }
    return result;
  }

  // Data Dummy untuk Dashboard (tetap seperti kode Anda)
  async getDashboardData(userId: number): Promise<ApiResponse<{
    tasks: SimpleTask[];
    attendance: string;
    announcements: string[];
  }>> {
    const dummyData = {
      tasks: [
        { id: 1, title: 'Matematika - Aljabar', deadline: '2026-01-20', status: 'belum' as const },
        { id: 2, title: 'Fisika - Optik', deadline: '2026-01-22', status: 'selesai' as const },
      ],
      attendance: 'belum',
      announcements: ['Ujian Mid Semester Januari 2026'],
    };

    return { success: true, data: dummyData };
  }
}

export const userService = new UserService();
