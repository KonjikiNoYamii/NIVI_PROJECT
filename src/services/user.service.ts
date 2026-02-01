import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API } from "./api";

export const fetchKelas = async () => {
  const token = await AsyncStorage.getItem("token");
  const res = await axios.get(`${API}/kelas/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || [];
};
