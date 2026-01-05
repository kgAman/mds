import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  BackHandler,
  Animated,
  Text,
  Linking,
  ActivityIndicator
} from 'react-native';
import WebView, {
  WebViewNavigation,
  WebView as WebViewType,
  WebViewMessageEvent,
} from 'react-native-webview';
import { requestUserPermission } from '../Config/notificationServices';
import { WebViewBridge } from '../lib/webViewBridge';
import { WebViewBridgeMessage } from '../types';


// =====================================================
// 🔹 MAIN COMPONENT
// =====================================================
export default function Main() {
  const webViewRef = useRef<WebViewType>(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const baseDomain = 'mydreamshot.com';
  const initialUrl = `https://${baseDomain}/login`;
  

  // =====================================================
  // 🔹 IMPORTANT: FORCE MESSAGE TEST (GUARANTEED)
  // =====================================================
  const injectedJavaScriptBeforeContentLoaded = `
    (function () {
      function send(data) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
      }

      // 🔥 FORCE TEST MESSAGE
      send({
        type: "TEST",
        msg: "WebView connected successfully"
      });

      // Helper for website usage
      window.sendToRN = function(data) {
        send(data);
      };

      true;
    })();
  `;

  // =====================================================
  // 🔹 MESSAGE HANDLER (FIXED)
  // =====================================================
  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    console.log('📩 RAW DATA:', event.nativeEvent.data);

    let message: WebViewBridgeMessage ;

    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch (e) {
      console.log('❌ Invalid JSON:', event.nativeEvent.data);
      return;
    }

    const getToken = await AsyncStorage.getItem("auth_token")
   
    // Handle token
    if (message.type === "TOKEN" && (!getToken || getToken != message.token) ) {
      await AsyncStorage.setItem("auth_token", message.token);
        requestUserPermission()
    } 
  
    

    console.log("message:", message);

    // 🔹 BRIDGE RESPONSE
    WebViewBridge.handleBridgeMessage(message, (success, data) => {
      if (!webViewRef.current || !message?.id) return;

      const js = `
        (function () {
          if (window.nativeResponseCallbacks &&
              window.nativeResponseCallbacks['${message.id}']) {
            window.nativeResponseCallbacks['${message.id}'](
              ${JSON.stringify(success)},
              ${JSON.stringify(data)}
            );
            delete window.nativeResponseCallbacks['${message.id}'];
          }
        })();
        true;
      `;

      webViewRef.current.injectJavaScript(js);
    });
  }, []);

  // =====================================================
  // 🔹 BACK HANDLER
  // =====================================================
  useEffect(() => {
    const onBack = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [canGoBack]);

  // =====================================================
  // 🔹 LOADER FADE
  // =====================================================
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: loading ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [loading]);

  // =====================================================
  // 🔹 URL CONTROL
  // =====================================================
  const onShouldStartLoadWithRequest = (req: { url: string }) => {
    if (req.url.includes(baseDomain)) return true;
    Linking.openURL(req.url);
    return false;
  };

  // =====================================================
  // 🔹 UI
  // =====================================================
  return (
    <View style={styles.container}>
          {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size={Platform.OS === 'ios' ? 'large' : 48}
            color="#4CAF50"
          />
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: initialUrl }}
        onMessage={handleMessage}
        style={styles.webView}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled


        /* 🔥 SCROLL SMOOTH FIXES */
        androidLayerType="software"
        nestedScrollEnabled
        overScrollMode="never"

        scrollEnabled

        keyboardDisplayRequiresUserAction={false}

        injectedJavaScriptBeforeContentLoaded={
          injectedJavaScriptBeforeContentLoaded
        }

        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}

        mixedContentMode="always"
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
      />
    </View>
  );
}

// =====================================================
// 🔹 STYLES
// =====================================================
const styles = StyleSheet.create({
    container: {
    flex: 1,
    // backgroundColor: '#f0f7f2',
  },
  webView: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(240,247,242,0.95)',
    zIndex: 10,
  },
});
