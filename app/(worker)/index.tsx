import { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useWorkerProfile } from '../../hooks/useWorkerProfile';

export default function WorkerHomeScreen() {
  const { t } = useTranslation();
  const { profileState, loadProfile, setAvailableToday } = useWorkerProfile();
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const handleToggle = async (value: boolean) => {
    setToggling(true);
    await setAvailableToday(value);
    setToggling(false);
  };

  const availableToday = profileState.profile?.availableToday ?? false;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('worker.home.title')}</Text>

      {/* Available Today toggle */}
      <View style={styles.availableRow}>
        <Text style={styles.availableLabel}>{t('worker.home.available_today')}</Text>
        {toggling ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Switch
            value={availableToday}
            onValueChange={handleToggle}
            trackColor={{ false: '#ddd', true: '#34C759' }}
            thumbColor="#fff"
            disabled={profileState.loading}
          />
        )}
      </View>

      {/* Placeholder for job feed — full impl in INO-162 */}
      <Text style={styles.empty}>{t('worker.home.no_jobs')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 24 },
  availableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 24,
  },
  availableLabel: { fontSize: 16, color: '#1a1a1a', fontWeight: '500' },
  empty: { fontSize: 15, color: '#999', textAlign: 'center', marginTop: 48 },
});
