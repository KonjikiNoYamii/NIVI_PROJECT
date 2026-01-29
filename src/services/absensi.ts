import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "./api";


export interface Absensi {
  id: number;
  tanggal: string;
  status: "hadir" | "izin" | "sakit" | "alpha";

   aiComment?: string | null;
  aiTone?: "positif" | "netral" | "peringatan" | null;
  aiConfidence?: number | null;
}

export const absensiService = {
  getToday: async (): Promise<Absensi[]> => {
    const token = await AsyncStorage.getItem("token");

    const res = await axios.get(`${API}/absensi/me/today`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data;
  },

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