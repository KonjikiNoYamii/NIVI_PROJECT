import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { useAiBubble } from '../context/aiBubbleContext';
import Ionicons from '@react-native-vector-icons/ionicons';

const toneColor = {
  positif: '#10b981',
  netral: '#3b82f6',
  peringatan: '#ef4444',
};

export const AIBubble = () => {
  const { clearBubble, bubble } = useAiBubble();
  const pan = useRef(new Animated.ValueXY({ x: 50, y: 150 })).current;

  const [expanded, setExpanded] = useState(!!bubble?.comment);
  const [bubbleLeft, setBubbleLeft] = useState<number>(50);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (!bubble?.comment) return;
    setExpanded(true);
    const timer = setTimeout(() => clearBubble(), 5000);
    return () => clearTimeout(timer);
  }, [bubble?.comment]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => pan.extractOffset(),
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        setBubbleLeft(gestureState.moveX); // update setiap gerakan
      },
    }),
  ).current;

  const getDynamicBubblePosition = (): ViewStyle =>
    bubbleLeft < screenWidth / 2
      ? { left: 60, alignItems: 'flex-start' }
      : { right: 60, alignItems: 'flex-end' };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={[
          styles.iconCircle,
          { backgroundColor: bubble ? toneColor[bubble.tone] : '#999' },
        ]}
        onPress={() => setExpanded(!expanded)}
      >
        <Ionicons
         name="analytics" size={25} color="#fff" />
      </TouchableOpacity>

      {expanded && bubble && (
        <View
          style={[
            styles.bubble,
            getDynamicBubblePosition(),
            { backgroundColor: toneColor[bubble.tone] },
          ]}
        >
          <Text style={styles.label}>
            {bubble.tone === 'peringatan' ? '⚠️ ' : '🤖 '}Silica AI
          </Text>
          <Text
            style={[
              styles.text,
              bubbleLeft < screenWidth / 2
                ? { textAlign: 'left' }
                : { textAlign: 'right' },
            ]}
          >
            {bubble.comment}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', zIndex: 999 },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  bubble: {
    position: 'absolute',
    top: 60,
    maxWidth: 350,
    minWidth: 120,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    flexWrap: 'wrap',
  },
});
