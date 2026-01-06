import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SantriNavigator from './SantriNavigator';


const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
        <Stack.Screen name='SantriNavigator' component={SantriNavigator}/>
    </Stack.Navigator>    
  )
}