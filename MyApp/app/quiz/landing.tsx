import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Animated,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { QuizColors } from '../../src/constants/quizTheme.web';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Text style={styles.timerText}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </Text>
  );
};

// Live Banner Component
const LiveBanner = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const messages = [
    '👀 12 people are viewing this offer right now',
    '✨ Sarah from Austin just unlocked her design',
    '🔥 89% of spots claimed for today',
    '💫 Michael transformed his living room yesterday',
    '🎨 Emma got her dream bedroom design 2 hours ago',
    '⚡ High demand! Limited AI design slots today',
  ];

  useEffect(() => {
    const showBanner = () => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setMessage(randomMessage);
      setVisible(true);

      // Slide in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }).start();

      // Hold for 4 seconds
      setTimeout(() => {
        // Slide out
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }).start(() => setVisible(false));
      }, 4000);
    };

    // First banner after 5 seconds
    const firstTimer = setTimeout(showBanner, 5000);

    // Subsequent banners every 12-18 seconds
    const interval = setInterval(() => {
      showBanner();
    }, Math.random() * 6000 + 12000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.liveBanner,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.liveBannerText}>{message}</Text>
    </Animated.View>
  );
};

// FAQ Item Component
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={QuizColors.primaryAccent}
        />
      </View>
      {expanded && (
        <Text style={styles.faqAnswer}>{answer}</Text>
      )}
    </TouchableOpacity>
  );
};

