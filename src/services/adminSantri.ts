import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API } from "./api";

export const adminSantriService = {
  createSantri: async (data: {
    name: string;
    email: string;
    kelasId: number;
  }) => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      throw new Error("Token tidak ditemukan");
    }

    return axios.post(`${API}/admin/santri`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
