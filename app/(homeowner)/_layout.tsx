import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

export default function HomeownerLayout() {
  const { t } = useTranslation();
  const router = useRouter();
  const { authState } = useAuth();

  // Enforce onboarding gate
  useEffect(() => {
    if (authState.user && !authState.user.onboardingComplete) {
      router.replace('/(homeowner)/onboarding/address-picker');
    }
  }, [authState.user, router]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('nav.home') }} />
      <Tabs.Screen name="history" options={{ title: t('nav.history') }} />
      <Tabs.Screen name="settings" options={{ title: t('nav.settings') }} />
    </Tabs>
  );
}