// Stripe Payment Form Component
const StripePaymentForm = ({ onSuccess, onError, initialEmail }: { onSuccess: (email: string) => void; onError: (error: string) => void; initialEmail?: string }) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const cardElementRef = useRef<any>(null);

  // Update email when initialEmail prop changes
  useEffect(() => {
    if (initialEmail && initialEmail !== email) {
      console.log('📧 Pre-filling email field with:', initialEmail);
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Load Stripe.js dynamically
    const loadStripeSDK = () => {
      // Check if already loaded
      // @ts-ignore
      if (window.Stripe) {
        setIsStripeLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => {
        console.log('Stripe SDK loaded successfully');
        setIsStripeLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Stripe SDK');
        setErrorMessage('Failed to load payment system. Please refresh the page.');
      };

      document.head.appendChild(script);
    };

    loadStripeSDK();
  }, []);

  useEffect(() => {
    if (!isStripeLoaded || Platform.OS !== 'web') return;

    const initializeStripe = async () => {
      try {
        // @ts-ignore - Stripe is loaded from CDN
        if (!window.Stripe) {
          console.error('Stripe.js not available');
          setErrorMessage('Payment system not ready. Please refresh the page.');
          return;
        }

        const publishableKey = Constants.expoConfig?.extra?.stripePublishableKey ||
                               process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
          console.error('Stripe Publishable Key not found');
          setErrorMessage('Payment configuration error. Please contact support.');
          return;
        }

        console.log('Initializing Stripe with publishable key');

        // @ts-ignore
        const stripeInstance = window.Stripe(publishableKey);
        setStripe(stripeInstance);

        // Create elements instance
        const elementsInstance = stripeInstance.elements();
        setElements(elementsInstance);

        // Create and mount card element
        const cardElement = elementsInstance.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            },
            invalid: {
              color: '#ef4444',
              iconColor: '#ef4444',
            },
          },
          hidePostalCode: false,
        });

        cardElement.mount('#card-element');
        cardElementRef.current = cardElement;
        console.log('Card element mounted successfully');

      } catch (error) {
        console.error('Error initializing Stripe:', error);
        setErrorMessage('Failed to load payment form. Please refresh the page.');
      }
    };

    initializeStripe();

    return () => {
      if (cardElementRef.current) {
        try {
          cardElementRef.current.destroy();
        } catch (e) {
          console.error('Error destroying card element:', e);
        }
      }
    };
  }, [isStripeLoaded]);

  const handlePayment = async () => {
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!stripe || !cardElementRef.current) {
      setErrorMessage('Payment form not ready. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Track InitiateCheckout event
    try {
      const checkoutValue = 1.99;
      const { trackInitiateCheckout } = require('../../src/services/metaPixel');
      const { trackInitiateCheckout: trackInitiateCheckoutAPI } = require('../../src/services/metaConversionAPI');

      trackInitiateCheckout(checkoutValue, 'USD');
      trackInitiateCheckoutAPI(email, checkoutValue, 'USD');
      console.log('🛒 InitiateCheckout event tracked');
    } catch (trackingError) {
      console.error('Failed to track InitiateCheckout:', trackingError);
    }

    try {
      // Create payment method
      console.log('Creating payment method...');
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElementRef.current,
        billing_details: {
          email: email,
        },
      });

      if (error) {
        console.error('Stripe payment method error:', error);
        setErrorMessage(error.message || 'Payment failed. Please check your card details.');
        onError(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      console.log('Payment method created successfully:', paymentMethod.id);

      // Send payment method to backend to create subscription
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          email: email,
        }),
      });

      console.log('API response status:', response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API returned non-JSON response:', text);
        throw new Error('Server error: Invalid response format. Please try again.');
      }

      const data = await response.json();
      console.log('API response data:', data);

      if (response.ok && data.success) {
        // Handle 3D Secure if required
        if (data.clientSecret) {
          console.log('Confirming payment with 3D Secure...');
          const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);

          if (confirmError) {
            console.error('3D Secure confirmation error:', confirmError);
            setErrorMessage(confirmError.message || 'Payment confirmation failed.');
            onError(confirmError.message || 'Payment failed');
            setIsProcessing(false);
            return;
          }
        }

        // Save email to localStorage for future use
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          try {
            console.log('Saving to localStorage:', {
              email,
              subscriptionId: data.subscription?.stripe_subscription_id,
            });
            localStorage.setItem('userEmail', email);
            if (data.subscription?.stripe_subscription_id) {
              localStorage.setItem('subscriptionId', data.subscription.stripe_subscription_id);
            }
            // Verify it was saved
            const savedEmail = localStorage.getItem('userEmail');
            const savedSubId = localStorage.getItem('subscriptionId');
            console.log('Verified localStorage:', {
              savedEmail,
              savedSubId,
            });
          } catch (e) {
            console.error('Could not save to localStorage:', e);
            // Try to continue anyway - user can still use the app
          }
        } else {
          console.warn('localStorage not available');
        }

        // Track Purchase event with Meta Pixel, Conversion API, and Google Analytics
        try {
          const purchaseValue = 1.99; // $1.99 trial price
          const currency = 'USD';

          // Generate unique event ID for deduplication between Pixel and Conversion API
          const eventId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          console.log('🔑 Generated event ID for deduplication:', eventId);

          // Client-side tracking (Meta Pixel)
          if (typeof window !== 'undefined') {
            const { trackPurchase } = require('../../src/services/metaPixel');
            trackPurchase(purchaseValue, currency, eventId);
          }

          // Client-side tracking (Google Analytics)
          if (typeof window !== 'undefined') {
            const { trackPurchase: trackPurchaseGA } = require('../../src/services/googleAnalytics');
            trackPurchaseGA(eventId, purchaseValue, currency);
          }

          // Client-side tracking (Pinterest)
          if (typeof window !== 'undefined') {
            const { trackCheckout } = require('../../src/services/pinterestPixel');
            trackCheckout(purchaseValue, currency, 1, eventId);
          }

          // Server-side tracking (Pinterest Conversions API)
          const { trackCheckout: trackCheckoutPinterestAPI } = require('../../src/services/pinterestConversionAPI');
          await trackCheckoutPinterestAPI(purchaseValue, currency, email, 1, eventId);

          // Client-side tracking (TikTok)
          if (typeof window !== 'undefined') {
            const { trackCompletePayment } = require('../../src/services/tiktokPixel');
            trackCompletePayment(purchaseValue, currency, 'product', eventId, 'Trial Subscription');
          }

          // Server-side tracking (TikTok Events API)
          const { trackCompletePayment: trackCompletePaymentTikTokAPI } = require('../../src/services/tiktokEventsAPI');
          await trackCompletePaymentTikTokAPI(purchaseValue, currency, email, 'product', eventId, 'Trial Subscription', eventId);

          // Server-side tracking (Meta Conversion API)
          const { trackPurchase: trackPurchaseAPI } = require('../../src/services/metaConversionAPI');
          await trackPurchaseAPI(purchaseValue, email, currency, eventId);

          console.log('✅ Purchase event tracked via Meta Pixel, Google Analytics, Pinterest (client + server), TikTok (client + server), and Meta Conversion API with event ID:', eventId);
        } catch (trackingError) {
          console.error('❌ Failed to track purchase event:', trackingError);
          // Don't fail the payment flow if tracking fails
        }

        onSuccess(email);
      } else {
        const errorMsg = data.message || 'Payment failed. Please try again.';
        setErrorMessage(errorMsg);
        onError(errorMsg);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      let errorMsg = 'An error occurred. Please try again.';

      if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
      onError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <Text style={styles.errorText}>
        Payment is only available on web
      </Text>
    );
  }

  return (
    <View>
      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.emailInput}
          placeholder="your@email.com"
          placeholderTextColor={QuizColors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!isProcessing}
        />
      </View>

      {/* Card Input (Stripe Elements) */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Card Information</Text>
        <div
          id="card-element"
          style={{
            minHeight: '40px',
            borderRadius: '8px',
            border: `1px solid #e5e7eb`,
            padding: '16px',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box',
            width: '100%',
            maxWidth: '100%',
          }}
        />
      </View>

      {/* Loading indicator while Stripe loads */}
      {!isStripeLoaded && Platform.OS === 'web' && (
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <ActivityIndicator color={QuizColors.primaryAccent} />
          <Text style={{ marginTop: 8, color: QuizColors.textSecondary, fontSize: 14 }}>
            Loading payment form...
          </Text>
        </View>
      )}

      {/* Error Message */}
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#ef4444" />
          <Text style={styles.errorMessageText}>{errorMessage}</Text>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.checkoutButton, isProcessing && styles.checkoutButtonDisabled]}
        onPress={handlePayment}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.checkoutButtonText}>Get Started Now</Text>
        )}
      </TouchableOpacity>

      {/* Payment Icons for Trust */}
      <View style={styles.paymentIconsContainer}>
        <Image
          source={require('../../assets/images/payment_icons.webp')}
          style={styles.paymentIcons}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default function LandingPage() {
  const [spotsLeft, setSpotsLeft] = useState(7);
  const [userRoomImage, setUserRoomImage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  const paymentSectionRef = useRef<View>(null);

  // Get uploaded room image and email from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Track ViewContent event when landing page loads
      try {
        const { trackViewContent } = require('../../src/services/metaPixel');
        trackViewContent('Premium Offer Landing Page', 'Conversion');
        console.log('👁️ ViewContent event tracked for landing page');
      } catch (trackingError) {
        console.error('❌ Failed to track ViewContent event:', trackingError);
      }

      try {
        const quizAnswers = localStorage.getItem('quizAnswers');
        const quizEmail = localStorage.getItem('quizEmail');

        console.log('📧 Checking for stored email...');
        console.log('quizAnswers:', quizAnswers);
        console.log('quizEmail:', quizEmail);

        if (quizAnswers) {
          try {
            const answers = JSON.parse(quizAnswers);
            console.log('Parsed quiz answers:', answers);

            if (answers.roomImageUrl) {
              setUserRoomImage(answers.roomImageUrl);
            }
            if (answers.email) {
              console.log('✅ Found email in quizAnswers:', answers.email);
              setUserEmail(answers.email);
            }
          } catch (error) {
            console.error('Error parsing quiz answers:', error);
          }
        }

        // Fallback to quizEmail if not found in quizAnswers
        if (!userEmail && quizEmail) {
          console.log('✅ Using email from quizEmail:', quizEmail);
          setUserEmail(quizEmail);
        }
      } catch (error) {
        console.warn('⚠️ Could not access localStorage (may be blocked):', error);
        // Continue with default fallback image
      }
    }
  }, []);

  // Decrease spots over time
  useEffect(() => {
    const spotTimers = [
      setTimeout(() => setSpotsLeft(6), 18000),
      setTimeout(() => setSpotsLeft(5), 36000),
      setTimeout(() => setSpotsLeft(4), 54000),
      setTimeout(() => setSpotsLeft(3), 72000),
      setTimeout(() => setSpotsLeft(2), 90000),
    ];

    return () => spotTimers.forEach(clearTimeout);
  }, []);

  const scrollToPayment = () => {
    if (Platform.OS === 'web') {
      setTimeout(() => {
        const paymentElement = document.getElementById('payment-section');
        if (paymentElement) {
          paymentElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 50);
    } else if (paymentSectionRef.current && scrollViewRef.current) {
      paymentSectionRef.current.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
        },
        () => {}
      );
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Landing page is only available on web</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <>
          <head>
            <meta
              httpEquiv="Content-Security-Policy"
              content="default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; frame-src * 'self' https://js.stripe.com https://hooks.stripe.com; connect-src * 'self'; img-src * 'self' data: blob:; style-src * 'self' 'unsafe-inline';"
            />
          </head>
          <style>
            {`
              body {
                margin: 0;
                padding: 0;
                overflow-x: hidden;
              }
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
              }
              .image-wrapper-left {
                transform: rotate(-8deg);
              }
              .image-wrapper-right {
                transform: rotate(8deg);
              }
              .images-container {
                gap: 12px;
                padding-left: 8px;
                padding-right: 8px;
              }
              @media (min-width: 768px) {
                .image-wrapper-left,
                .image-wrapper-right {
                  width: 250px !important;
                  height: 312px !important;
                }
                .images-container {
                  gap: 16px;
                  padding-left: 16px;
                  padding-right: 16px;
                }
              }
              #stats-content {
                flex-direction: column !important;
              }
              #stats-image-wrapper {
                margin-top: 12px;
              }
              @media (min-width: 768px) {
                #stats-content {
                  flex-direction: row !important;
                }
                #stats-image-wrapper {
                  margin-top: 0;
                }
              }

              /* Square Card Element Styles */
              #card-container {
                display: block;
                width: 100%;
              }
              #card-container iframe {
                display: block;
                width: 100%;
                border: none;
              }

              /* Transform Section Grid - Responsive */
              .transform-image-wrapper {
                width: calc(50% - 8px) !important;
                max-width: calc(50% - 8px) !important;
                flex: 0 0 calc(50% - 8px);
                box-sizing: border-box;
                overflow: hidden;
              }
              .transform-image-wrapper > div {
                width: 100% !important;
                max-width: 100% !important;
              }
              @media (max-width: 639px) {
                .transform-image-wrapper {
                  width: 100% !important;
                  max-width: 100% !important;
                  flex: 0 0 100%;
                }
              }
            `}
          </style>
        </>
      )}

      {/* Live Banner */}
      <LiveBanner />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>
            Spacio<Text style={styles.logoAccent}>AI</Text>
          </Text>
        </View>

        {/* Sticky Sales Header */}
        <View style={styles.stickyHeader}>
          <View style={styles.stickyHeaderContent}>
            <View style={styles.stickyLeft}>
              <View style={styles.stickyTextRow}>
                <Text style={styles.stickyText}>
                  Your <Text style={styles.bold}>Premium</Text> offer:{' '}
                  <Text style={styles.bold}>$1.99!</Text> Ends in{' '}
                </Text>
                <CountdownTimer />
              </View>
            </View>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={scrollToPayment}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              The <Text style={styles.accent}>Dream Home</Text> You've Been
              Imagining... Here's What It Can Look Like
            </Text>
            <Text style={styles.heroSubtitle}>
              Your Personalized AI Design Reveals How To Transform Every Room
            </Text>
          </View>

          {/* Before/After Images */}
          <View style={styles.imagesSection}>
            {/* Arrow */}
            <Image
              source={require('../../assets/images/arrow2.png')}
              style={styles.arrowImage}
              resizeMode="contain"
            />

            <View style={styles.imagesContainer}>
              {/* Left Image - User Upload or Fallback */}
              <View style={styles.imageWrapperLeft}>
                <Image
                  source={userRoomImage ? { uri: userRoomImage } : require('../../assets/images/s1.png')}
                  style={styles.tiltedImage}
                  resizeMode="cover"
                />
              </View>
              {/* Right Image - qq.png */}
              <View style={styles.imageWrapperRight}>
                <Image
                  source={require('../../assets/images/qq.png')}
                  style={styles.tiltedImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={scrollToPayment}
          >
            <Text style={styles.primaryCTAText}>Get My Design Now</Text>
          </TouchableOpacity>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>
              What You'll Discover Inside{' '}
              <Text style={styles.accent}>SpacioAI:</Text>
            </Text>

            {[
              {
                title: 'See Your Space Transformed Before You Buy',
                description:
                  'AI-generated designs showing exactly how your rooms will look with new furniture, colors, and layouts',
              },
              {
                title: 'Know Exactly What Style Suits You',
                description:
                  'Personalized style recommendations based on your preferences, lifestyle, and space constraints',
              },
              {
                title: 'Get Design Guidance On-Demand',
                description:
                  'Unlimited access to AI design assistant for instant advice on furniture placement, color schemes, and décor choices',
              },
              {
                title: 'And So Much More!',
                description:
                  'Room-by-room analysis, budget planning, shopping lists, style mood boards, and everything you need to create your dream home with confidence',
              },
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={28}
                  color={QuizColors.primaryAccent}
                />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Social Proof - Statistics */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>
              <Text style={styles.accent}>12,847</Text> people like you have
              transformed their homes
            </Text>

<View style={[styles.statsContent, Platform.OS === 'web' && { display: 'flex' }]} nativeID="stats-content">
              <View style={styles.statsListContainer}>
                {[
                  {
                    percentage: '94%',
                    text: 'of users say their final design exceeded their expectations',
                  },
                  {
                    percentage: '87%',
                    text: 'completed their room transformation within 3 months',
                  },
                  {
                    percentage: '71%',
                    text: 'were unsure where to start—just like you might be',
                  },
                ].map((stat, index) => (
                  <View key={index} style={styles.statItem}>
                    <Text style={styles.statPercentage}>{stat.percentage}</Text>
                    <Text style={styles.statText}>{stat.text}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.statsImageWrapper} nativeID="stats-image-wrapper">
                <Image
                  source={require('../../assets/images/1111.png')}
                  style={styles.statsImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Urgency - Almost Sold Out */}
          <View style={styles.urgencyBox}>
            <View style={styles.urgencyHeader}>
              <Ionicons name="time" size={24} color={QuizColors.primaryAccent} />
              <Text style={styles.urgencyTitle}>ALMOST SOLD OUT!</Text>
            </View>
            <Text style={styles.urgencyText}>
              Only <Text style={styles.spotNumber}>{spotsLeft} spots</Text> remaining
              today.
            </Text>
            <Text style={styles.urgencySubtext}>
              Our AI design slots are limited to ensure quality and personalized
              attention for each user.
            </Text>
          </View>

          {/* Payment Section */}
          <View
            ref={paymentSectionRef}
            style={styles.paymentSection}
            nativeID="payment-section"
            dataSet={{ paymentSection: 'true' }}
          >
            {/* Pricing Display */}
            <View style={styles.pricingBox}>
              <Text style={styles.paymentTitle}>
                Get Your <Text style={styles.accent}>Premium Design Access</Text> Today
              </Text>
              <Text style={styles.paymentDescription}>
                Transform every room in your home with unlimited AI-powered design
                recommendations. Your 3-day trial is just $1.99. Cancel anytime.
              </Text>

              <View style={styles.couponBadge}>
                <Text style={styles.couponText}>
                  🎉 Coupon Code: DESIGN75 applied!
                </Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Total due today:</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>$29.00</Text>
                  <Text style={styles.finalPrice}>$1.99</Text>
                </View>
              </View>

              {/* Stripe Payment Form */}
              <StripePaymentForm
                initialEmail={userEmail}
                onSuccess={async (email: string) => {
                  console.log('✅ Payment successful! Email:', email);

                  // Automatically sign the user in after payment
                  if (Platform.OS === 'web' && email) {
                    try {
                      console.log('🔐 Step 1: Calling /api/auth/create-session');
                      const response = await fetch('/api/auth/create-session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                      });

                      console.log('📡 Step 2: Response status:', response.status);

                      if (response.ok) {
                        const data = await response.json();
                        console.log('📦 Step 3: Response data:', data);

                        if (data.success && data.data?.actionLink) {
                          localStorage.setItem('justCompletedPayment', 'true');
                          console.log('🚀 Step 4: Redirecting to magic link for authentication');

                          // Use window.location.replace for a cleaner redirect
                          window.location.replace(data.data.actionLink);
                          return;
                        } else {
                          console.error('❌ No action link in response');
                          console.error('data.success:', data.success);
                          console.error('data.data:', data.data);
                          alert('Payment successful, but authentication failed. Please sign in manually at the login page.');
                          router.push('/auth/login');
                          return;
                        }
                      } else {
                        const errorText = await response.text();
                        console.error('❌ Create-session failed');
                        console.error('Status:', response.status);
                        console.error('Error:', errorText);
                        alert('Payment successful, but authentication setup failed. Please sign in manually at the login page.');
                        router.push('/auth/login');
                        return;
                      }
                    } catch (error) {
                      console.error('❌ Auto-login error:', error);
                      alert('Payment successful, but we encountered an error during sign-in. Please sign in manually at the login page.');
                      router.push('/auth/login');
                      return;
                    }
                  }

                  // For non-web platforms, navigate to app
                  console.log('➡️ Mobile platform: Navigating to /app');
                  router.push('/app');
                }}
                onError={(error) => {
                  console.error('Payment error:', error);
                }}
              />

              <Text style={styles.finePrint}>
                By continuing, you agree to our{' '}
                <Text
                  style={styles.finePrintLink}
                  onPress={() => Linking.openURL('https://spacioai.co/terms-of-service')}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text
                  style={styles.finePrintLink}
                  onPress={() => Linking.openURL('https://spacioai.co/privacy-policy')}
                >
                  Privacy Policy
                </Text>
                . You'll be charged $1.99 immediately, then $29.00/month after 3 days. Cancel anytime.
              </Text>
            </View>
          </View>

          {/* Price Increase Warning */}
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={24} color={QuizColors.primaryAccent} />
            <Text style={styles.warningText}>
              Price increases to $29 in <CountdownTimer />
            </Text>
          </View>

          {/* Transform Every Part Section */}
          <View style={styles.transformSection}>
            <Text style={styles.transformHeadline}>Transform every part of your home</Text>
            <View style={styles.transformGrid}>
              <View
                style={styles.transformImageWrapper}
                {...(Platform.OS === 'web' && { className: 'transform-image-wrapper' })}
              >
                <Image
                  source={require('../../assets/images/t1.webp')}
                  style={styles.transformImage}
                  resizeMode="contain"
                />
              </View>
              <View
                style={styles.transformImageWrapper}
                {...(Platform.OS === 'web' && { className: 'transform-image-wrapper' })}
              >
                <Image
                  source={require('../../assets/images/t2.webp')}
                  style={styles.transformImage}
                  resizeMode="contain"
                />
              </View>
              <View
                style={styles.transformImageWrapper}
                {...(Platform.OS === 'web' && { className: 'transform-image-wrapper' })}
              >
                <Image
                  source={require('../../assets/images/t3.webp')}
                  style={styles.transformImage}
                  resizeMode="contain"
                />
              </View>
              <View
                style={styles.transformImageWrapper}
                {...(Platform.OS === 'web' && { className: 'transform-image-wrapper' })}
              >
                <Image
                  source={require('../../assets/images/t4.webp')}
                  style={styles.transformImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Comparison Table */}
          <View style={styles.comparisonSection}>
            <View style={styles.comparisonColumn}>
              <Text style={styles.comparisonTitle}>Without SpacioAI</Text>
              {[
                'Endless Pinterest scrolling with no clear direction',
                "Buying wrong furniture that doesn't fit your space",
                'Feeling overwhelmed by design choices',
                'Wasting money on decorating mistakes',
                'Confusion about colors and styles',
                'Rooms that never feel quite right',
              ].map((item, index) => (
                <View key={index} style={styles.comparisonItem}>
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                  <Text style={styles.comparisonText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.comparisonColumn, styles.comparisonHighlight]}>
              <Text style={styles.comparisonTitleHighlight}>With SpacioAI</Text>
              {[
                'Know exactly what works for your space',
                'Visualize furniture before you buy',
                'Clear guidance on your design journey',
                'Confidence in your decorating decisions',
                'Instant clarity on what suits your style',
                'Rooms that feel perfect and personalized',
              ].map((item, index) => (
                <View key={index} style={styles.comparisonItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={QuizColors.primaryAccent}
                  />
                  <Text style={styles.comparisonText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Customer Reviews */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>What Our Customers Are Saying</Text>

            {[
              {
                name: 'Sarah M., 34, Boston',
                review:
                  "I had no idea where to start with my living room. SpacioAI showed me exactly what furniture would work with my awkward layout. The AI suggested a sectional I never would have considered - it's perfect and made room for a reading nook I've always wanted.",
              },
              {
                name: 'Michael T., 41, Denver',
                review:
                  'The app said my bedroom needed warmer tones and a platform bed instead of my old frame. I was skeptical, but followed the recommendations. My wife cried when she saw it finished - it looks like something from a magazine. Best $1.99 I ever spent.',
              },
              {
                name: 'Rachel D., 28, Austin',
                review:
                  "As a renter, I thought I couldn't do much. SpacioAI showed me how to transform my apartment with removable wallpaper, strategic lighting, and furniture placement. Landlord was so impressed they offered to buy it from me!",
              },
            ].map((review, index) => (
              <View key={index} style={styles.reviewItem}>
                <View style={styles.starsRow}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={16}
                      color={QuizColors.primaryAccent}
                    />
                  ))}
                </View>
                <Text style={styles.reviewText}>"{review.review}"</Text>
                <Text style={styles.reviewName}>- {review.name}</Text>
              </View>
            ))}
          </View>

          {/* FAQ Section */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

            <FaqItem
              question="How accurate are the AI design recommendations?"
              answer="Our AI designs are created using advanced algorithms trained on thousands of professional interior designs. While personal taste varies, 94% of our users report that the final result exceeded their expectations when following our recommendations."
            />

            <FaqItem
              question="What if I'm not satisfied with the designs?"
              answer="This almost never happens, but if you are unsatisfied, please reach out to us within your 3-day trial. Our team will work with you to refine the designs and ensure you get the guidance you're seeking."
            />

            <FaqItem
              question="How long does it take to see my designs?"
              answer="Designs are generated instantly! Simply upload photos of your space, answer a few style questions, and our AI will create personalized designs within seconds. You can generate unlimited variations and room designs."
            />
          </View>

          {/* Final CTA */}
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={scrollToPayment}
          >
            <Text style={styles.primaryCTAText}>Get Your Design Now</Text>
          </TouchableOpacity>

          {/* Trust Badges */}
          <View style={styles.trustSection}>
            <View style={styles.trustBadge}>
              <Ionicons name="lock-closed" size={32} color={QuizColors.primaryAccent} />
              <Text style={styles.trustTitle}>Your Data is Secure</Text>
              <Text style={styles.trustText}>
                We never sell or share your personal information. Your privacy is our
                priority.
              </Text>
            </View>

            <View style={styles.trustBadge}>
              <Ionicons name="card" size={32} color={QuizColors.primaryAccent} />
              <Text style={styles.trustTitle}>Secure Checkout</Text>
              <Text style={styles.trustText}>
                All information is encrypted and securely transmitted using SSL
                protocol.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 SpacioAI. All rights reserved.
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => Linking.openURL('https://spacioai.co/terms-of-service')}>
                <Text style={styles.footerLink}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.footerSeparator}>•</Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://spacioai.co/privacy-policy')}>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: QuizColors.backgroundStart,
  },
  scrollView: {
    flex: 1,
  },
  errorText: {
    color: QuizColors.textPrimary,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },

  // Live Banner
  liveBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: QuizColors.primaryAccent,
    padding: 12,
    zIndex: 1000,
    alignItems: 'center',
  },
  liveBannerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Header
  header: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: QuizColors.textPrimary,
    fontFamily: Platform.OS === 'web' ? 'Gabarito_700Bold' : undefined,
  },
  logoAccent: {
    color: QuizColors.primaryAccent,
  },

  // Sticky Header
  stickyHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: QuizColors.cardBorder,
    minHeight: 52,
    marginTop: -8,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
    }),
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    gap: 8,
  },
  stickyLeft: {
    flex: 1,
    alignItems: 'flex-start',
    minWidth: 0,
  },
  stickyTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  stickyText: {
    fontSize: 13,
    color: QuizColors.textSecondary,
    lineHeight: 18,
  },
  bold: {
    fontWeight: 'bold',
    color: QuizColors.primaryAccent,
  },
  timerText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: QuizColors.primaryAccent,
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: QuizColors.buttonStart,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexShrink: 0,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Content
  content: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    padding: 24,
    width: '100%',
  },

  // Hero Section
  heroSection: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: QuizColors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 40,
    fontFamily: Platform.OS === 'web' ? 'Gabarito_700Bold' : undefined,
  },
  accent: {
    color: QuizColors.primaryAccent,
  },
  heroSubtitle: {
    fontSize: 18,
    color: QuizColors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },

  // Images Section
  imagesSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  arrowImage: {
    width: 130,
    height: 78,
    marginBottom: 0,
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  imageWrapperLeft: {
    width: 170,
    height: 212,
    ...(Platform.OS === 'web' && {
      transform: 'rotate(-8deg)',
    }),
  },
  imageWrapperRight: {
    width: 170,
    height: 212,
    ...(Platform.OS === 'web' && {
      transform: 'rotate(8deg)',
    }),
  },
  tiltedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
    }),
  },

  // Primary CTA
  primaryCTA: {
    backgroundColor: QuizColors.buttonStart,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 32,
    ...(Platform.OS === 'web' && {
      background: `linear-gradient(to right, ${QuizColors.buttonStart}, ${QuizColors.buttonEnd})`,
      cursor: 'pointer',
      animation: 'pulse 2s ease-in-out infinite',
    }),
  },
  primaryCTAText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Features Section
  featuresSection: {
    backgroundColor: QuizColors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: QuizColors.cardBorder,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: QuizColors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'Gabarito_700Bold' : undefined,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featureText: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: QuizColors.textPrimary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: QuizColors.textSecondary,
    lineHeight: 20,
  },

  // Stats Section
  statsSection: {
    backgroundColor: QuizColors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: QuizColors.cardBorder,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: QuizColors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 24,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  statsListContainer: {
    flex: 1,
  },
  statsImageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsImage: {
    width: 300,
    height: 300,
    flexShrink: 0,
  },
  statItem: {
    marginBottom: 16,
  },
  statPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: QuizColors.primaryAccent,
    marginBottom: 4,
  },
  statText: {
    fontSize: 14,
    color: QuizColors.textSecondary,
  },

  // Urgency Box
  urgencyBox: {
    backgroundColor: QuizColors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: QuizColors.primaryAccent,
  },
  urgencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  urgencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: QuizColors.primaryAccent,
    marginLeft: 8,
  },
  urgencyText: {
    fontSize: 16,
    color: QuizColors.textPrimary,
    marginBottom: 8,
  },
  spotNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: QuizColors.primaryAccent,
  },
  urgencySubtext: {
    fontSize: 14,
    color: QuizColors.textSecondary,
    lineHeight: 20,
  },

  // Payment Section
  paymentSection: {
    marginBottom: 32,
  },
  paymentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: QuizColors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'Gabarito_700Bold' : undefined,
  },
  paymentDescription: {
    fontSize: 16,
    color: QuizColors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  pricingBox: {
    backgroundColor: QuizColors.cardBackground,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: QuizColors.cardBorder,
  },
  couponBadge: {
    backgroundColor: QuizColors.selectedBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  couponText: {
    fontSize: 14,
    fontWeight: '600',
    color: QuizColors.primaryAccent,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  originalPrice: {
    fontSize: 18,
    color: QuizColors.textMuted,
    textDecorationLine: 'line-through',
  },
  finalPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: QuizColors.primaryAccent,
  },
  priceLabel: {
    fontSize: 18,
    color: QuizColors.textPrimary,
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: QuizColors.buttonStart,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 16,
    ...(Platform.OS === 'web' && {
      background: `linear-gradient(to right, ${QuizColors.buttonStart}, ${QuizColors.buttonEnd})`,
      cursor: 'pointer',
    }),
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  finePrint: {
    fontSize: 12,
    color: QuizColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  finePrintLink: {
    color: QuizColors.primaryAccent,
    textDecorationLine: 'underline',
    fontWeight: '600',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: QuizColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: QuizColors.primaryAccent,
    gap: 12,
  },
  warningText: {
    fontSize: 16,
    color: QuizColors.textPrimary,
    fontWeight: '600',
  },

  // Transform Section
  transformSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    }),
  },
  transformHeadline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: QuizColors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  transformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  transformImageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    ...(Platform.OS === 'web' && {
      width: 'calc(50% - 8px)',
      minWidth: 'calc(50% - 8px)',
    }),
  },
  transformImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },

  // Comparison Section
  comparisonSection: {
    marginBottom: 32,
    gap: 16,
  },
  comparisonColumn: {
    backgroundColor: QuizColors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: QuizColors.cardBorder,
  },
  comparisonHighlight: {
    borderWidth: 2,
    borderColor: QuizColors.primaryAccent,
    backgroundColor: QuizColors.selectedBackground,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: QuizColors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonTitleHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: QuizColors.primaryAccent,
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  comparisonText: {
    flex: 1,
    fontSize: 14,
    color: QuizColors.textSecondary,
    lineHeight: 20,
  },

  // Reviews Section
  reviewsSection: {
    marginBottom: 32,
  },
  reviewItem: {
    backgroundColor: QuizColors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: QuizColors.cardBorder,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 4,
  },
  reviewText: {
    fontSize: 14,
    color: QuizColors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  reviewName: {
    fontSize: 14,
    color: QuizColors.textPrimary,
    fontWeight: '600',
  },

  // FAQ Section
  faqSection: {
    marginBottom: 32,
  },
  faqItem: {
    backgroundColor: QuizColors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: QuizColors.cardBorder,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: QuizColors.textPrimary,
    paddingRight: 16,
  },
  faqAnswer: {
    fontSize: 14,
    color: QuizColors.textSecondary,
    lineHeight: 22,
    marginTop: 12,
  },

  // Trust Section
  trustSection: {
    marginBottom: 32,
    flexDirection: 'row',
    gap: 16,
  },
  trustBadge: {
    flex: 1,
    backgroundColor: QuizColors.cardBackground,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: QuizColors.cardBorder,
  },
  trustTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: QuizColors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  trustText: {
    fontSize: 14,
    color: QuizColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Footer
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: QuizColors.textMuted,
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    fontSize: 12,
    color: QuizColors.primaryAccent,
    textDecorationLine: 'underline',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  footerSeparator: {
    fontSize: 12,
    color: QuizColors.textMuted,
  },

  // Payment Form Styles
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: QuizColors.textPrimary,
    marginBottom: 8,
  },
  emailInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: QuizColors.cardBorder,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: QuizColors.textPrimary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorMessageText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    lineHeight: 20,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  paymentIconsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  paymentIcons: {
    width: 280,
    height: 40,
    opacity: 0.8,
  },
});
