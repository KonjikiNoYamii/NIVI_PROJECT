import axios from 'axios';

export interface Kelas {
  id: number;
  namaKelas: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'santri' | 'pengajar' | 'admin';
  kelas?: Kelas;
}

export interface Task {
  id: number;
  title: string;
  deadline: string;
  status: 'belum' | 'selesai';
}

export const userService = {
  // Ambil user berdasarkan ID
  getUser: async (id: number) => {
    try {
      const res = await axios.get(`https://nivi-production.up.railway.app/api/users/${id}`);
      return res.data; // { success: true, data: {…user…} }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Ambil semua kelas
  getKelas: async () => {
    try {
      const res = await axios.get('https://nivi-production.up.railway.app/api/kelas');
      return res.data; // { success: true, data: [kelas1, kelas2,…] }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Ambil data dashboard user (tasks, attendance, announcements)
  getDashboardData: async (userId: number) => {
    try {
      const res = await axios.get(`https://nivi-production.up.railway.app/api/dashboard/${userId}`);
      return res.data; // { success: true, data: { tasks: [], attendance: '', announcements: [] } }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Submit attendance
  submitAttendance: async (status: 'hadir' | 'izin' | 'sakit', userId: number) => {
    try {
      const res = await axios.post(`https://nivi-production.up.railway.app/api/attendance`, {
        userId,
        status,
      });
      return res.data; // { success: true }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
