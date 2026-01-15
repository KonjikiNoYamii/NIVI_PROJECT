import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API } from "./api";


export const dashboardService = {
  getPengajarDashboard: async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      throw new Error("Token tidak ditemukan");
    }

    return axios.get(`${API}/halaman/pengajar/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
