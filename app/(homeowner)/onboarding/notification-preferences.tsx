import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';

export default function NotificationPreferencesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { updateUserDoc } = useAuth();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  const handleContinue = async () => {
    await updateUserDoc({
      notificationPreferences: {
        pushEnabled,
        whatsappEnabled,
      },
      onboardingComplete: true,
    });

    router.push('/(homeowner)/index');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('onboarding.notification_preferences')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.how_to_notify_you')}</Text>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceTextContainer}>
          <Text style={styles.preferenceTitle}>{t('onboarding.push_notifications')}</Text>
          <Text style={styles.preferenceSubtitle}>
            {t('onboarding.instant_updates_in_app')}
          </Text>
        </View>
        <Switch
          value={pushEnabled}
          onValueChange={setPushEnabled}
          trackColor={{ false: '#d1d5db', true: '#a3d5ff' }}
          thumbColor={pushEnabled ? '#3b82f6' : '#f3f4f6'}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceTextContainer}>
          <Text style={styles.preferenceTitle}>{t('onboarding.whatsapp_messages')}</Text>
          <Text style={styles.preferenceSubtitle}>
            {t('onboarding.backup_if_no_push')}
          </Text>
        </View>
        <Switch
          value={whatsappEnabled}
          onValueChange={setWhatsappEnabled}
          trackColor={{ false: '#d1d5db', true: '#a3d5ff' }}
          thumbColor={whatsappEnabled ? '#3b82f6' : '#f3f4f6'}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>{t('onboarding.complete_setup')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  preferenceTextContainer: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  preferenceSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
