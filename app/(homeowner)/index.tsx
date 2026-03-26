import { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useJobs } from '../../hooks/useJobs';
import { JobDocument } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  open: '#FF9500',
  confirmed: '#34C759',
  completed: '#007AFF',
  expired: '#8E8E93',
};

function JobCard({ job, onPress }: { job: JobDocument; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardSkill}>{t(`skills.${job.skill}`)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[job.status] }]}>
          <Text style={styles.statusText}>{t(`job.status.${job.status}`)}</Text>
        </View>
      </View>
      {job.urgent && (
        <Text style={styles.urgentLabel}>{t('job.urgent')}</Text>
      )}
      <Text style={styles.cardLocation} numberOfLines={1}>{job.locationText}</Text>
      <Text style={styles.cardDuration}>{t(`homeowner.post_job.${job.duration}_day`)}</Text>
    </TouchableOpacity>
  );
}

export default function HomeownerHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { jobsState, loadMyJobs } = useJobs();

  useEffect(() => {
    loadMyJobs();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('homeowner.home.title')}</Text>
        <TouchableOpacity
          style={styles.postButton}
          onPress={() => router.push('/(homeowner)/post-job')}
        >
          <Text style={styles.postButtonText}>{t('homeowner.home.post_job')}</Text>
        </TouchableOpacity>
      </View>

      {jobsState.loading ? (
        <ActivityIndicator style={styles.loader} color="#007AFF" />
      ) : jobsState.jobs.length === 0 ? (
        <Text style={styles.empty}>{t('homeowner.home.no_jobs')}</Text>
      ) : (
        <FlatList
          data={jobsState.jobs}
          keyExtractor={(item) => item.jobId}
          renderItem={({ item }) =>
            <JobCard
              job={item}
              onPress={() => router.push({ pathname: '/(homeowner)/job-detail', params: { id: item.jobId } })}
            />
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  postButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  postButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardSkill: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  urgentLabel: { color: '#FF3B30', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  cardLocation: { fontSize: 14, color: '#555', marginBottom: 2 },
  cardDuration: { fontSize: 13, color: '#888' },
});
