import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

/* =======================
   INTERFACES
======================= */
interface Profile {
  namaLengkap: string;
  noHp?: string;
  alamat?: string;
  fotoUrl?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  profile?: Profile | null;
}

/* =======================
   SCREEN
======================= */
export default function ProfileScreen() {
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  /* =======================
     LOGOUT
  ======================= */
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Apakah kamu yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.multiRemove(["token", "role"]);
            navigation.replace("Login");
          },
        },
      ]
    );
  };

  /* =======================
     FETCH PROFILE
  ======================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const res = await axios.get(
          "https://nivi-production.up.railway.app/api/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // 🔥 FLEXIBLE RESPONSE HANDLING
        const user =
          res.data?.data ||
          res.data?.user ||
          res.data ||
          null;

        setData(user);
      } catch (error) {
        console.log("Gagal ambil profile:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* =======================
     LOADING
  ======================= */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* =======================
     GUEST PROFILE FALLBACK
  ======================= */
  const guestUser: UserProfile = {
    id: 0,
    name: "Guest User",
    email: "guest@nivi.app",
    role: "guest",
    profile: {
      namaLengkap: "Tamu",
      alamat: "-",
      jenisKelamin: "-",
    },
  };

  const userData = data ?? guestUser;
  const profile = userData.profile;

  /* =======================
     UI
  ======================= */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{
          uri:
            profile?.fotoUrl ||
            `https://ui-avatars.com/api/?name=${userData.name}`,
        }}
        style={styles.avatar}
      />

      <Text style={styles.name}>
        {profile?.namaLengkap || userData.name}
      </Text>
      <Text style={styles.email}>{userData.email}</Text>
      <Text style={styles.role}>{userData.role.toUpperCase()}</Text>

      <View style={styles.card}>
        <ProfileItem label="No. HP" value={profile?.noHp} />
        <ProfileItem label="Alamat" value={profile?.alamat} />
        <ProfileItem
          label="Tanggal Lahir"
          value={
            profile?.tanggalLahir
              ? new Date(profile.tanggalLahir).toLocaleDateString()
              : "-"
          }
        />
        <ProfileItem
          label="Jenis Kelamin"
          value={profile?.jenisKelamin}
        />
      </View>

<TouchableOpacity
  style={styles.logoutButton}
  onPress={handleLogout}
>
  <Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>

    </ScrollView>
  );
}

/* =======================
   COMPONENT
======================= */
const ProfileItem = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "-"}</Text>
  </View>
);

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  email: {
    color: "gray",
    marginBottom: 4,
  },
  role: {
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  item: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "gray",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#E53935",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
