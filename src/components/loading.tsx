import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { BlurView } from '@react-native-community/blur';

type Props = {
  visible: boolean;
};

const Loading = ({ visible }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />

        <LottieView
          source={require('../assets/loading.json')}
          autoPlay
          loop
          style={{ width: 180, height: 180 }}
        />
      </View>
    </Modal>
  );
};

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
