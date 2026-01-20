// absensiSettingService.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "./api";

export const absensiSettingService = {
  getMaxAbsen: async (): Promise<number | null> => {
    const token = await AsyncStorage.getItem("token");
    const kelasId = await AsyncStorage.getItem("kelasId"); // simpan saat login
    if (!token || !kelasId) return null;

    const res = await axios.get(`${API}/absensi-setting/kelas/${kelasId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data?.maxAbsen ?? null;
  },
};
