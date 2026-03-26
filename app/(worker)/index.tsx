import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useWorkerProfile } from '../../hooks/useWorkerProfile';
import { useWorkerJobFeed } from '../../hooks/useWorkerJobFeed';
import { JobDocument } from '../../types';

function JobCard({
  job,
  onAccept,
  accepting,
}: {
  job: JobDocument;
  onAccept: () => void;
  accepting: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardSkill}>{t(`skills.${job.skill}`)}</Text>
        {job.urgent && <Text style={styles.urgentBadge}>{t('job.urgent')}</Text>}
      </View>
      <Text style={styles.cardLocation}>{job.locationText}</Text>
      <Text style={styles.cardDuration}>{t(`homeowner.post_job.${job.duration}_day`)}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.acceptButton, accepting && styles.buttonDisabled]}
          onPress={onAccept}
          disabled={accepting}
        >
          {accepting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.acceptButtonText}>{t('job.accept')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function WorkerHomeScreen() {
  const { t } = useTranslation();
  const { profileState, loadProfile, setAvailableToday } = useWorkerProfile();
  const { feedState, accepting, loadFeed, acceptJob } = useWorkerJobFeed();
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadProfile();
    loadFeed();
  }, []);

  const handleToggle = async (value: boolean) => {
    setToggling(true);
    await setAvailableToday(value);
    setToggling(false);
  };

  const handleAccept = async (jobId: string) => {
    const result = await acceptJob(jobId);
    if (!result.success) {
      Alert.alert(t('common.error'), result.error);
    }
  };

  const availableToday = profileState.profile?.availableToday ?? false;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>{t('worker.home.title')}</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{t('worker.home.available_today')}</Text>
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
      </View>

      {feedState.loading ? (
        <ActivityIndicator style={styles.loader} color="#007AFF" />
      ) : feedState.jobs.length === 0 ? (
        <Text style={styles.empty}>{t('worker.home.no_jobs')}</Text>
      ) : (
        <FlatList
          data={feedState.jobs}
          keyExtractor={(item) => item.jobId}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onAccept={() => handleAccept(item.jobId)}
              accepting={accepting === item.jobId}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { padding: 24, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  toggleLabel: { fontSize: 15, color: '#1a1a1a', fontWeight: '500' },
  loader: { marginTop: 48 },
  empty: { textAlign: 'center', color: '#999', fontSize: 15, marginTop: 48 },
  list: { padding: 16, gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardSkill: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  urgentBadge: {
    backgroundColor: '#FF3B30',
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cardLocation: { fontSize: 14, color: '#555', marginBottom: 2 },
  cardDuration: { fontSize: 13, color: '#888', marginBottom: 12 },
  cardActions: { flexDirection: 'row', gap: 10 },
  acceptButton: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  acceptButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
