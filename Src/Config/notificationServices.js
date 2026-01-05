import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';
import axios from 'axios';
import notifee, { AndroidImportance } from '@notifee/react-native';

const CHANNEL_ID = 'chat_notifications';
const CHANNEL_NAME = 'Chat Messages';

// 1. Notification Permission Request and Channel Creation
export async function requestUserPermission() {
    // Notification Channel Create karna (Android 8+ ke liye zaroori, warna crash ho sakta hai)
    await notifee.createChannel({
        id: CHANNEL_ID,
        name: CHANNEL_NAME,
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
    });

    if (Platform.OS === 'android' && Platform.Version >= 33) {
        // Android 13+ ke liye runtime permission
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getFcmToken();
        } else {
            console.log('Permission denied for POST_NOTIFICATIONS');
        }
    } else {
        // iOS aur Android < 13 ke liye (Purana logic)
       const authStatus = await messaging().requestPermission({
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        provisional: false,
        sound: true,
    });
       const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
        // iOS ke liye APNs Token milna zaroori hai FCM se pehle
        if (Platform.OS === 'ios') {
            const apnsToken = await messaging().getAPNSToken();
            if (apnsToken) {
                console.log("apnsToken ",apnsToken);
                getFcmToken();
            } else {
                // Agar token nahi mila, to thodi der baad try karein
                setTimeout(getFcmToken, 3000);
            }
        } else {
            getFcmToken();
        }
    }}
}

// 2. FCM Token Handling (No changes needed in logic)
async function getFcmToken() {
  try {
    const fcmToken = await messaging().getToken();
    const authToken = await AsyncStorage.getItem('auth_token');

    if (!fcmToken) return;

    const payload = {
      token: fcmToken,
      platform: Platform.OS,
      device_name: Platform.OS === 'android' ? Platform.constants.Model : Platform.OS === 'ios' ? 'iOS Device' : 'Other Device',
    };

    console.log('✅🚀 Payload:', payload);
    console.log('🔐 Auth Token:', authToken);

    let res;

    if (authToken) {
      res = await axios.post(
        'https://mydreamshot.com/api/update-fmctocken',
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
    } else {
      res = await axios.post(
        'https://mydreamshot.com/api/update-fmctocken',
        payload
      );
    }

    console.log('✅✅ FCM API Response:', res.data);

  } catch (error) {
    console.error(
      '❌ FCM Token API failed:',
      error?.response?.data || error?.message || error
    );
  }
}


// 3. System Notification Display via Notifee (For Background/Quit state)
export async function displayLocalNotification(remoteMessage) {
    const { notification, data } = remoteMessage;

    await notifee.displayNotification({
        title: notification?.title || data?.sender_name || 'New Message',
        body: notification?.body || data?.full_message || 'You have an update.',
        data: data,
        ios: {
            foregroundPresentationOptions: {
                badge: true,
                sound: true,
                banner: true, // Yeh zaroori hai iOS foreground banner ke liye
                list: true,
            },
        },
        android: {
            channelId: CHANNEL_ID, // CRITICAL for Android 8+
            pressAction: {
                id: 'default',
                launchActivity: 'default',
            },
            // smallIcon: 'ic_notification', 
        },
    });
}

// 4. Background Message Handler (Yeh index.js mein use hoga)
export async function backgroundMessageHandler(remoteMessage) {
    console.log('Headless/Background Message:', remoteMessage);
    // Jab app background ya quit state mein ho, to system notification show karein
    await displayLocalNotification(remoteMessage);
}

// 5. Setup Listeners for App.js (Navigation logic)
export function setupAppListeners(navigation) {
    
    // 2. BACKGROUND STATE: Notification par click hone par
    const backgroundOpen = messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('App opened from background:', remoteMessage);
        if (remoteMessage?.data?.session && remoteMessage?.data?.type === "chat_message") {
            navigation.navigate('Main');
        }
    });

    // 3. QUIT STATE: App band hone par notification click
    messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
            console.log('App opened from quit state:', remoteMessage);
            if (remoteMessage.data?.session && remoteMessage.data?.type === "chat_message") {
                 // Ek chota timeout de sakte hain navigation ko stable hone ke liye
                 setTimeout(() => {
                    // ERROR SOLVED: Removed 'as string' and '!'
                    navigation.navigate('Main');
                 }, 500);
            }
        }
    });
    
    return backgroundOpen;
}