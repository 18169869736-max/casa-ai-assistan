import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="question-room" />
      <Stack.Screen name="question-goal" />
      <Stack.Screen name="question-feeling" />
      <Stack.Screen name="question-frustration" />
      <Stack.Screen name="analysis" />
      <Stack.Screen name="paywall" />
    </Stack>
  );
}
