import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "https://nivi-production.up.railway.app/api/halaman";

export const dashboardService = {
  getPengajarDashboard: async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      throw new Error("Token tidak ditemukan");
    }

    return axios.get(`${API_URL}/pengajar/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
