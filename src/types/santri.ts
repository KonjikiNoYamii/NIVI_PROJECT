export interface Santri {
  id: string;
  nis: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  tanggalLahir: string;
  tempatLahir: string;
  alamat: string;
  namaAyah: string;
  namaIbu: string;
  noTelepon: string;
  tanggalMasuk: string;
  kelas: string;
  status: 'Aktif' | 'Non-Aktif' | 'Lulus';
  foto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSantriDTO {
  nis: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  tanggalLahir: string;
  tempatLahir: string;
  alamat: string;
  namaAyah: string;
  namaIbu: string;
  noTelepon: string;
  tanggalMasuk: string;
  kelas: string;
  status: 'Aktif' | 'Non-Aktif' | 'Lulus';
  foto?: string;
}

export interface UpdateSantriDTO extends Partial<CreateSantriDTO> {}

export interface SantriStatistics {
  total: number;
  aktif: number;
  lakiLaki: number;
  perempuan: number;
  perKelas: Record<string, number>;
}