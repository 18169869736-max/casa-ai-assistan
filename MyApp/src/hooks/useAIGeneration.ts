import { useState, useCallback, useRef } from 'react';
import aiService, { GenerateDesignParams, GenerateDesignResult, UserSubscription } from '../services/aiService';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { incrementFreeGenerations, incrementWeeklyGenerations } from '../store/slices/userSlice';
import { RootState } from '../types';
import { isWeb } from '../utils/platform';

// Conditionally import web auth context
let useAuth: any = null;
if (isWeb) {
  try {
    useAuth = require('../contexts/AuthContext.web').useAuth;
  } catch (error) {
    console.warn('AuthContext.web not available:', error);
  }
}

interface UseAIGenerationState {
  isLoading: boolean;
  error: string | null;
  result: GenerateDesignResult | null;
  progress: number; // 0-100
  statusMessage: string;
}

interface UseAIGenerationReturn extends UseAIGenerationState {
  generateDesign: (params: GenerateDesignParams) => Promise<GenerateDesignResult | null>;
  regenerateDesign: (variation?: Partial<GenerateDesignParams>) => Promise<GenerateDesignResult | null>;
  clearError: () => void;
  clearResult: () => void;
  retry: () => Promise<GenerateDesignResult | null>;
  canGenerate: boolean;
  showPaywall: boolean;
  showPaywallModal: boolean;
  setShowPaywallModal: (show: boolean) => void;
  showFairUseModal: boolean;
  setShowFairUseModal: (show: boolean) => void;
  weeklyGenerationsUsed: number;
  weeklyGenerationLimit: number;
  daysUntilReset: number;
}

