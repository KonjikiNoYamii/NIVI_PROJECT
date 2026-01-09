import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { absensiService, Absensi } from "../services/absensi";

const MAX_ABSEN = 4;

const STATUS: ("hadir" | "izin" | "sakit")[] = [
  "hadir",
  "izin",
  "sakit",
];

// Perbaikan: Gunakan type yang lebih aman
type StatusType = "hadir" | "izin" | "sakit";
type StatusConfigType = {
  [key in StatusType]: { 
    color: string; 
    bg: string; 
    icon: string; 
  };
};

const STATUS_CONFIG: StatusConfigType = {
  hadir: { color: "#2ecc71", bg: "#e8f8ef", icon: "✓" },
  izin: { color: "#f39c12", bg: "#fef9e7", icon: "!" },
  sakit: { color: "#e74c3c", bg: "#fdedec", icon: "+" },
};

// Helper function untuk mendapatkan config status dengan fallback
const getStatusConfig = (status: string) => {
  const config = STATUS_CONFIG[status as StatusType];
  if (config) {
    return config;
  }
  // Fallback untuk status yang tidak dikenali (seperti "alpha")
  return { color: "#7f8c8d", bg: "#ecf0f1", icon: "•" };
};

const AttendanceScreen = () => {
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [selectedStatus, setSelectedStatus] =
    useState<"hadir" | "izin" | "sakit" | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [buttonScale] = useState(new Animated.Value(1));

  const loadAbsensi = async () => {
    try {
      setLoading(true);
      const data = await absensiService.getToday();
      setAbsensi(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAbsensi();
    // Animasi fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Animasi scale in
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const sisaAbsen = MAX_ABSEN - absensi.length;

  const submit = async () => {
    if (!selectedStatus) return;

    // Animasi tombol submit
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 200,
        easing: Easing.elastic(1.5),
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await absensiService.absen(selectedStatus);
      setSelectedStatus(null);
      loadAbsensi();
    } catch (e: any) {
      Alert.alert("Gagal", e.response?.data?.message || "Error");
    }
  };

  const getStatusIcon = (status: string) => {
    const config = getStatusConfig(status);
    return config.icon;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Absensi Hari Ini</Text>
          <View style={styles.infoContainer}>
            <View style={[styles.counter, sisaAbsen <= 0 && styles.counterDisabled]}>
              <Text style={styles.counterText}>
                {sisaAbsen}/{MAX_ABSEN}
              </Text>
            </View>
            <Text style={styles.infoText}>Sisa Absen</Text>
          </View>
        </View>

        {/* Status Selection */}
        <Text style={styles.sectionTitle}>Pilih Status</Text>
        <View style={styles.optionsContainer}>
          {STATUS.map((status) => {
            const config = STATUS_CONFIG[status];
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.option,
                  selectedStatus === status && [
                    styles.optionActive,
                    { borderColor: config.color }
                  ],
                ]}
                onPress={() => {
                  setSelectedStatus(status);
                  // Haptic feedback (jika tersedia)
                }}
              >
                <View style={[
                  styles.statusIcon,
                  { backgroundColor: config.bg }
                ]}>
                  <Text style={[
                    styles.iconText,
                    { color: config.color }
                  ]}>
                    {config.icon}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  selectedStatus === status && { color: config.color }
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
                {selectedStatus === status && (
                  <View style={[
                    styles.selectedIndicator,
                    { backgroundColor: config.color }
                  ]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Submit Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[
              styles.submit,
              (!selectedStatus || sisaAbsen <= 0) && styles.disabled,
            ]}
            disabled={!selectedStatus || sisaAbsen <= 0}
            onPress={submit}
            activeOpacity={0.7}
          >
            <Text style={styles.submitText}>SIMPAN ABSENSI</Text>
            {selectedStatus && (
              <View style={[
                styles.submitIcon,
                { backgroundColor: STATUS_CONFIG[selectedStatus].color }
              ]}>
                <Text style={styles.submitIconText}>
                  {STATUS_CONFIG[selectedStatus].icon}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Attendance List */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Riwayat Absensi</Text>
          <Text style={styles.listCount}>({absensi.length})</Text>
        </View>
        
        <FlatList
          data={absensi}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            // Gunakan helper function untuk mendapatkan config
            const config = getStatusConfig(item.status);
            
            return (
              <Animated.View 
                style={[
                  styles.card,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { 
                        translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: config.bg }
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      { color: config.color }
                    ]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.time}>
                    {new Date(item.tanggal).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <Text style={styles.date}>
                  {new Date(item.tanggal).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada absensi hari ini</Text>
            </View>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: "#2c3e50",
    flex: 1,
  },
  infoContainer: {
    alignItems: "center",
  },
  counter: {
    backgroundColor: "#3498db",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  counterDisabled: {
    backgroundColor: "#95a5a6",
    shadowColor: "#95a5a6",
  },
  counterText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  infoText: {
    color: "#7f8c8d",
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34495e",
    marginBottom: 12,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#dfe6e9",
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  optionActive: {
    borderWidth: 2,
    shadowColor: "#0984e3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
    fontWeight: "700",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  submit: {
    backgroundColor: "#3498db",
    padding: 18,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  disabled: {
    backgroundColor: "#bdc3c7",
    shadowColor: "#bdc3c7",
  },
  submitText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  submitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  submitIconText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    marginRight: 8,
  },
  listCount: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  time: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  date: {
    fontSize: 13,
    color: "#636e72",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: "#b2bec3",
    fontSize: 14,
    fontStyle: "italic",
  },
});