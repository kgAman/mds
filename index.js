/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
<<<<<<< HEAD
import messaging from '@react-native-firebase/messaging';

// Background & Quit State Handler

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  // No need for Toast.show() here, as it's a non-UI context.
  // Ensure your backend sends the 'notification' field in the payload.
});
=======
>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903

AppRegistry.registerComponent(appName, () => App);
