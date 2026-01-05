import { Linking, Share, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfoModule from 'react-native-device-info';

import { WebViewBridgeMessage, DeviceInfo } from '../types';

export class WebViewBridge {
  static async handleBridgeMessage(
    message: WebViewBridgeMessage,
    onResult?: (success: boolean, data?: any) => void
  ): Promise<void> {
    try {
      switch (message.action) {
        case 'OPEN_URL':
          await this.openURL(message.payload?.url);
          onResult?.(true);
          break;

        case 'OPEN_WHATSAPP':
          await this.openWhatsApp(
            message.payload?.phoneNumber,
            message.payload?.message
          );
          onResult?.(true);
          break;

        case 'OPEN_PHONE':
          await this.openPhone(message.payload?.phoneNumber);
          onResult?.(true);
          break;

        case 'OPEN_EMAIL':
          await this.openEmail(
            message.payload?.email,
            message.payload?.subject,
            message.payload?.body
          );
          onResult?.(true);
          break;

        case 'OPEN_MAP':
          await this.openMap(
            message.payload?.latitude,
            message.payload?.longitude,
            message.payload?.label
          );
          onResult?.(true);
          break;

        case 'SHARE':
          await this.share(message.payload?.message, message.payload?.url);
          onResult?.(true);
          break;

        case 'GET_DEVICE_INFO':
          onResult?.(true, await this.getDeviceInfo());
          break;

        case 'LOG_EVENT':
          console.log('[WebView Event]', message.payload);
          onResult?.(true);
          break;

        case 'SHOW_TOAST':
          console.log('[WebView Toast]', message.payload?.message);
          onResult?.(true);
          break;

        case 'STORE_DATA':
          await this.storeData(message.payload?.key, message.payload?.value);
          onResult?.(true);
          break;

        case 'GET_DATA':
          onResult?.(true, await this.getData(message.payload?.key));
          break;

        case 'CLEAR_DATA':
          await this.clearData(message.payload?.key);
          onResult?.(true);
          break;

        default:
          onResult?.(false, { error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Bridge error:', error);
      onResult?.(false, { error: String(error) });
    }
  }

  private static async openURL(url?: string) {
    if (!url) throw new Error('URL required');
    if (!(await Linking.canOpenURL(url))) throw new Error('Cannot open URL');
    await Linking.openURL(url);
  }

  private static async openWhatsApp(phone?: string, msg?: string) {
    if (!phone) throw new Error('Phone required');
    await this.openURL(`https://wa.me/${phone}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`);
  }

  private static async openPhone(phone?: string) {
    if (!phone) throw new Error('Phone required');
    await this.openURL(`tel:${phone}`);
  }

  private static async openEmail(email?: string, subject?: string, body?: string) {
    if (!email) throw new Error('Email required');
    const q = [];
    if (subject) q.push(`subject=${encodeURIComponent(subject)}`);
    if (body) q.push(`body=${encodeURIComponent(body)}`);
    await this.openURL(`mailto:${email}${q.length ? `?${q.join('&')}` : ''}`);
  }

  private static async openMap(lat?: number, lng?: number, label?: string) {
    if (lat == null || lng == null) throw new Error('Coordinates required');

    if (Platform.OS === 'ios') {
      return this.openURL(`http://maps.apple.com/?ll=${lat},${lng}`);
    }

    if (Platform.OS === 'android') {
      try {
        return this.openURL(`geo:${lat},${lng}?q=${lat},${lng}(${label ?? ''})`);
      } catch {}
    }

    return this.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
  }

  private static async share(message?: string, url?: string) {
    if (!message && !url) throw new Error('Nothing to share');
    await Share.share({ message: message ?? url! });
  }

  private static async getDeviceInfo(): Promise<DeviceInfo> {
    return {
      platform: Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : 'web',
      osVersion: DeviceInfoModule.getSystemVersion(),
      deviceName: await DeviceInfoModule.getDeviceName(),
      appVersion: DeviceInfoModule.getVersion(),
      buildNumber: DeviceInfoModule.getBuildNumber(),
      hasInternet: true,
    };
  }

  private static async storeData(key: string, value: any) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  private static async getData(key: string) {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  private static async clearData(key?: string) {
    key ? await AsyncStorage.removeItem(key) : await AsyncStorage.clear();
  }
}
