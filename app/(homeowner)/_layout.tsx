import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function HomeownerLayout() {
  const { t } = useTranslation();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('nav.home') }} />
      <Tabs.Screen name="history" options={{ title: t('nav.history') }} />
    </Tabs>
  );
}
