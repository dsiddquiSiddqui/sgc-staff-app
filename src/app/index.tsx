import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  BackHandler,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { WebView } from 'react-native-webview'
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes'

const STAFF_PORTAL_URL = 'https://digital-id-tau.vercel.app/staff-login'
const ALLOWED_HOST = 'digital-id-tau.vercel.app'

export default function HomeScreen() {
  const webViewRef = useRef<WebView>(null)

  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack()
        return true
      }
      return false
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)
    return () => subscription.remove()
  }, [canGoBack])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 10000)

    return () => clearTimeout(timeout)
  }, [reloadKey])

  const handleRetry = () => {
    setHasError(false)
    setLoading(true)
    setReloadKey((prev) => prev + 1)
  }

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SGC Staff Portal</Text>
      </View>

      <View style={styles.content}>
        <WebView
          key={reloadKey}
          ref={webViewRef}
          source={{ uri: STAFF_PORTAL_URL }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          cacheEnabled={true}
          setSupportMultipleWindows={false}
          onLoadStart={() => {
            setLoading(true)
            setHasError(false)
          }}
          onLoadProgress={({ nativeEvent }) => {
            if (nativeEvent.progress >= 0.9) {
              setLoading(false)
            }
          }}
          onLoadEnd={() => {
            setLoading(false)
          }}
          onError={() => {
            setLoading(false)
            setHasError(true)
          }}
          onHttpError={() => {
            setLoading(false)
            setHasError(true)
          }}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={(request) => {
            try {
              if (
                request.url.startsWith('about:blank') ||
                request.url.startsWith('data:') ||
                request.url.startsWith('blob:')
              ) {
                return true
              }

              const url = new URL(request.url)
              return url.host === ALLOWED_HOST
            } catch {
              return true
            }
          }}
        />

        {loading && !hasError && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" />
            <Text style={styles.loaderText}>Loading portal...</Text>
          </View>
        )}

        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Unable to load portal</Text>
            <Text style={styles.errorText}>
              Please check your internet connection and try again.
            </Text>

            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#374151',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
})