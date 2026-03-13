import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { router } from 'expo-router';
import { QuizColors } from '../../src/constants/quizTheme.web';
import { quizQuestions, calculateProgress } from '../../src/constants/quizData.web';
import { saveQuizEmailCapture } from '../../src/services/quizService.web';

// Import web-only components conditionally
let StartScreen: any = null;
let TextQuestion: any = null;
let SingleChoiceQuestion: any = null;
let AcknowledgmentScreen: any = null;
let AnalysisScreen: any = null;
let ImageUploadScreen: any = null;
let EmailCaptureScreen: any = null;
let QuizHeader: any = null;
let QuizProgress: any = null;

if (Platform.OS === 'web') {
  StartScreen = require('../../src/components/quiz/steps/StartScreen.web').StartScreen;
  TextQuestion = require('../../src/components/quiz/steps/TextQuestion.web').TextQuestion;
  SingleChoiceQuestion = require('../../src/components/quiz/steps/SingleChoiceQuestion.web').SingleChoiceQuestion;
  AcknowledgmentScreen = require('../../src/components/quiz/steps/AcknowledgmentScreen.web').AcknowledgmentScreen;
  AnalysisScreen = require('../../src/components/quiz/steps/AnalysisScreen.web').AnalysisScreen;
  ImageUploadScreen = require('../../src/components/quiz/steps/ImageUploadScreen.web').ImageUploadScreen;
  EmailCaptureScreen = require('../../src/components/quiz/steps/EmailCaptureScreen.web').EmailCaptureScreen;
  QuizHeader = require('../../src/components/quiz/QuizHeader.web').QuizHeader;
  QuizProgress = require('../../src/components/quiz/QuizProgress.web').QuizProgress;
}

export default function QuizScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Only render on web
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.notWebContainer}>
        <Text style={styles.notWebText}>
          Quiz is only available on web
        </Text>
      </View>
    );
  }

  const handleNext = async (answer?: Record<string, any>) => {
    setDirection(1);

    const updatedAnswers = { ...answers, ...answer };
    setAnswers(updatedAnswers);

    // Check if we're on the email capture screen (last screen)
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (currentQuestion.type === 'email' && answer?.email) {
      // User just submitted their email - save everything now
      console.log('🎉 Quiz Complete! Collected Data:', updatedAnswers);

      if (Platform.OS === 'web') {
        await saveQuizData(updatedAnswers);

        // Track Lead event - user completed quiz and provided email
        try {
          const { trackLead } = require('../../src/services/metaPixel');
          const { trackLead: trackLeadAPI } = require('../../src/services/metaConversionAPI');

          trackLead(); // Client-side tracking
          await trackLeadAPI(answer.email); // Server-side tracking
          console.log('📧 Lead event tracked for email:', answer.email);
        } catch (trackingError) {
          console.error('❌ Failed to track Lead event:', trackingError);
          // Continue anyway - don't block user flow
        }

        // Store quiz answers in localStorage for landing page
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('quizAnswers', JSON.stringify(updatedAnswers));
          } catch (error) {
            console.warn('⚠️ Could not save to localStorage (may be blocked):', error);
            // Continue anyway - this is not critical
          }
        }
      }

      // Navigate to landing page with premium offer
      router.push('/quiz/landing');
      return;
    }

    // Move to next question if not at the end
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const saveQuizData = async (answers: Record<string, any>) => {
    try {
      console.log('💾 Saving quiz data to database...');
      const result = await saveQuizEmailCapture(answers);

      if (result.success) {
        console.log('✅ Quiz data saved successfully!');
        console.log('📧 Email:', answers.email);
        console.log('🆔 Submission ID:', result.data?.id);

        // Store in localStorage as backup
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('quizSubmissionId', result.data?.id || '');
            localStorage.setItem('quizEmail', answers.email || '');
          } catch (error) {
            console.warn('⚠️ Could not save to localStorage (may be blocked):', error);
            // Continue anyway - this is not critical
          }
        }
      } else {
        console.error('❌ Failed to save quiz data:', result.error);
        // Continue anyway - don't block user experience
      }
    } catch (error) {
      console.error('❌ Exception while saving quiz data:', error);
      // Continue anyway - don't block user experience
    }
  };

  const handleBack = () => {
    setDirection(-1);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderCurrentScreen = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];

    switch (currentQuestion.type) {
      case 'start':
        return StartScreen ? <StartScreen onContinue={() => handleNext()} /> : null;

      case 'text':
        return TextQuestion ? (
          <TextQuestion
            question={currentQuestion.question!}
            description={currentQuestion.description}
            placeholder={currentQuestion.placeholder}
            dataKey={currentQuestion.dataKey!}
            onNext={handleNext}
          />
        ) : null;

      case 'single-choice':
        return SingleChoiceQuestion ? (
          <SingleChoiceQuestion
            question={currentQuestion.question!}
            description={currentQuestion.description}
            options={currentQuestion.options!}
            dataKey={currentQuestion.dataKey!}
            onNext={handleNext}
          />
        ) : null;

      case 'acknowledgment':
        return AcknowledgmentScreen ? (
          <AcknowledgmentScreen
            userName={answers.name || 'there'}
            stylePreference={answers.stylePreference || 'unsure'}
            onContinue={() => handleNext()}
          />
        ) : null;

      case 'analysis':
        return AnalysisScreen ? (
          <AnalysisScreen
            onComplete={(popupAnswers) => {
              handleNext(popupAnswers);
            }}
          />
        ) : null;

      case 'image-upload':
        return ImageUploadScreen ? (
          <ImageUploadScreen
            userName={answers.name || ''}
            onNext={(imageData) => {
              handleNext(imageData);
            }}
            onSkip={() => {
              handleNext({});
            }}
          />
        ) : null;

      case 'email':
        return EmailCaptureScreen ? (
          <EmailCaptureScreen
            userName={answers.name || ''}
            onSubmit={(email, consent) => {
              handleNext({ email, emailConsent: consent });
            }}
          />
        ) : null;

      default:
        return StartScreen ? <StartScreen onContinue={handleNext} /> : null;
    }
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const showBackButton = currentQuestionIndex > 0;
  const showProgress = currentQuestion.showProgress;
  const progress = calculateProgress(currentQuestionIndex);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <style>
          {`
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
            #root {
              min-height: 100vh;
            }
          `}
        </style>
      )}
      <View style={styles.gradient}>
        <View style={styles.contentWrapper}>
          {/* Header */}
          {QuizHeader && (
            <QuizHeader
              onBack={handleBack}
              showBackButton={showBackButton}
            />
          )}

          {/* Progress Bar */}
          {showProgress && QuizProgress && (
            <QuizProgress progress={progress} />
          )}

          {/* Current Screen */}
          {renderCurrentScreen()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: QuizColors.backgroundStart,
  },
  gradient: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      background: `linear-gradient(180deg, ${QuizColors.backgroundStart} 0%, ${QuizColors.backgroundEnd} 100%)`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }),
  },
  contentWrapper: {
    width: '100%',
    flex: 1,
    ...(Platform.OS === 'web' && {
      maxWidth: 600,
      margin: '0 auto',
    }),
  },
  notWebContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  notWebText: {
    color: '#ffffff',
    fontSize: 18,
  },
});
