import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useSettings, AppLanguage } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';

const LANGUAGES: { code: AppLanguage; label: string }[] = [
  { code: 'ml', label: 'മലയാളം' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
];

export default function WorkerSettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { currentLanguage, changeLanguage } = useSettings();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(t('settings.logout_confirm_title'), t('settings.logout_confirm_body'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.logout'),
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          await logout();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
      <View style={styles.languageRow}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.langButton, currentLanguage === lang.code && styles.langButtonActive]}
            onPress={() => changeLanguage(lang.code)}
          >
            <Text
              style={[styles.langText, currentLanguage === lang.code && styles.langTextActive]}
            >
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, loggingOut && styles.buttonDisabled]}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color="#FF3B30" />
        ) : (
          <Text style={styles.logoutText}>{t('common.logout')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 32 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#888', textTransform: 'uppercase', marginBottom: 12 },
  languageRow: { flexDirection: 'row', gap: 10, marginBottom: 40 },
  langButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  langButtonActive: { borderColor: '#007AFF', backgroundColor: '#e8f0ff' },
  langText: { fontSize: 15, color: '#555' },
  langTextActive: { color: '#007AFF', fontWeight: '600' },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
});
