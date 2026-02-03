import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { API } from "../../services/api";
import Ionicons from "@react-native-vector-icons/ionicons";

const { width, height } = Dimensions.get("window");
const rnBiometrics = new ReactNativeBiometrics();

const CreateAdminBiometric = () => {
  const [authorized, setAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    authenticate();
  }, []);

  const authenticate = async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      if (!available) {
        Alert.alert(
          "Perangkat Tidak Didukung",
          "Perangkat Anda tidak memiliki sensor biometrik yang diperlukan untuk mengakses fitur ini.",
          [{ text: "OK", style: "default" }]
        );
        setAuthorized(false);
        setAuthLoading(false);
        return;
      }

      const biometryName = 
        biometryType === "FaceID" ? "Face ID" :
        biometryType === "TouchID" ? "Touch ID" : "Biometrik";

      const result = await rnBiometrics.simplePrompt({
        promptMessage: `Verifikasi ${biometryName}`,
        cancelButtonText: "Batal",
        fallbackPromptMessage: "Gunakan metode autentikasi alternatif",
      });

      if (result.success) {
        setAuthorized(true);
      } else {
        Alert.alert("Autentikasi Dibatalkan", "Operasi membutuhkan verifikasi biometrik.", [
          { text: "Coba Lagi", onPress: authenticate, style: "default" },
          { text: "Tutup", style: "cancel" },
        ]);
        setAuthorized(false);
      }
    } catch (err) {
      Alert.alert("Kesalahan Autentikasi", "Terjadi kesalahan saat memverifikasi identitas.", [
        { text: "Coba Lagi", onPress: authenticate, style: "default" },
        { text: "Batal", style: "destructive" },
      ]);
      setAuthorized(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Validasi", "Nama admin harus diisi");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Validasi", "Email admin harus diisi");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Validasi", "Format email tidak valid");
      return false;
    }
    if (!password) {
      Alert.alert("Validasi", "Password harus diisi");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Validasi", "Password minimal 6 karakter");
      return false;
    }
    return true;
  };

  const handleCreateAdmin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/admin/create`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      
      Alert.alert(
        "Berhasil!",
        `Admin baru berhasil dibuat:\n\nNama: ${response.data.data.name}\nEmail: ${response.data.data.email}`,
        [
          { 
            text: "OK", 
            onPress: () => {
              setName("");
              setEmail("");
              setPassword("");
            } 
          }
        ]
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Terjadi kesalahan saat membuat admin";
      
      Alert.alert(
        "Gagal Membuat Admin",
        errorMessage,
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const retryAuthentication = () => {
    setAuthLoading(true);
    authenticate();
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View style={styles.authLoadingContainer}>
          <View style={styles.loadingCard}>
            <View style={[styles.iconContainer, styles.securityIcon]}>
              <Ionicons name="shield-checkmark" size={48} color="#3b82f6" />
            </View>
            <Text style={styles.authLoadingTitle}>Memverifikasi Keamanan</Text>
            <Text style={styles.authLoadingSubtitle}>
              Membutuhkan autentikasi biometrik untuk melanjutkan
            </Text>
            <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
            <Text style={styles.loadingHint}>
              Pastikan sensor biometrik Anda siap
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!authorized) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View style={styles.unauthorizedContainer}>
          <View style={styles.unauthorizedCard}>
            <View style={[styles.iconContainer, styles.lockedIcon]}>
              <Ionicons name="lock-closed" size={48} color="#ef4444" />
            </View>
            <Text style={styles.unauthorizedTitle}>Akses Ditolak</Text>
            <Text style={styles.unauthorizedMessage}>
              Anda perlu melakukan verifikasi biometrik untuk mengakses fitur ini.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={retryAuthentication}
              activeOpacity={0.8}
            >
              <Ionicons name="finger-print" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Coba Verifikasi Ulang</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => Alert.alert("Info", "Fitur ini membutuhkan verifikasi biometrik untuk keamanan.")}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Pelajari Lebih Lanjut</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, styles.successIcon]}>
              <Ionicons name="shield-checkmark" size={24} color="#10b981" />
            </View>
            <Text style={styles.title}>Buat Akun Admin Baru</Text>
            <Text style={styles.subtitle}>
              Tambahkan administrator baru dengan hak akses penuh
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Ionicons name="person-add" size={24} color="#3b82f6" />
              <Text style={styles.formTitle}>Informasi Admin</Text>
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <Ionicons name="person-outline" size={16} color="#6b7280" />
                <Text style={styles.inputLabel}>Nama Lengkap</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Masukkan nama lengkap admin"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  autoCapitalize="words"
                  editable={!loading}
                />
                {name.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => setName("")}
                    style={styles.clearButton}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="close-circle" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.inputHint}>
                Nama yang akan ditampilkan di sistem
              </Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <Ionicons name="mail-outline" size={16} color="#6b7280" />
                <Text style={styles.inputLabel}>Alamat Email</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="admin@example.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  editable={!loading}
                />
                {email.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => setEmail("")}
                    style={styles.clearButton}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="close-circle" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.inputHint}>
                Digunakan untuk login dan notifikasi
              </Text>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <Ionicons name="key-outline" size={16} color="#6b7280" />
                <Text style={styles.inputLabel}>Password</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { paddingRight: 50 }]}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.passwordStrength}>
                <View style={[
                  styles.strengthBar, 
                  { 
                    backgroundColor: password.length >= 6 ? "#10b981" : "#e5e7eb",
                    width: `${Math.min((password.length / 12) * 100, 100)}%` 
                  }
                ]} />
              </View>
              <Text style={styles.inputHint}>
                Password minimal 6 karakter untuk keamanan
              </Text>
            </View>

            {/* Security Info */}
            <View style={styles.securityInfo}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.securityText}>
                Semua data admin akan dienkripsi dan dilindungi
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
                (!name || !email || !password) && styles.submitButtonDisabled
              ]}
              onPress={handleCreateAdmin}
              disabled={loading || !name || !email || !password}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Buat Akun Admin</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Cancel/Back Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => Alert.alert(
                "Batalkan",
                "Apakah Anda yakin ingin keluar? Data yang belum disimpan akan hilang.",
                [
                  { text: "Lanjutkan", style: "cancel" },
                  { text: "Keluar", style: "destructive", onPress: () => setAuthorized(false) }
                ]
              )}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color="#6b7280" />
              <Text style={styles.cancelButtonText}>Kembali ke Verifikasi</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Notes */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>🔐 Informasi Keamanan</Text>
            <View style={styles.footerItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.footerText}>Semua data dienkripsi end-to-end</Text>
            </View>
            <View style={styles.footerItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.footerText}>Verifikasi biometrik diperlukan</Text>
            </View>
            <View style={styles.footerItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.footerText}>Akses terbatas untuk admin terverifikasi</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateAdminBiometric;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  
  // Auth Loading Styles
  authLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: width * 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  securityIcon: {
    backgroundColor: "#eff6ff",
    borderWidth: 2,
    borderColor: "#dbeafe",
  },
  authLoadingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  authLoadingSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  loader: {
    marginVertical: 24,
  },
  loadingHint: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 16,
  },
  
  // Unauthorized Styles
  unauthorizedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  unauthorizedCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: width * 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  lockedIcon: {
    backgroundColor: "#fef2f2",
    borderWidth: 2,
    borderColor: "#fee2e2",
  },
  unauthorizedTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ef4444",
    marginBottom: 12,
  },
  unauthorizedMessage: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    gap: 10,
    marginBottom: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  
  // Main Form Styles
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
  },
  successIcon: {
    backgroundColor: "#d1fae5",
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
  
  // Form Card
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginLeft: 12,
  },
  
  // Input Styles
  inputGroup: {
    marginBottom: 24,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 8,
  },
  required: {
    color: "#ef4444",
    fontSize: 16,
    marginLeft: 4,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1f2937",
  },
  clearButton: {
    position: "absolute",
    right: 16,
    top: 14,
    zIndex: 10,
  },
  passwordToggle: {
    position: "absolute",
    right: 16,
    top: 14,
    zIndex: 10,
  },
  inputHint: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 6,
    fontStyle: "italic",
  },
  passwordStrength: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  strengthBar: {
    height: "100%",
    borderRadius: 2,
  },
  
  // Security Info
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  securityText: {
    fontSize: 14,
    color: "#1e40af",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  
  // Buttons
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#d1d5db",
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 15,
    fontWeight: "500",
  },
  
  // Footer
  footer: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 8,
    flex: 1,
  },
});