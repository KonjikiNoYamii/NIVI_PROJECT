import React, { useContext } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { UserContext } from '../context/UserContext';

const FloatingArchiveButton = () => {
  const navigation = useNavigation<any>();
  const { role } = useContext(UserContext);

  if (role !== 'pengajar') return null; // hanya pengajar

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => navigation.navigate('ArsipSubmission')}
      activeOpacity={0.8}
    >
      <Ionicons name="archive-outline" size={28} color="#fff" />
    </TouchableOpacity>
  );
};

export default FloatingArchiveButton;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100, // naikkan tombol lebih ke atas
    right: 20,
    backgroundColor: '#3b82f6',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex:30
  },
});
