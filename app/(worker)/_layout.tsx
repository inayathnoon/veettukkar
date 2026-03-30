import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

export default function WorkerLayout() {
  const { t } = useTranslation();
  const router = useRouter();
  const { authState } = useAuth();

  // Enforce onboarding gate
  useEffect(() => {
    if (authState.user && !authState.user.onboardingComplete) {
      router.replace('/(worker)/onboarding/skills-step');
    }
  }, [authState.user, router]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('nav.jobs') }} />
      <Tabs.Screen name="my-jobs" options={{ title: t('nav.my_jobs') }} />
      <Tabs.Screen name="profile" options={{ title: t('nav.profile') }} />
      <Tabs.Screen name="settings" options={{ title: t('nav.settings') }} />
    </Tabs>
  );
}
