import api from './api';
import { 
  Santri, 
  CreateSantriDTO, 
  UpdateSantriDTO,
  SantriStatistics 
} from '../types/santri';

// Mock data untuk development
const mockSantri: Santri[] = [
  {
    id: '1',
    nis: '2024001',
    nama: 'Ahmad Santoso',
    jenisKelamin: 'L',
    tanggalLahir: '2010-05-15',
    tempatLahir: 'Jakarta',
    alamat: 'Jl. Merdeka No. 123, Jakarta',
    namaAyah: 'Budi Santoso',
    namaIbu: 'Siti Rahayu',
    noTelepon: '081234567890',
    tanggalMasuk: '2024-01-10',
    kelas: 'Kelas 7',
    status: 'Aktif',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    nis: '2024002',
    nama: 'Siti Aminah',
    jenisKelamin: 'P',
    tanggalLahir: '2011-08-20',
    tempatLahir: 'Bandung',
    alamat: 'Jl. Sudirman No. 45, Bandung',
    namaAyah: 'Rudi Hartono',
    namaIbu: 'Ratna Sari',
    noTelepon: '081234567891',
    tanggalMasuk: '2024-01-11',
    kelas: 'Kelas 6',
    status: 'Aktif',
    createdAt: '2024-01-11T11:00:00Z',
    updatedAt: '2024-01-11T11:00:00Z',
  },
];

export const santriService = {
  // Get all santri
  getAll: async (search?: string, kelas?: string, status?: string): Promise<Santri[]> => {
    try {
      // Untuk development, gunakan mock data
      // Saat backend ready, ganti dengan:
      // const params = new URLSearchParams();
      // if (search) params.append('search', search);
      // if (kelas) params.append('kelas', kelas);
      // if (status) params.append('status', status);
      // const response = await api.get(`/santri?${params.toString()}`);
      // return response.data;
      
      // Mock filtering
      let filtered = [...mockSantri];
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          santri =>
            santri.nama.toLowerCase().includes(searchLower) ||
            santri.nis.includes(search)
        );
      }
      
      if (kelas) {
        filtered = filtered.filter(santri => santri.kelas === kelas);
      }
      
      if (status) {
        filtered = filtered.filter(santri => santri.status === status);
      }
      
      // Simulate API delay
      await new Promise<void>(resolve => setTimeout(resolve, 500));
      
      return filtered;
    } catch (error) {
      console.error('Error fetching santri:', error);
      throw error;
    }
  },

  // Get single santri by ID
  getById: async (id: string): Promise<Santri> => {
    try {
      // Untuk development
      const santri = mockSantri.find(s => s.id === id);
      
      if (!santri) {
        throw new Error('Santri not found');
      }
      
      // Simulate API delay
      await new Promise<void>(resolve => setTimeout(resolve, 300));
      
      return santri;
      
      // Saat backend ready, ganti dengan:
      // const response = await api.get(`/santri/${id}`);
      // return response.data;
    } catch (error) {
      console.error('Error fetching santri detail:', error);
      throw error;
    }
  },

  // Create new santri
  create: async (data: CreateSantriDTO): Promise<Santri> => {
    try {
      // Untuk development
      const newSantri: Santri = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockSantri.push(newSantri);
      
      // Simulate API delay
      await new Promise<void>(resolve => setTimeout(resolve, 500));
      
      return newSantri;
      
      // Saat backend ready, ganti dengan:
      // const response = await api.post('/santri', data);
      // return response.data;
    } catch (error) {
      console.error('Error creating santri:', error);
      throw error;
    }
  },

  // Update santri
  update: async (id: string, data: UpdateSantriDTO): Promise<Santri> => {
    try {
      // Untuk development
      const index = mockSantri.findIndex(s => s.id === id);
      
      if (index === -1) {
        throw new Error('Santri not found');
      }
      
      const updatedSantri = {
        ...mockSantri[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      mockSantri[index] = updatedSantri;
      
      // Simulate API delay
      await new Promise<void>(resolve => setTimeout(resolve, 500));
      
      return updatedSantri;
      
      // Saat backend ready, ganti dengan:
      // const response = await api.put(`/santri/${id}`, data);
      // return response.data;
    } catch (error) {
      console.error('Error updating santri:', error);
      throw error;
    }
  },

  // Delete santri
  delete: async (id: string): Promise<void> => {
    try {
      // Untuk development
      const index = mockSantri.findIndex(s => s.id === id);
      
      if (index === -1) {
        throw new Error('Santri not found');
      }
      
      mockSantri.splice(index, 1);
      
      // Simulate API delay
      await new Promise<void>(resolve => setTimeout(resolve, 300));
      
      // Saat backend ready, ganti dengan:
      // await api.delete(`/santri/${id}`);
    } catch (error) {
      console.error('Error deleting santri:', error);
      throw error;
    }
  },

  // Get statistics
  getStatistics: async (): Promise<SantriStatistics> => {
    try {
      // Untuk development
      const stats: SantriStatistics = {
        total: mockSantri.length,
        aktif: mockSantri.filter(s => s.status === 'Aktif').length,
        lakiLaki: mockSantri.filter(s => s.jenisKelamin === 'L').length,
        perempuan: mockSantri.filter(s => s.jenisKelamin === 'P').length,
        perKelas: mockSantri.reduce((acc, santri) => {
          acc[santri.kelas] = (acc[santri.kelas] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
      
      // Simulate API delay
      await new Promise<void>(resolve => setTimeout(resolve, 300));
      
      return stats;
      
      // Saat backend ready, ganti dengan:
      // const response = await api.get('/santri/statistics');
      // return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  // Export to Excel (untuk React Native, gunakan library seperti react-native-fs)
  exportToExcel: async (): Promise<string> => {
    try {
      // Di React Native, kita tidak bisa menggunakan window/document
      // Gunakan library seperti react-native-fs untuk save file
      // atau kirim data ke backend untuk generate Excel
      
      // Untuk sekarang, kita simulasi saja
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      
      console.log('Export data santri:', mockSantri);
      
      return 'Data berhasil di-generate untuk export';
      
      // Contoh dengan react-native-fs:
      // import RNFS from 'react-native-fs';
      // const path = RNFS.DocumentDirectoryPath + `/data-santri-${Date.now()}.csv`;
      // const csvContent = generateCSV(mockSantri);
      // await RNFS.writeFile(path, csvContent, 'utf8');
      // return path;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },
};