import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 1. Perhatikan URL: Gunakan /rest/v1
const BASE_URL = "https://oxyetuziuxpvhbmvpaok.supabase.co";
// 2. WAJIB: Masukkan Anon Key dari Dashboard Supabase Anda
const SUPABASE_ANON_KEY = "sb_publishable_KB-fM9xvAF_JJC_ihAA04w_qg2vN2Vg";

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await AsyncStorage.getItem('token');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY, // Supabase wajib butuh ini
        ...(options.headers as Record<string, string> || {}),
      };

      // Jika ada token user (setelah login), gunakan. Jika tidak, gunakan Anon Key.
      headers['Authorization'] = `Bearer ${token || SUPABASE_ANON_KEY}`;

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Debugging: Lihat status code jika gagal
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Supabase Error Details:", errorData);
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data as T,
      };
    } catch (error: any) {
      console.error("API Request Failed:", error.message);
      return {
        success: false,
        error: error.message || 'Terjadi kesalahan jaringan',
      };
    }
  }

  async get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Prefer': 'return=representation' // Agar Supabase mengembalikan data yang diinput
      }
    });
  }
}

export const api = new ApiService();
