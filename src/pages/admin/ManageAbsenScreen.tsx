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
  StatusBar,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { API, SOCKET_URL } from '../../services/api';

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

function AdminJadwalScreen() {
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<number | null>(null);
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [maxAbsen, setMaxAbsen] = useState('');
  const [settingId, setSettingId] = useState<number | null>(null);

  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('10:00');

  const [tanggalMulai, setTanggalMulai] = useState<Date>(new Date());
  const [tanggalSelesai, setTanggalSelesai] = useState<Date>(new Date());

  const [showTM, setShowTM] = useState(false);
  const [showTS, setShowTS] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<any | null>(null);

  const [editJamMulai, setEditJamMulai] = useState('');
  const [editJamSelesai, setEditJamSelesai] = useState('');
  const [editTanggal, setEditTanggal] = useState<Date>(new Date());

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
      setKelasList(res.data.data || []);
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
      setJadwal(res.data.data || []);
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

  const loadData = useCallback(async () => {
    await fetchKelas();
    if (selectedKelas) {
      await Promise.all([
        fetchJadwal(selectedKelas),
        fetchAbsensiSetting(selectedKelas)
      ]);
    }
    setRefreshing(false);
  }, [fetchKelas, fetchJadwal, fetchAbsensiSetting, selectedKelas]);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

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
      if (editingJadwal.absensi && editingJadwal.absensi.length === 0 && editTanggal) {
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
    const handleJadwalChanged = ({ kelasId }: { kelasId: number }) => {
      if (selectedKelas === kelasId) fetchJadwal(kelasId);
    };

    const handleAbsensiSettingChanged = ({ kelasId }: { kelasId: number }) => {
      if (selectedKelas === kelasId) fetchAbsensiSetting(kelasId);
    };

    socket.on('jadwal-changed', handleJadwalChanged);
    socket.on('absensi-setting-changed', handleAbsensiSettingChanged);
    
    return () => {
      socket.off('jadwal-changed', handleJadwalChanged);
      socket.off('absensi-setting-changed', handleAbsensiSettingChanged);
    };
  }, [selectedKelas, fetchJadwal, fetchAbsensiSetting, socket]);

  /* ================= STATE HANDLING ================= */

  if (loading && !selectedKelas && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Manajemen Jadwal</Text>
      <Text style={styles.headerSubtitle}>
        Kelola jadwal dan batas absensi kelas
      </Text>
    </View>
  );

  const renderContent = () => (
    <>
      {/* FORM */}
      <View style={styles.card}>
        <Text style={styles.label}>Pilih Kelas</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedKelas ?? undefined}
            onValueChange={onKelasChange}
            style={styles.picker}
            dropdownIconColor="#6b7280"
          >
            <Picker.Item label="Pilih Kelas" value={null} />
            {kelasList.map(k => (
              <Picker.Item key={k.id} label={k.namaKelas} value={k.id} />
            ))}
          </Picker>
        </View>
      </View>

      {selectedKelas && (
        <>
          {/* BATAS ABSEN */}
          <View style={styles.card}>
            <Text style={styles.label}>Batas Absen</Text>
            <Text style={styles.cardSubtitle}>
              Tentukan jumlah maksimal absen yang diizinkan
            </Text>
            <TextInput
              style={styles.input}
              value={maxAbsen}
              onChangeText={setMaxAbsen}
              keyboardType="numeric"
              placeholder="Contoh: 3"
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.disabled]}
              onPress={saveMaxAbsen}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>SIMPAN BATAS ABSEN</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* BUAT JADWAL */}
          <View style={styles.card}>
            <Text style={styles.label}>Buat Jadwal Baru</Text>
            <Text style={styles.cardSubtitle}>
              Tambah jadwal untuk rentang tanggal tertentu
            </Text>

            <Text style={styles.inputLabel}>Jam Mulai</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={jamMulai}
                onValueChange={setJamMulai}
                style={styles.picker}
                dropdownIconColor="#6b7280"
              >
                {jamOptions.map(j => (
                  <Picker.Item key={j} label={j} value={j} />
                ))}
              </Picker>
            </View>

            <Text style={styles.inputLabel}>Jam Selesai</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={jamSelesai}
                onValueChange={setJamSelesai}
                style={styles.picker}
                dropdownIconColor="#6b7280"
              >
                {jamOptions.map(j => (
                  <Picker.Item key={j} label={j} value={j} />
                ))}
              </Picker>
            </View>

            <Text style={styles.inputLabel}>Tanggal Mulai</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowTM(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.dateInputText}>
                {tanggalMulai?.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) || 'Pilih Tanggal Mulai'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Tanggal Selesai</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowTS(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.dateInputText}>
                {tanggalSelesai?.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) || 'Pilih Tanggal Selesai'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.disabled]}
              onPress={createBulk}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>BUAT JADWAL</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* LIST JADWAL PER BULAN */}
          {Object.entries(jadwalPerBulan).map(([key, list]) => {
            const [year, month] = key.split('-');
            return (
              <View style={styles.listCard} key={key}>
                <Text style={styles.listTitle}>
                  {bulanNama[+month]} {year}
                </Text>
                
                {list.length === 0 ? (
                  <Text style={styles.emptyText}>Belum ada jadwal</Text>
                ) : (
                  <FlatList
                    data={list}
                    numColumns={2}
                    scrollEnabled={false}
                    keyExtractor={i => i.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.listItem}>
                        <Text style={styles.itemDay}>{item.hari}</Text>
                        <Text style={styles.itemTime}>
                          {item.jamMulai} - {item.jamSelesai}
                        </Text>
                        <View style={styles.itemActions}>
                          <TouchableOpacity 
                            onPress={() => deleteJadwal(item.id)}
                            style={styles.deleteButton}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.deleteText}>Hapus</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingJadwal(item);
                              setEditJamMulai(item.jamMulai);
                              setEditJamSelesai(item.jamSelesai);
                              setEditTanggal(new Date(item.tanggal));
                              setEditVisible(true);
                            }}
                            style={styles.editButton}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.editText}>Edit</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                )}
              </View>
            );
          })}
        </>
      )}

      {/* SPACER UNTUK NAVIGATOR */}
      <View style={styles.spacer} />
    </>
  );

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderContent()}
      </ScrollView>

      {/* MODAL EDIT */}
      <Modal visible={editVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Jadwal</Text>
              <TouchableOpacity 
                onPress={() => setEditVisible(false)}
                style={styles.modalCloseButton}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Jam Mulai</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={editJamMulai}
                onValueChange={setEditJamMulai}
                style={styles.picker}
              >
                {jamOptions.map(j => (
                  <Picker.Item key={j} label={j} value={j} />
                ))}
              </Picker>
            </View>

            <Text style={styles.modalSubtitle}>Jam Selesai</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={editJamSelesai}
                onValueChange={setEditJamSelesai}
                style={styles.picker}
              >
                {jamOptions.map(j => (
                  <Picker.Item key={j} label={j} value={j} />
                ))}
              </Picker>
            </View>

            <Text style={styles.modalSubtitle}>Tanggal</Text>
            <TouchableOpacity
              disabled={editingJadwal?.absensi?.length > 0}
              style={[
                styles.dateInput,
                editingJadwal?.absensi?.length > 0 && styles.disabledInput
              ]}
              onPress={() => setShowTM(true)}
              activeOpacity={0.85}
            >
              <Text style={[
                styles.dateInputText,
                editingJadwal?.absensi?.length > 0 && styles.disabledText
              ]}>
                {editTanggal?.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) || 'Pilih Tanggal'}
              </Text>
            </TouchableOpacity>

            {editingJadwal?.absensi?.length > 0 && (
              <Text style={styles.warningText}>
                Jadwal sudah digunakan absensi, tanggal tidak bisa diubah
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabled]}
                onPress={submitEdit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DATE TIME PICKERS - HARUS DILUAR MODAL */}
      {showTM && (
        <DateTimePicker
          value={tanggalMulai || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowTM(false);
            if (selectedDate) {
              setTanggalMulai(selectedDate);
            }
          }}
        />
      )}
      {showTS && (
        <DateTimePicker
          value={tanggalSelesai || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowTS(false);
            if (selectedDate) {
              setTanggalSelesai(selectedDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  scrollView: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  scrollContent: {
    paddingBottom: 100, // Spacer untuk navigator
  },

  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "android" ? 48 : 64,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },

  headerSubtitle: {
    marginTop: 6,
    color: "#c7d2fe",
    fontSize: 14,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
    fontWeight: "500",
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 14,
    color: "#111827",
  },

  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },

  picker: {
    backgroundColor: "#f9fafb",
    color: "#111827", 
  },

  dateInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  dateInputText: {
    fontSize: 14,
    color: "#111827",
  },

  disabledInput: {
    backgroundColor: "#f3f4f6",
    opacity: 0.7,
  },

  disabledText: {
    color: "#9ca3af",
  },

  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },

  disabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  listCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  listTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111827",
  },

  listItem: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    margin: 6,
    flex: 1,
  },

  itemDay: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2933",
    marginBottom: 4,
  },

  itemTime: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },

  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
  },

  deleteText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
  },

  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#dbeafe",
    borderRadius: 8,
  },

  editText: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
    paddingVertical: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },

  spacer: {
    height: 100,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCloseText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },

  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 4,
    marginBottom: 16,
    fontStyle: 'italic',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },

  cancelButtonText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },

  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },

  saveButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
});

export default AdminJadwalScreen;