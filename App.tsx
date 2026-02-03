import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AIBubble } from './src/components/aiBubble';

import RootNavigator from './src/navitagion/RootNavigator';
import { AiBubbleProvider } from './src/context/aiBubbleContext';
import { SocketProvider } from './src/context/SocketContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SocketProvider>
          <AiBubbleProvider>
            <RootNavigator />
            <AIBubble />
          </AiBubbleProvider>
      </SocketProvider>
    </GestureHandlerRootView>
  );
}
