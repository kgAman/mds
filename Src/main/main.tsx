import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  BackHandler,
  ActivityIndicator,
  Linking,
} from 'react-native';
import WebView, {
  WebViewNavigation,
  WebView as WebViewType,
} from 'react-native-webview';

export default function Main() {
  const webViewRef = useRef<WebViewType>(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);

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
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

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
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size={Platform.OS === 'ios' ? 'large' : 48}
            color="#4CAF50"
          />
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: initialUrl }}
        userAgent={userAgent}
        style={styles.webView}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        mixedContentMode="always"

        /* 🔥 SCROLL SMOOTH FIXES */
        androidLayerType="software"
        nestedScrollEnabled
        overScrollMode="never"
        decelerationRate="normal"
        scrollEnabled

        keyboardDisplayRequiresUserAction={false}

        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}

        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
      />
    </View>
  );
}

// -----------------------------
// 🔹 Styles
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f7f2',
  },
  webView: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240,247,242,0.95)',
    zIndex: 10,
  },
});
