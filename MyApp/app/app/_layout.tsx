import { Tabs, useSegments, router } from 'expo-router';
import { Colors } from '../../src/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity, Platform } from 'react-native';
import { SettingsIcon, ToolsIcon, CreateIcon, ProfileIcon } from '../../src/components/icons/TabIcons';
import { useTranslation } from 'react-i18next';
import { ProtectedRoute } from '../../src/components/auth/ProtectedRoute';

export default function TabLayout() {
  const { t } = useTranslation();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  // On web, we don't want safe area insets for the bottom
  const bottomInset = Platform.OS === 'web' ? 0 : insets.bottom;

  const getHeaderTitle = () => {
    return t('tabs.create');
  };

  const TabsContent = (
    <Tabs
      screenOptions={{
        headerShown: false, // AGGRESSIVE: Hide all headers globally
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          height: Platform.OS === 'web' ? 70 : 80 + bottomInset,
          paddingBottom: Platform.OS === 'web' ? 10 : bottomInset,
          paddingTop: 8,
          justifyContent: 'space-around',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
          marginBottom: Platform.OS === 'web' ? 0 : 4,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 8,
          paddingBottom: 0,
        },
        animation: 'none',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.tools'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <ToolsIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: t('tabs.create'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <CreateIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.collection'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );

  // Wrap with ProtectedRoute on web
  return Platform.OS === 'web' ? (
    <ProtectedRoute>{TabsContent}</ProtectedRoute>
  ) : (
    TabsContent
  );
}