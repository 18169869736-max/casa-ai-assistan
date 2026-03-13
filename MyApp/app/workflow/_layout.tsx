import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function WorkflowLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="photo-upload" options={{ headerShown: false }} />
      <Stack.Screen name="room-type" options={{ headerShown: false }} />
      <Stack.Screen name="style-selection" options={{ headerShown: false }} />
      <Stack.Screen name="color-palette" options={{ headerShown: false }} />
      <Stack.Screen name="results" options={{ headerShown: false }} />
    </Stack>
  );
}