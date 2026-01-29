import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AIBubble } from './src/components/aiBubble';

import RootNavigator from './src/navitagion/RootNavigator';
import { AiBubbleProvider } from './src/context/aiBubbleContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <AiBubbleProvider>
          <RootNavigator />
          <AIBubble />
        </AiBubbleProvider>
    </GestureHandlerRootView>
  );
}

