import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API } from '../../services/api';
import { Icon } from 'react-native-elements';

interface RouteParams {
  submissionId: number;
}

const NilaiScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { submissionId } = route.params as RouteParams;

  const [nilai, setNilai] = useState('');
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    nilai: false,
  });

  const validateInputs = () => {
    const errors = {
      nilai: nilai.trim() === '',
    };
    setInputErrors(errors);
    return !errors.nilai;
  };

  const submitNilai = async () => {
    if (!validateInputs()) {
      Alert.alert('Perhatian', 'Harap isi semua field yang wajib');
      return;
    }

    const nilaiNumber = Number(nilai);
    if (nilaiNumber < 0 || nilaiNumber > 100) {
      Alert.alert('Perhatian', 'Nilai harus antara 0 - 100');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');

      await axios.post(
        `${API}/nilai`,
        {
          submissionId,
          nilai: nilaiNumber,
          catatan: catatan.trim() || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(
        'Berhasil',
        'Nilai berhasil dikirim',
        [
          { 
            text: 'Kembali', 
            onPress: () => navigation.goBack(),
            style: 'default'
          },
        ]
      );
    } catch (err: any) {
      console.log(err);
      const errorMessage = err.response?.data?.message || 'Gagal mengirim nilai';
      Alert.alert('Kesalahan', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Icon name="arrow-left" type="font-awesome" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Input Nilai Tugas</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* CARD FORM */}
          <View style={styles.card}>
            <View style={styles.formHeader}>
              <View style={styles.iconContainer}>
                <Icon name="edit" type="font-awesome" size={20} color="#3498db" />
              </View>
              <View>
                <Text style={styles.formTitle}>Penilaian Tugas</Text>
                <Text style={styles.formSubtitle}>
                  Masukkan nilai dan catatan untuk tugas santri
                </Text>
              </View>
            </View>

            {/* INPUT NILAI */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nilai <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.labelHint}>Masukkan nilai antara 0 - 100</Text>
              <View style={[
                styles.inputContainer,
                inputErrors.nilai && styles.inputError
              ]}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={nilai}
                  onChangeText={(text) => {
                    setNilai(text);
                    if (text.trim() !== '') {
                      setInputErrors(prev => ({...prev, nilai: false}));
                    }
                  }}
                  placeholder="Contoh: 85"
                  placeholderTextColor="#94a3b8"
                  maxLength={3}
                />
                <View style={styles.inputSuffix}>
                  <Text style={styles.suffixText}>/100</Text>
                </View>
              </View>
              {inputErrors.nilai && (
                <Text style={styles.errorText}>Nilai wajib diisi</Text>
              )}
            </View>

            {/* INPUT CATATAN */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Catatan 
                <Text style={styles.optional}> (Opsional)</Text>
              </Text>
              <Text style={styles.labelHint}>
                Berikan feedback atau saran untuk santri
              </Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={[styles.textArea, { height: 120 }]}
                  multiline
                  value={catatan}
                  onChangeText={setCatatan}
                  placeholder="Masukkan catatan untuk santri..."
                  placeholderTextColor="#94a3b8"
                  textAlignVertical="top"
                  numberOfLines={4}
                />
                <Text style={styles.charCount}>
                  {catatan.length}/500 karakter
                </Text>
              </View>
            </View>

            {/* INFO BOX */}
            <View style={styles.infoBox}>
              <Icon name="info-circle" type="font-awesome" size={16} color="#3498db" />
              <Text style={styles.infoText}>
                Nilai yang dimasukkan akan langsung tersimpan dan dapat dilihat oleh santri
              </Text>
            </View>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.submitButton,
                (!nilai.trim() || loading) && styles.buttonDisabled
              ]} 
              onPress={submitNilai} 
              disabled={!nilai.trim() || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="check" type="font-awesome" size={16} color="#fff" />
                  <Text style={styles.submitButtonText}>Kirim Nilai</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NilaiScreen;

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  
  container: {
    flex: 1,
  },

  /* HEADER */
  header: {
    backgroundColor: "#1e3a8a",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === "android" ? 12 : 0,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: 'center',
  },

  headerSpacer: {
    width: 40,
  },

  /* CONTENT */
  content: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },

  /* CARD */
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ebf5fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  formSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },

  /* INPUT GROUPS */
  inputGroup: {
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },

  required: {
    color: "#ef4444",
  },

  optional: {
    color: "#6b7280",
    fontWeight: "400",
  },

  labelHint: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    overflow: 'hidden',
  },

  inputError: {
    borderColor: "#ef4444",
    backgroundColor: '#fef2f2',
  },

  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    fontWeight: '500',
    color: "#111827",
    minHeight: 50,
  },

  inputSuffix: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f1f5f9',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },

  suffixText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },

  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 6,
    fontWeight: '500',
  },

  textAreaContainer: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    overflow: 'hidden',
  },

  textArea: {
    padding: 14,
    fontSize: 14,
    color: "#111827",
    textAlignVertical: 'top',
  },

  charCount: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: 'right',
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  /* INFO BOX */
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    marginTop: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#0369a1",
    marginLeft: 12,
    lineHeight: 18,
    fontWeight: '500',
  },

  /* ACTION BUTTONS */
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },

  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4b5563",
    letterSpacing: 0.3,
  },

  submitButton: {
    backgroundColor: "#3498db",
  },

  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },

  submitButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 8,
    letterSpacing: 0.3,
  },
});