import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "./api";

export const getNilaiByTugas = async (tugasId: number) => {
  const token = await AsyncStorage.getItem("token");
  const res = await axios.get(`${API}/nilai/tugas/${tugasId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};
