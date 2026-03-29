import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { useJobs } from '../../hooks/useJobs';
import { collections } from '../../lib/firebase';
import { JobDocument, UserDocument } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  open: '#FF9500',
  confirmed: '#34C759',
  completed: '#007AFF',
  expired: '#8E8E93',
};

export default function JobDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getJob } = useJobs();
  const [job, setJob] = useState<JobDocument | null>(null);
  const [worker, setWorker] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getJob(id).then(async (data) => {
      setJob(data);
      if (data?.acceptedWorkerId) {
        const workerDoc = await collections.users().doc(data.acceptedWorkerId).get();
        if (workerDoc.exists) setWorker(workerDoc.data() as UserDocument);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t('common.error')}</Text>
      </View>
    );
  }

  const jobDate = job.date.toDate?.() ?? new Date();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.skill}>{t(`skills.${job.skill}`)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[job.status] }]}>
          <Text style={styles.statusText}>{t(`job.status.${job.status}`)}</Text>
        </View>
      </View>

      {job.urgent && <Text style={styles.urgentLabel}>{t('job.urgent')}</Text>}

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{t('homeowner.post_job.date_label')}</Text>
        <Text style={styles.detailValue}>
          {jobDate.toLocaleDateString('en-IN')}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{t('homeowner.post_job.duration_label')}</Text>
        <Text style={styles.detailValue}>
          {t(`homeowner.post_job.${job.duration}_day`)}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{t('homeowner.post_job.location_label')}</Text>
        <Text style={styles.detailValue}>{job.locationText}</Text>
      </View>

      {job.description ? (
        <View style={styles.descriptionBlock}>
          <Text style={styles.detailLabel}>{t('homeowner.post_job.description_label')}</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>
        </View>
      ) : null}

      {worker && (
        <View style={styles.workerBlock}>
          <View style={styles.workerRow}>
            <Text style={styles.workerName}>{worker.name}</Text>
            {worker.aadhaarVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>{t('worker.profile.verified')}</Text>
              </View>
            )}
          </View>
          {worker.phone ? (
            <Text style={styles.workerPhone}>{worker.phone}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skill: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  statusBadge: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  urgentLabel: { color: '#FF3B30', fontWeight: '600', fontSize: 13, marginBottom: 16 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  detailLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  descriptionBlock: { marginTop: 16 },
  descriptionText: { fontSize: 14, color: '#444', marginTop: 6, lineHeight: 20 },
  errorText: { fontSize: 16, color: '#666' },
  workerBlock: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
  },
  workerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  workerName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  verifiedBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  verifiedText: { color: '#2e7d32', fontSize: 12, fontWeight: '600' },
  workerPhone: { fontSize: 14, color: '#555' },
});
