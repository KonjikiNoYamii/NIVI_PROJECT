// services/user.ts
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
  kelasId?: Kelas;
}

export const userService = {
  getUser: async (id: number) => {
    try {
      const res = await axios.get(`https://nivi-production.up.railway.app/api/users/1`);
      return res.data;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getUsers: async () => {
    try {
      const res = await axios.get('https://nivi-production.up.railway.app/api/users/1');
      return res.data;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // dummy data dashboard
  getDashboardData: async (userId: number) => {
    return {
      success: true,
      data: {
        tasks: [
          { id: 1, title: 'Tugas 1', deadline: new Date().toISOString(), status: 'belum' },
          { id: 2, title: 'Tugas 2', deadline: new Date().toISOString(), status: 'selesai' },
        ],
        attendance: 'belum',
        announcements: ['Pengumuman 1', 'Pengumuman 2'],
      },
    };
  },

  submitAttendance: async (status: 'hadir' | 'izin' | 'sakit', userId: number) => {
    // dummy, bisa tambah API nyata nanti
    return { success: true };
  },
};
