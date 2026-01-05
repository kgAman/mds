import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import {
  ActivityIndicator,
  View,
  Image,
  Text,
  Platform,
} from 'react-native';
import BootSplash from "react-native-bootsplash";
import messaging from '@react-native-firebase/messaging';
import Toast, { ToastConfig, ToastProps } from 'react-native-toast-message';

import Main from './Src/main/main';
import InternetError from './Src/Error/InternetError/InternetError';
import {
  requestUserPermission,
  setupAppListeners,
} from './Src/Config/notificationServices';
import WelcomeScreen from './Src/WelCome/WelCome';

/* ---------------- Navigation Ref ---------------- */
export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

/* ---------------- Types ---------------- */
export type RootStackParamList = {
  Main: undefined;
  InternetError: undefined;
  WelcomeScreen: undefined;
};

type ChatToastCustomProps = {
  sender_name: string;
  full_message: string;
  sender_profile: string;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/* ---------------- Custom Toast ---------------- */
const ChatToast: React.FC<
  ToastProps & { props: ChatToastCustomProps }
> = ({ props }) => {
  const { sender_name, full_message, sender_profile } = props;

  return (
    <View
      style={{
        height: 60,
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        elevation: 5,
      }}
    >
      <Image
        source={{ uri: sender_profile }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          marginRight: 10,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 14 }}>
          {sender_name}
        </Text>
        <Text style={{ fontSize: 12 }} numberOfLines={1}>
          {full_message}
        </Text>
      </View>
    </View>
  );
};

const toastConfig: ToastConfig = {
  chatToast: props => <ChatToast {...props} />,
};

/* ---------------- App ---------------- */
export default function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  /* -------- FCM Setup -------- */
  useEffect(() => {
    requestUserPermission();

    const cleanupBackground = setupAppListeners(navigationRef);

    const unsubscribeForeground = messaging().onMessage(
      async remoteMessage => {
        const { notification, data } = remoteMessage;

        if (data?.type === 'chat_message') {
          Toast.show({
            type: 'chatToast',
            props: {
              sender_name:
                data.sender_name || notification?.title || 'New Message',
              full_message:
                data.full_message ||
                notification?.body ||
                'New message received',
              sender_profile: data.sender_profile,
            },
            visibilityTime: 5000,
          });
        }
      }
    );

    return () => {
      unsubscribeForeground();
      cleanupBackground();
    };
  }, []);


    useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
    };

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
      console.log("✅✅✅ BootSplash has been hidden successfully");
    });
  }, []);


  /* -------- Internet Check -------- */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return unsubscribe;
  }, []);

  if (isConnected === null) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer ref={navigationRef}   >
        <Stack.Navigator screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Main">
            {() => (isConnected ? <Main /> : <InternetError />)}
          </Stack.Screen>
          <Stack.Screen
            name="InternetError"
            component={InternetError}
          />
         
        </Stack.Navigator>
      </NavigationContainer>

      {/* Toast Root */}
      <Toast config={toastConfig} />
    </>
  );
}
