import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://nivi-production.up.railway.app/api";

export const absensiService = {
  getToday: async () => {
    const token = await AsyncStorage.getItem("token");

    const res = await axios.get(
      `${API}/absensi/me/today`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data.data; // ✅ HARUS INI
  },

  absen: async () => {
    const token = await AsyncStorage.getItem("token");

    const res = await axios.post(
      `${API}/absensi/me/absen`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data.data;
  },
};
