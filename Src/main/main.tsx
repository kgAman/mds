<<<<<<< HEAD
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
=======
import React, { useEffect, useRef, useState } from 'react';
>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903
import {
  View,
  StyleSheet,
  Platform,
  BackHandler,
<<<<<<< HEAD
  Animated,
  Text,
  Linking,
  ActivityIndicator
=======
  ActivityIndicator,
  Linking,
>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903
} from 'react-native';
import WebView, {
  WebViewNavigation,
  WebView as WebViewType,
<<<<<<< HEAD
  WebViewMessageEvent,
} from 'react-native-webview';
import { requestUserPermission } from '../Config/notificationServices';
import { WebViewBridge } from '../lib/webViewBridge';
import { WebViewBridgeMessage } from '../types';


// =====================================================
// 🔹 MAIN COMPONENT
// =====================================================
=======
} from 'react-native-webview';

>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903
export default function Main() {
  const webViewRef = useRef<WebViewType>(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
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
=======

  const baseDomain = 'mydreamshot.com';
  const initialUrl = `https://${baseDomain}/login`;

  const userAgent = Platform.select({
    ios: 'IosMydreamshot/1.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X; in-app; Mydreamshot)',
    android:
      'AndroidMydreamshot/1.0 (Android; Android 10; in_app; Mydreamshot)',
  });

  // -----------------------------
  // 🔹 Android Back Button
  // -----------------------------
  useEffect(() => {
    const onBackPress = () => {
      if (webViewRef.current && canGoBack) {
>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

<<<<<<< HEAD
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
=======
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  // -----------------------------
  // 🔹 Allow only mydreamshot.com
  // -----------------------------
  const handleShouldStartLoadWithRequest = (req: { url: string }) => {
    const url = req.url;

    if (url.includes(baseDomain)) return true;

    Linking.openURL(url).catch(err =>
      console.error('External link error:', err)
    );
    return false;
  };

  // -----------------------------
  // 🔹 Inject smooth scrolling CSS
  // -----------------------------
  const injectedJavaScript = `
    (function () {
      try {
        var style = document.createElement('style');
        style.innerHTML = \`
          html, body {
            -webkit-overflow-scrolling: touch !important;
            scroll-behavior: smooth;
          }
        \`;
        document.head.appendChild(style);

        var meta = document.querySelector('meta[name=viewport]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = 'viewport';
          document.head.appendChild(meta);
        }
        meta.content =
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';
      } catch (e) {}
      true;
    })();
  `;

  // -----------------------------
  // 🔹 WebView Events
  // -----------------------------
  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  };

  const handleLoadStart = () => setLoading(true);
  const handleLoadEnd = () => setLoading(false);

  // -----------------------------
  // 🔹 UI
  // -----------------------------
  return (
    <View style={styles.container}>
      {loading && (
>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size={Platform.OS === 'ios' ? 'large' : 48}
            color="#4CAF50"
          />
        </View>
      )}

<<<<<<< HEAD
      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: initialUrl }}
        onMessage={handleMessage}
=======
      <WebView
        ref={webViewRef}
        source={{ uri: initialUrl }}
        userAgent={userAgent}
>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903
        style={styles.webView}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
<<<<<<< HEAD

=======
        mixedContentMode="always"
>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903

        /* 🔥 SCROLL SMOOTH FIXES */
        androidLayerType="software"
        nestedScrollEnabled
        overScrollMode="never"
<<<<<<< HEAD

=======
        decelerationRate="normal"
>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903
        scrollEnabled

        keyboardDisplayRequiresUserAction={false}

<<<<<<< HEAD
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
=======
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}

        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903
      />
    </View>
  );
}

<<<<<<< HEAD
// =====================================================
// 🔹 STYLES
// =====================================================
const styles = StyleSheet.create({
    container: {
    flex: 1,
    // backgroundColor: '#f0f7f2',
=======
// -----------------------------
// 🔹 Styles
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f7f2',
>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903
  },
  webView: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
<<<<<<< HEAD
    // backgroundColor: 'rgba(240,247,242,0.95)',
=======
    backgroundColor: 'rgba(240,247,242,0.95)',
>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903
    zIndex: 10,
  },
});
