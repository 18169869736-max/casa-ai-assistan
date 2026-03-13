import { Stack, usePathname, useSegments } from "expo-router";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store';
import { ErrorBoundary } from '../src/components';
import { useFonts, Gabarito_400Regular, Gabarito_500Medium, Gabarito_600SemiBold, Gabarito_700Bold } from '@expo-google-fonts/gabarito';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, TextInput, Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { REVENUECAT_CONFIG, ENTITLEMENT_ID } from '../src/config/revenueCat';
import { mixpanelAnalytics } from '../src/services/mixpanelAnalytics';
import '../src/i18n/config';

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Import global web styles to hide headers
if (Platform.OS === 'web') {
  require('../src/styles/global.web.css');
}

// Import AuthProvider for web only
let AuthProvider: any = null;
if (Platform.OS === 'web') {
  try {
    AuthProvider = require('../src/contexts/AuthContext.web').AuthProvider;
  } catch (error) {
    console.warn('AuthProvider not available:', error);
  }
}

// Dynamically import AppsFlyer to prevent initialization errors
let appsFlyer: any = null;
let APPSFLYER_CONFIG: any = null;

try {
  appsFlyer = require('react-native-appsflyer').default;
  APPSFLYER_CONFIG = require('../src/config/appsflyer').APPSFLYER_CONFIG;
} catch (error) {
  console.warn('AppsFlyer not available:', error);
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const pathname = usePathname();
  const segments = useSegments();

  let [fontsLoaded] = useFonts({
    Gabarito_400Regular,
    Gabarito_500Medium,
    Gabarito_600SemiBold,
    Gabarito_700Bold,
  });

  useEffect(() => {
    // Initialize AppsFlyer
    const initializeAppsFlyer = () => {
      if (!appsFlyer || !APPSFLYER_CONFIG) {
        console.log('AppsFlyer SDK not available, skipping initialization');
        return;
      }

      try {
        // Set up conversion data listener before SDK initialization
        appsFlyer.onInstallConversionData((res: any) => {
          const isFirstLaunch = res?.data?.is_first_launch;
          if (isFirstLaunch && JSON.parse(isFirstLaunch) === true) {
            if (res.data.af_status === 'Non-organic') {
              const media_source = res.data.media_source;
              const campaign = res.data.campaign;
              console.log('AppsFlyer: This is a non-organic install. Media source:', media_source, 'Campaign:', campaign);
            } else if (res.data.af_status === 'Organic') {
              console.log('AppsFlyer: This is an organic install.');
            }
          } else {
            console.log('AppsFlyer: This is not a first launch');
          }
        });

        // Set up deep link listener
        appsFlyer.onDeepLink((res: any) => {
          console.log('AppsFlyer deep link:', JSON.stringify(res));
        });

        // Initialize SDK
        appsFlyer.initSdk(
          {
            devKey: APPSFLYER_CONFIG.devKey,
            isDebug: APPSFLYER_CONFIG.isDebug,
            appId: Platform.OS === 'ios' ? '6738947037' : 'com.reelpop.interioriq',
            onInstallConversionDataListener: true,
            onDeepLinkListener: true,
            timeToWaitForATTUserAuthorization: APPSFLYER_CONFIG.timeToWaitForATTUserAuthorization,
          },
          (result: any) => {
            console.log('✅ AppsFlyer initialized successfully:', result);
          },
          (error: any) => {
            console.error('❌ AppsFlyer initialization error:', error);
          }
        );
      } catch (error) {
        console.error('❌ Failed to initialize AppsFlyer:', error);
      }
    };

    // Initialize RevenueCat and check subscription status
    const initializeRevenueCat = async () => {
      try {
        if (REVENUECAT_CONFIG.apiKey) {
          await Purchases.configure({ apiKey: REVENUECAT_CONFIG.apiKey });
          console.log('✅ RevenueCat initialized successfully');

          // Set up listener for customer info updates
          Purchases.addCustomerInfoUpdateListener((customerInfo) => {
            const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
            console.log('🔄 Subscription status updated:', isPro ? 'PREMIUM' : 'FREE');

            const { setPremiumStatus } = require('../src/store/slices/userSlice');
            store.dispatch(setPremiumStatus(isPro));
          });

          // Check subscription status immediately after initialization
          await checkSubscriptionStatus();
        }
      } catch (error) {
        console.error('❌ Failed to initialize RevenueCat:', error);
        console.log('💡 RevenueCat only works in development builds, not Expo Go. Subscription features will be limited.');
      }
    };

    // Check subscription status and update Redux store
    const checkSubscriptionStatus = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

        console.log('🔐 Subscription status checked:', isPro ? 'PREMIUM' : 'FREE');

        // Import setPremiumStatus dynamically to avoid circular dependency
        const { setPremiumStatus } = require('../src/store/slices/userSlice');
        store.dispatch(setPremiumStatus(isPro));
      } catch (error) {
        // Only log error if not in Expo Go (where RevenueCat doesn't work)
        if (!error.message?.includes('singleton instance')) {
          console.error('❌ Failed to check subscription status:', error);
        }
      }
    };

    // Initialize Mixpanel
    const initializeMixpanel = async () => {
      try {
        await mixpanelAnalytics.initialize();
        console.log('✅ Mixpanel initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Mixpanel:', error);
      }
    };

    // Initialize Meta Pixel
    const initializeMetaPixel = () => {
      if (Platform.OS === 'web') {
        try {
          const { initMetaPixel } = require('../src/services/metaPixel');
          initMetaPixel();
          console.log('✅ Meta Pixel initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize Meta Pixel:', error);
        }
      }
    };

    // Initialize Google Analytics
    const initializeGoogleAnalytics = () => {
      if (Platform.OS === 'web') {
        try {
          const { initGoogleAnalytics } = require('../src/services/googleAnalytics');
          initGoogleAnalytics();
          console.log('✅ Google Analytics initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize Google Analytics:', error);
        }
      }
    };

    // Initialize Pinterest Pixel
    const initializePinterestPixel = () => {
      if (Platform.OS === 'web') {
        try {
          const { initPinterestPixel } = require('../src/services/pinterestPixel');
          initPinterestPixel();
          console.log('✅ Pinterest Pixel initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize Pinterest Pixel:', error);
        }
      }
    };

    // Initialize TikTok Pixel
    const initializeTikTokPixel = () => {
      if (Platform.OS === 'web') {
        try {
          const { initTikTokPixel } = require('../src/services/tiktokPixel');
          initTikTokPixel();
          console.log('✅ TikTok Pixel initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize TikTok Pixel:', error);
        }
      }
    };

    initializeAppsFlyer();
    initializeRevenueCat();
    initializeMixpanel();
    initializeMetaPixel();
    initializeGoogleAnalytics();
    initializePinterestPixel();
    initializeTikTokPixel();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();

      // Set default font for all Text components after fonts are loaded
      const TextRender = Text.render;
      const initialDefaultProps = Text.defaultProps;
      Text.defaultProps = {
        ...initialDefaultProps,
        style: [{ fontFamily: 'Gabarito_400Regular' }, initialDefaultProps?.style],
      };
      Text.render = function render(props, ref) {
        return TextRender.call(this, {
          ...props,
          style: [{ fontFamily: 'Gabarito_400Regular' }, props.style],
        }, ref);
      };

      // Set default font for TextInput
      const TextInputRender = TextInput.render;
      const initialTextInputDefaultProps = TextInput.defaultProps;
      TextInput.defaultProps = {
        ...initialTextInputDefaultProps,
        style: [{ fontFamily: 'Gabarito_400Regular' }, initialTextInputDefaultProps?.style],
      };
      TextInput.render = function render(props, ref) {
        return TextInputRender.call(this, {
          ...props,
          style: [{ fontFamily: 'Gabarito_400Regular' }, props.style],
        }, ref);
      };
    }
  }, [fontsLoaded]);

  // Track pageviews on route changes (web only)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        // Track with Google Analytics
        const { trackPageView: trackPageViewGA } = require('../src/services/googleAnalytics');
        trackPageViewGA(undefined, pathname);

        // Track with Pinterest
        const { trackPageVisit } = require('../src/services/pinterestPixel');
        trackPageVisit(pathname);

        // Track with TikTok
        const { trackPageView: trackPageViewTikTok } = require('../src/services/tiktokPixel');
        trackPageViewTikTok();
      } catch (error) {
        console.error('❌ Failed to track pageview:', error);
      }
    }
  }, [pathname]);

  if (!fontsLoaded) {
    return null;
  }

  const AppContent = (
    <Stack
      screenOptions={{
        headerShown: false, // AGGRESSIVE: Hide all headers globally
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="app" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'none'
        }}
      />
      <Stack.Screen
        name="workflow"
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'none'
        }}
      />
      <Stack.Screen
        name="paywall"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom'
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
      <Stack.Screen
        name="admin"
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
      <Stack.Screen
        name="quiz"
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'fade'
        }}
      />
      <Stack.Screen
        name="auth"
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'fade'
        }}
      />
    </Stack>
  );

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ErrorBoundary>
          {Platform.OS === 'web' && AuthProvider ? (
            <AuthProvider>{AppContent}</AuthProvider>
          ) : (
            AppContent
          )}
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  );
}
