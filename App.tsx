import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import { ActivityIndicator, View } from 'react-native';
import Main from './Src/main/main';
import InternetError from './Src/Error/InternetError/InternetError';


export type RootStackParamList = {
  Main: undefined;
  InternetError: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  if (isConnected === null) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main">
          {() => isConnected ? <Main/> : <InternetError />}
        </Stack.Screen>
        <Stack.Screen name="InternetError" component={InternetError} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
