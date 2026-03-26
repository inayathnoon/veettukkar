import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function WorkerLayout() {
  const { t } = useTranslation();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('nav.jobs') }} />
      <Tabs.Screen name="my-jobs" options={{ title: t('nav.my_jobs') }} />
      <Tabs.Screen name="profile" options={{ title: t('nav.profile') }} />
    </Tabs>
  );
}
