import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "./api";

/* ============================= */
/* ======== INTERFACE ========= */
/* ============================= */
export interface Absensi {
  id: number;
  tanggal: string;
  status: "hadir" | "izin" | "sakit" | "alpha";

  aiComment?: string | null;
  aiTone?: "positif" | "netral" | "peringatan" | null;
  aiConfidence?: number | null;

  // Tambahan jadwal dari backend
  jadwal?: {
    id: number;
    jamMulai: string;
    jamSelesai: string;
  } | null;
}

/* ============================= */
/* ======== SERVICE =========== */
/* ============================= */
export const absensiService = {
  // Ambil absensi hari ini
  getToday: async (): Promise<Absensi[]> => {
    const token = await AsyncStorage.getItem("token");

    const res = await axios.get(`${API}/absensi/me/today`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

const now = new Date();

const filtered: Absensi[] = res.data.data
  .map((a: Absensi) => ({ ...a, tanggal: new Date(a.tanggal).toISOString() }))
  .filter((a: Absensi) => {
  if (a.status !== "alpha" || !a.jadwal?.jamSelesai) return true;

  const tanggal = new Date(a.tanggal);
  const [jam, menit] = a.jadwal.jamSelesai.split(':').map(Number);
  const sesiSelesai = new Date(
    tanggal.getFullYear(),
    tanggal.getMonth(),
    tanggal.getDate(),
    jam,
    menit,
    0,
    0
  );

  return new Date() >= sesiSelesai;
});



    return filtered;
  },

  // Absen hadir / izin / sakit
  absen: async (status: "hadir" | "izin" | "sakit") => {
    const token = await AsyncStorage.getItem("token");

    const res = await axios.post(
      `${API}/absensi/absen`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data.data;
  },
};
