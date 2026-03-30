import { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useWorkerJobFeed } from '../../hooks/useWorkerJobFeed';
import { JobDocument } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  open: '#FF9500',
  confirmed: '#34C759',
  completed: '#007AFF',
  expired: '#8E8E93',
};

function MyJobCard({ job }: { job: JobDocument }) {
  const { t } = useTranslation();
  const router = useRouter();
  const jobDate = job.date.toDate?.() ?? new Date();
  
  const handleRateHomeowner = () => {
    router.push({
      pathname: '/(worker)/rate-homeowner',
      params: { jobId: job.jobId, homeownerUid: job.homeownerId },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardSkill}>{t(`skills.${job.skill}`)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[job.status] }]}>
          <Text style={styles.statusText}>{t(`job.status.${job.status}`)}</Text>
        </View>
      </View>
      <Text style={styles.cardDate}>{jobDate.toLocaleDateString('en-IN')}</Text>
      <Text style={styles.cardLocation}>{job.locationText}</Text>
      
      {job.status === 'completed' && (
        <TouchableOpacity style={styles.rateButton} onPress={handleRateHomeowner}>
          <Text style={styles.rateButtonText}>{t('rating.rate_homeowner')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function WorkerMyJobsScreen() {
  const { t } = useTranslation();
  const { feedState, loadMyJobs } = useWorkerJobFeed();

  useEffect(() => {
    loadMyJobs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('nav.my_jobs')}</Text>

      {feedState.loading ? (
        <ActivityIndicator style={styles.loader} color="#007AFF" />
      ) : feedState.jobs.length === 0 ? (
        <Text style={styles.empty}>{t('worker.home.no_jobs')}</Text>
      ) : (
        <FlatList
          data={feedState.jobs}
          keyExtractor={(item) => item.jobId}
          renderItem={({ item }) => <MyJobCard job={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', padding: 24, paddingBottom: 12 },
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
  cardDate: { fontSize: 13, color: '#888', marginBottom: 2 },
  cardLocation: { fontSize: 14, color: '#555' },
  rateButton: {
    marginTop: 12,
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rateButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