export function useAIGeneration(): UseAIGenerationReturn {
  const dispatch = useDispatch();
  const {
    freeGenerationsUsed,
    isPremium,
    secretBypassEnabled,
    weeklyGenerationsUsed,
    weeklyGenerationsResetDate
  } = useSelector((state: RootState) => state.user);

  // Get web subscription status if available
  let hasActiveSubscription = false;
  let subscriptionLoading = false;
  if (isWeb && useAuth) {
    try {
      const auth = useAuth();
      hasActiveSubscription = auth.hasActiveSubscription;
      subscriptionLoading = auth.subscriptionLoading;
    } catch (error) {
      console.warn('Failed to get auth context:', error);
    }
  }

  const [state, setState] = useState<UseAIGenerationState>({
    isLoading: false,
    error: null,
    result: null,
    progress: 0,
    statusMessage: '',
  });

  const [showFairUseModal, setShowFairUseModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const lastParamsRef = useRef<GenerateDesignParams | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Weekly limit constant
  const WEEKLY_GENERATION_LIMIT = 80;

  // Check if weekly limit needs to be reset
  const shouldResetWeeklyLimit = () => {
    const resetDate = new Date(weeklyGenerationsResetDate);
    const now = new Date();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    return now.getTime() - resetDate.getTime() >= oneWeekMs;
  };

  // Calculate days until reset
  const daysUntilReset = () => {
    const resetDate = new Date(weeklyGenerationsResetDate);
    const nextResetDate = new Date(resetDate.getTime() + (7 * 24 * 60 * 60 * 1000));
    return Math.ceil((nextResetDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
  };

  // Check if user can generate
  // Web users: require active subscription
  // Free users: 1 generation
  // Premium users: 80 per week (unless bypass enabled)
  const canGenerate = (isWeb ? hasActiveSubscription : true) && (
    secretBypassEnabled ||
    (!isPremium && freeGenerationsUsed < 1) ||
    (isPremium && (shouldResetWeeklyLimit() || weeklyGenerationsUsed < WEEKLY_GENERATION_LIMIT))
  );

  const showPaywall = !isWeb && !isPremium && !secretBypassEnabled && freeGenerationsUsed >= 1;

  // Simulate progress updates
  const updateProgress = useCallback((progress: number, message: string) => {
    setState(prev => ({
      ...prev,
      progress,
      statusMessage: message,
    }));
  }, []);

  const generateDesign = useCallback(async (params: GenerateDesignParams): Promise<GenerateDesignResult | null> => {
    // Check if user can generate
    if (!canGenerate) {
      // Web users without subscription
      if (isWeb && !hasActiveSubscription) {
        setState({
          isLoading: false,
          error: 'Active subscription required',
          result: null,
          progress: 0,
          statusMessage: '',
        });

        Alert.alert(
          'Subscription Required',
          'You need an active subscription to generate designs. Please subscribe to continue.',
          [{ text: 'OK', style: 'default' }]
        );

        return null;
      }

      // Mobile users
      if (!isWeb) {
        let errorMessage = '';
        let alertTitle = '';

        if (isPremium && weeklyGenerationsUsed >= WEEKLY_GENERATION_LIMIT) {
          // Premium user hit weekly limit - show fair use modal
          setShowFairUseModal(true);

          setState({
            isLoading: false,
            error: 'Weekly generation limit reached',
            result: null,
            progress: 0,
            statusMessage: '',
          });

          return null;
        } else {
          // Free user - show paywall modal instead of alert
          setShowPaywallModal(true);

          setState({
            isLoading: false,
            error: 'Free generation used',
            result: null,
            progress: 0,
            statusMessage: '',
          });

          return null;
        }
      }
    }

    // Store params for retry functionality
    lastParamsRef.current = params;

    // Reset state
    setState({
      isLoading: true,
      error: null,
      result: null,
      progress: 0,
      statusMessage: 'Initializing AI service...',
    });

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setState(prev => {
          if (prev.progress < 90) {
            const messages = [
              'Analyzing image...',
              'Understanding room structure...',
              'Applying design style...',
              'Generating color palette...',
              'Adding furniture and decor...',
              'Enhancing lighting...',
              'Finalizing design...',
            ];
            const messageIndex = Math.floor((prev.progress / 90) * messages.length);
            return {
              ...prev,
              progress: Math.min(prev.progress + 10, 90),
              statusMessage: messages[messageIndex] || 'Processing...',
            };
          }
          return prev;
        });
      }, 500);

      // Call the AI service
      const result = await aiService.generateDesign(params);

      // Clear the progress interval
      clearInterval(progressInterval);

      // Increment counters if bypass is not enabled (skip for web users)
      if (!isWeb && !secretBypassEnabled) {
        if (!isPremium) {
          // Free users: increment free generation counter
          dispatch(incrementFreeGenerations());
        } else {
          // Premium users: increment weekly counter
          dispatch(incrementWeeklyGenerations());
        }
      }

      // Update state with result
      setState({
        isLoading: false,
        error: null,
        result,
        progress: 100,
        statusMessage: 'Design generated successfully!',
      });

      return result;
    } catch (error: any) {
      console.error('Design generation failed:', error);
      
      const errorMessage = error?.message || 'Failed to generate design';
      
      setState({
        isLoading: false,
        error: errorMessage,
        result: null,
        progress: 0,
        statusMessage: '',
      });

      // Show user-friendly error alert
      Alert.alert(
        'Generation Failed',
        errorMessage,
        [
          { text: 'OK', style: 'default' }
        ]
      );

      return null;
    } finally {
      abortControllerRef.current = null;
    }
  }, [canGenerate, isPremium, secretBypassEnabled, dispatch, hasActiveSubscription, weeklyGenerationsUsed]);

  const regenerateDesign = useCallback(async (variation?: Partial<GenerateDesignParams>): Promise<GenerateDesignResult | null> => {
    if (!lastParamsRef.current) {
      setState(prev => ({
        ...prev,
        error: 'No previous design to regenerate',
      }));
      return null;
    }

    setState({
      isLoading: true,
      error: null,
      result: state.result, // Keep previous result while loading
      progress: 0,
      statusMessage: 'Regenerating design with variations...',
    });

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setState(prev => {
          if (prev.progress < 90) {
            return {
              ...prev,
              progress: Math.min(prev.progress + 15, 90),
              statusMessage: 'Creating new variation...',
            };
          }
          return prev;
        });
      }, 400);

      const result = await aiService.regenerateDesign(lastParamsRef.current, variation);

      clearInterval(progressInterval);

      setState({
        isLoading: false,
        error: null,
        result,
        progress: 100,
        statusMessage: 'New design variation created!',
      });

      return result;
    } catch (error: any) {
      console.error('Design regeneration failed:', error);
      
      const errorMessage = error?.message || 'Failed to regenerate design';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        progress: 0,
        statusMessage: '',
      }));

      Alert.alert(
        'Regeneration Failed',
        errorMessage,
        [
          { text: 'OK', style: 'default' }
        ]
      );

      return null;
    }
  }, [state.result]);

  const retry = useCallback(async (): Promise<GenerateDesignResult | null> => {
    if (!lastParamsRef.current) {
      setState(prev => ({
        ...prev,
        error: 'No previous request to retry',
      }));
      return null;
    }

    return generateDesign(lastParamsRef.current);
  }, [generateDesign]);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      result: null,
      progress: 0,
      statusMessage: '',
    }));
  }, []);

  // Cancel ongoing request if component unmounts
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    ...state,
    generateDesign,
    regenerateDesign,
    clearError,
    clearResult,
    retry,
    canGenerate,
    showPaywall,
    showPaywallModal,
    setShowPaywallModal,
    showFairUseModal,
    setShowFairUseModal,
    weeklyGenerationsUsed,
    weeklyGenerationLimit: WEEKLY_GENERATION_LIMIT,
    daysUntilReset: daysUntilReset(),
  };
}

// Hook for managing user subscription and credits
export function useSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usageStats, setUsageStats] = useState<any>(null);

  const checkSubscription = useCallback(async (): Promise<UserSubscription | null> => {
    setIsLoading(true);
    try {
      const sub = await aiService.checkSubscription();
      setSubscription(sub);
      return sub;
    } catch (error) {
      console.error('Subscription check failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUsageStats = useCallback(async () => {
    try {
      const stats = await aiService.getUsageStats();
      setUsageStats(stats);
      return stats;
    } catch (error) {
      console.error('Usage stats fetch failed:', error);
      return null;
    }
  }, []);

  const checkServiceHealth = useCallback(async (): Promise<boolean> => {
    try {
      return await aiService.healthCheck();
    } catch (error) {
      return false;
    }
  }, []);

  return {
    isLoading,
    subscription,
    usageStats,
    checkSubscription,
    getUsageStats,
    checkServiceHealth,
  };
}