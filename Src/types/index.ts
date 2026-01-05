

export interface WebViewBridgeMessage {
  action: WebViewAction;
  payload?: Record<string, any>;
  id?: string;
  type?: string;
  token?: any;
  
}
export type WebViewAction =
  | 'OPEN_URL'
  | 'OPEN_WHATSAPP'
  | 'OPEN_PHONE'
  | 'OPEN_EMAIL'
  | 'OPEN_MAP'
  | 'PICK_IMAGE'
  | 'TAKE_PHOTO'
  | 'PICK_FILE'
  | 'SHARE'
  | 'GET_DEVICE_INFO'
  | 'GET_APP_VERSION'
  | 'LOG_EVENT'
  | 'SHOW_TOAST'
  | 'STORE_DATA'
  | 'GET_DATA'
  | 'CLEAR_DATA';



export interface WebViewBridgeMessage {
  id?: string;
  action: WebViewAction;
  payload?: Record<string, any>;
  type?: string;
  token?: any;
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  osVersion: string;
  deviceName: string;
  appVersion: string;
  buildNumber: string;
  hasInternet: boolean;
}

export interface WebViewInstance {
  injectJavaScript: (script: string) => void;
  reload: () => void;
  goBack: () => void;
  goForward: () => void;
}
