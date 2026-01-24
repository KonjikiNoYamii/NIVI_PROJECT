import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { API, SOCKET_URL } from '../../services/api';
import Loading from '../../components/loading';

/* ================= UTIL ================= */

const getToken = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan');
  return token;
};

const bulanNama = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/* ================= SCREEN ================= */

export default function AdminJadwalScreen() {
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<number | null>(null);
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [maxAbsen, setMaxAbsen] = useState('');
  const [settingId, setSettingId] = useState<number | null>(null);

  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('10:00');

  const [tanggalMulai, setTanggalMulai] = useState<Date | null>(null);
  const [tanggalSelesai, setTanggalSelesai] = useState<Date | null>(null);

  const [showTM, setShowTM] = useState(false);
  const [showTS, setShowTS] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<any | null>(null);

  const [editJamMulai, setEditJamMulai] = useState('');
  const [editJamSelesai, setEditJamSelesai] = useState('');
  const [editTanggal, setEditTanggal] = useState<Date | null>(null);

  /* ================= JAM OPTION ================= */

  const jamOptions = useMemo(() => {
    return Array.from({ length: 96 }, (_, i) => {
      const h = String(Math.floor(i / 4)).padStart(2, '0');
      const m = String((i % 4) * 15).padStart(2, '0');
      return `${h}:${m}`;
    });
  }, []);

  /* ================= SOCKET ================= */
  const socket = useMemo(
    () => io(SOCKET_URL, { transports: ['websocket'] }),
    [],
  );

  /* ================= FETCH ================= */

  const fetchKelas = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/kelas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKelasList(res.data.data);
    } catch (e) {
      Alert.alert('Error', 'Gagal mengambil data kelas');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJadwal = useCallback(async (kelasId: number) => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/jadwal/kelas/${kelasId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJadwal(res.data.data);
    } catch {
      Alert.alert('Error', 'Gagal mengambil jadwal');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAbsensiSetting = useCallback(async (kelasId: number) => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/absensi-setting/kelas/${kelasId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.data) {
        setMaxAbsen(String(res.data.data.maxAbsen));
        setSettingId(res.data.data.id);
      } else {
        setMaxAbsen('');
        setSettingId(null);
      }
    } catch {
      Alert.alert('Error', 'Gagal mengambil setting absensi');
    }
  }, []);

  useEffect(() => {
    fetchKelas();
  }, [fetchKelas]);

  const onKelasChange = (id: number) => {
    setSelectedKelas(id);
    fetchJadwal(id);
    fetchAbsensiSetting(id);
  };

  /* ================= GROUP ================= */

  const jadwalPerBulan = useMemo(() => {
    const map: Record<string, any[]> = {};
    jadwal.forEach(j => {
      const d = new Date(j.tanggal);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(j);
    });
    return map;
  }, [jadwal]);

  /* ================= ACTION ================= */

  const saveMaxAbsen = async () => {
    if (!selectedKelas || !maxAbsen) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (settingId) {
        await axios.put(
          `${API}/absensi-setting/${settingId}`,
          { maxAbsen: Number(maxAbsen) },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(
          `${API}/absensi-setting/kelas/${selectedKelas}`,
          { maxAbsen: Number(maxAbsen) },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      socket.emit('absensi-setting-changed', { kelasId: selectedKelas });
      Alert.alert('Sukses', 'Batas absen disimpan');
    } catch {
      Alert.alert('Error', 'Gagal menyimpan batas absen');
    } finally {
      setLoading(false);
    }
  };

  const createBulk = async () => {
    if (!tanggalMulai || !tanggalSelesai) return;
    if (
      jadwal.some(
        j => new Date(j.tanggal).toDateString() === tanggalMulai.toDateString(),
      )
    ) {
      Alert.alert('Error', 'Tanggal sudah memiliki jadwal');
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      await axios.post(
        `${API}/jadwal/bulk`,
        {
          kelasId: selectedKelas,
          jamMulai,
          jamSelesai,
          tanggalMulai: tanggalMulai.toISOString().split('T')[0],
          tanggalSelesai: tanggalSelesai.toISOString().split('T')[0],
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      socket.emit('jadwal-changed', { kelasId: selectedKelas });
      fetchJadwal(selectedKelas!);
    } catch {
      Alert.alert('Error', 'Gagal membuat jadwal');
    } finally {
      setLoading(false);
    }
  };

  const deleteJadwal = async (id: number) => {
    setLoading(true);
    try {
      const token = await getToken();
      await axios.delete(`${API}/jadwal/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      socket.emit('jadwal-changed', { kelasId: selectedKelas });
      fetchJadwal(selectedKelas!);
    } catch {
      Alert.alert('Error', 'Gagal menghapus jadwal');
    } finally {
      setLoading(false);
    }
  };

  const submitEdit = async () => {
    if (!editingJadwal) return;
    setLoading(true);
    try {
      const token = await getToken();
      const payload: any = {
        jamMulai: editJamMulai,
        jamSelesai: editJamSelesai,
      };
      if (editingJadwal.absensi.length === 0 && editTanggal) {
        payload.tanggal = editTanggal.toISOString().split('T')[0];
      }
      await axios.put(`${API}/jadwal/${editingJadwal.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      socket.emit('jadwal-changed', { kelasId: selectedKelas });
      setEditVisible(false);
      fetchJadwal(selectedKelas!);
    } catch {
      Alert.alert('Error', 'Gagal update jadwal');
    } finally {
      setLoading(false);
    }
  };

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    socket.on('jadwal-changed', ({ kelasId }: { kelasId: number }) => {
      if (selectedKelas === kelasId) fetchJadwal(kelasId);
    });
    socket.on('absensi-setting-changed', ({ kelasId }: { kelasId: number }) => {
      if (selectedKelas === kelasId) fetchAbsensiSetting(kelasId);
    });
    return () => {
      socket.off('jadwal-changed');
      socket.off('absensi-setting-changed');
    };
  }, [selectedKelas, fetchJadwal, fetchAbsensiSetting, socket]);

  /* ================= UI ================= */

  return (
    <ScrollView style={styles.container}>
      <Modal visible={editVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              margin: 20,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ fontWeight: '600', fontSize: 16 }}>Edit Jadwal</Text>
            <Picker
              selectedValue={editJamMulai}
              onValueChange={setEditJamMulai}
            >
              {jamOptions.map(j => (
                <Picker.Item key={j} label={j} value={j} />
              ))}
            </Picker>
            <Picker
              selectedValue={editJamSelesai}
              onValueChange={setEditJamSelesai}
            >
              {jamOptions.map(j => (
                <Picker.Item key={j} label={j} value={j} />
              ))}
            </Picker>
            <TouchableOpacity
              disabled={editingJadwal?.absensi?.length > 0}
              style={{
                opacity: editingJadwal?.absensi?.length > 0 ? 0.5 : 1,
                borderWidth: 1,
                borderColor: '#ddd',
                padding: 8,
                borderRadius: 8,
              }}
              onPress={() => setShowTM(true)}
            >
              <Text>{editTanggal?.toDateString()}</Text>
            </TouchableOpacity>
            {editingJadwal?.absensi?.length > 0 && (
              <Text style={{ color: 'orange', fontSize: 12, marginTop: 4 }}>
                Jadwal sudah digunakan absensi, tanggal tidak bisa diubah
              </Text>
            )}
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 10 }}
                onPress={() => setEditVisible(false)}
              >
                <Text style={{ textAlign: 'center' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor: '#4a90e2',
                  borderRadius: 8,
                }}
                onPress={submitEdit}
              >
                <Text style={{ color: '#fff', textAlign: 'center' }}>
                  Simpan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Loading visible={loading} />

      <Text style={styles.title}>Manajemen Jadwal</Text>

      <Picker
        selectedValue={selectedKelas ?? undefined}
        onValueChange={onKelasChange}
      >
        <Picker.Item label="Pilih Kelas" value={null} />
        {kelasList.map(k => (
          <Picker.Item key={k.id} label={k.namaKelas} value={k.id} />
        ))}
      </Picker>

      {selectedKelas && (
        <>
          <View style={styles.box}>
            <Text style={styles.label}>Batas Absen</Text>
            <TextInput
              style={styles.input}
              value={maxAbsen}
              onChangeText={setMaxAbsen}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.btn} onPress={saveMaxAbsen}>
              <Text style={styles.btnText}>Simpan</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.box}>
            <Text style={styles.label}>Buat Jadwal</Text>
            <Picker selectedValue={jamMulai} onValueChange={setJamMulai}>
              {jamOptions.map(j => (
                <Picker.Item key={j} label={j} value={j} />
              ))}
            </Picker>
            <Picker selectedValue={jamSelesai} onValueChange={setJamSelesai}>
              {jamOptions.map(j => (
                <Picker.Item key={j} label={j} value={j} />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowTM(true)}
            >
              <Text>{tanggalMulai?.toDateString() || 'Tanggal Mulai'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowTS(true)}
            >
              <Text>{tanggalSelesai?.toDateString() || 'Tanggal Selesai'}</Text>
            </TouchableOpacity>
            {showTM && (
              <DateTimePicker
                value={tanggalMulai || new Date()}
                mode="date"
                onChange={(_, d) => {
                  setShowTM(false);
                  if (d) setTanggalMulai(d);
                }}
              />
            )}
            {showTS && (
              <DateTimePicker
                value={tanggalSelesai || new Date()}
                mode="date"
                onChange={(_, d) => {
                  setShowTS(false);
                  if (d) setTanggalSelesai(d);
                }}
              />
            )}
            <TouchableOpacity style={styles.btn} onPress={createBulk}>
              <Text style={styles.btnText}>Buat</Text>
            </TouchableOpacity>
          </View>

          {Object.entries(jadwalPerBulan).map(([key, list]) => {
            const [year, month] = key.split('-');
            return (
              <View key={key}>
                <Text style={styles.month}>
                  {bulanNama[+month]} {year}
                </Text>
                <FlatList
                  data={list}
                  numColumns={2}
                  scrollEnabled={false}
                  keyExtractor={i => i.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.card}>
                      <Text>{item.hari}</Text>
                      <Text>
                        {item.jamMulai} - {item.jamSelesai}
                      </Text>
                      <TouchableOpacity onPress={() => deleteJadwal(item.id)}>
                        <Text style={styles.delete}>Hapus</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingJadwal(item);
                          setEditJamMulai(item.jamMulai);
                          setEditJamSelesai(item.jamSelesai);
                          setEditTanggal(new Date(item.tanggal));
                          setEditVisible(true);
                        }}
                      >
                        <Text style={{ color: '#4a90e2' }}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

/* ================= STYLE ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },

  box: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },

  label: { fontWeight: '500', marginBottom: 6 },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
  },

  btn: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },

  btnText: { color: '#fff', fontWeight: '500' },

  dateBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },

  month: {
    marginTop: 18,
    fontWeight: '600',
  },

  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 10,
    margin: 6,
    flex: 1,
  },

  delete: { color: '#e74c3c', marginTop: 4 },
});
