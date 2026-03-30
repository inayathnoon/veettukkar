import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useWorkerBrowse } from '../../../hooks/useWorkerBrowse';
import { useJobs } from '../../../hooks/useJobs';
import { UserDocument, JobDuration } from '../../../types';

export default function WorkerDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { workerId } = useLocalSearchParams<{ workerId: string }>();
  const { getWorkerDetail } = useWorkerBrowse();
  const { postJob, posting } = useJobs();

  const [worker, setWorker] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDuration, setSelectedDuration] = useState<JobDuration>('full');
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    if (!workerId) return;
    loadWorkerDetail();
  }, [workerId]);

  const loadWorkerDetail = async () => {
    setLoading(true);
    const data = await getWorkerDetail(workerId!);
    setWorker(data);
    setLoading(false);
  };

  const handleDatePicked = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleRequestWorker = async () => {
    if (!worker) return;

    try {
      const result = await postJob({
        skill: worker.skills?.[0] || 'construction',
        date: selectedDate,
        duration: selectedDuration,
        locationText: worker.location?.area || 'N/A',
        locationLat: worker.location?.lat || 0,
        locationLng: worker.location?.lng || 0,
        description: `${t('homeowner.browse.request_worker')} ${worker.name}`,
        urgent: false,
        workerPreferredId: worker.uid,
      });

      if (result.success) {
        Alert.alert(
          t('common.success') || 'Success',
          t('homeowner.browse.request_sent') || 'Request sent to worker'
        );
        router.replace('/(homeowner)/');
      } else {
        Alert.alert(t('common.error'), result.error);
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    }
    setShowRequestModal(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator style={styles.loader} color="#007AFF" size="large" />
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('common.error')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {worker.photoURL ? (
        <Image source={{ uri: worker.photoURL }} style={styles.largePhoto} />
      ) : (
        <View style={[styles.largePhoto, styles.photoPlaceholder]}>
          <Text style={styles.photoPlaceholderText}>📷</Text>
        </View>
      )}

      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{worker.name}</Text>
          {worker.aadhaarVerified && (
            <View style={styles.verifiedBadgeBox}>
              <Text style={styles.verifiedBadgeText}>✓ {t('worker.profile.verified')}</Text>
            </View>
          )}
        </View>

        {worker.reportedAsUnreliable && (
          <Text style={styles.warningText}>
            ⚠️ {t('homeowner.browse.reliability_warning')}
          </Text>
        )}

        {worker.skills && worker.skills.length > 0 && (
          <View style={styles.skillsSection}>
            <Text style={styles.sectionLabel}>{t('worker.profile.skills_label')}</Text>
            <View style={styles.skillsList}>
              {worker.skills.map((skill) => (
                <View key={skill} style={styles.skillBadge}>
                  <Text style={styles.skillBadgeText}>{t(`skills.${skill}`)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.rateSection}>
          <Text style={styles.sectionLabel}>{t('homeowner.browse.rates')}</Text>
          <View style={styles.ratesRow}>
            {worker.dayRate && (
              <View style={styles.rateBox}>
                <Text style={styles.rateValue}>₹{worker.dayRate}</Text>
                <Text style={styles.rateLabel}>{t('homeowner.browse.day_rate')}</Text>
              </View>
            )}
            {worker.halfDayRate && (
              <View style={styles.rateBox}>
                <Text style={styles.rateValue}>₹{worker.halfDayRate}</Text>
                <Text style={styles.rateLabel}>{t('homeowner.browse.half_day_rate')}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.sectionLabel}>{t('homeowner.browse.rating')}</Text>
          <Text style={styles.ratingText}>
            {worker.ratingAvg ? worker.ratingAvg.toFixed(1) : 'N/A'} ⭐ ({worker.ratingCount || 0} {t('homeowner.browse.jobs')})
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.requestButton, posting && styles.requestButtonDisabled]}
        onPress={() => setShowRequestModal(true)}
        disabled={posting}
      >
        <Text style={styles.requestButtonText}>
          {posting ? t('common.loading') : t('homeowner.browse.request_worker')}
        </Text>
      </TouchableOpacity>

      <Modal visible={showRequestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('homeowner.browse.select_date')}</Text>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {selectedDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDatePicked}
              />
            )}

            <View style={styles.durationSection}>
              <Text style={styles.durationLabel}>{t('homeowner.post_job.duration_label')}</Text>
              <View style={styles.durationButtons}>
                <TouchableOpacity
                  style={[
                    styles.durationButton,
                    selectedDuration === 'half' && styles.durationButtonActive,
                  ]}
                  onPress={() => setSelectedDuration('half')}
                >
                  <Text
                    style={[
                      styles.durationButtonText,
                      selectedDuration === 'half' && styles.durationButtonTextActive,
                    ]}
                  >
                    {t('homeowner.post_job.half_day')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.durationButton,
                    selectedDuration === 'full' && styles.durationButtonActive,
                  ]}
                  onPress={() => setSelectedDuration('full')}
                >
                  <Text
                    style={[
                      styles.durationButtonText,
                      selectedDuration === 'full' && styles.durationButtonTextActive,
                    ]}
                  >
                    {t('homeowner.post_job.full_day')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleRequestWorker}
              disabled={posting}
            >
              <Text style={styles.confirmButtonText}>
                {posting ? t('common.loading') : t('homeowner.browse.confirm_request')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowRequestModal(false)}
              disabled={posting}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 100 },
  loader: { marginTop: 48 },
  errorText: { textAlign: 'center', color: '#FF3B30', fontSize: 15, marginTop: 48 },
  largePhoto: {
    width: '100%',
    height: 300,
    backgroundColor: '#e5e5e5',
  },
  photoPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  photoPlaceholderText: { fontSize: 60 },
  infoSection: { padding: 24 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  verifiedBadgeBox: {
    marginLeft: 12,
    backgroundColor: '#34C759',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  warningText: { fontSize: 13, color: '#FF3B30', fontWeight: '600', marginBottom: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 },
  skillsSection: { marginBottom: 20 },
  skillsList: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  skillBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  rateSection: { marginBottom: 20 },
  ratesRow: { flexDirection: 'row', gap: 16 },
  rateBox: { flex: 1, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8 },
  rateValue: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  rateLabel: { fontSize: 11, color: '#666', marginTop: 4 },
  ratingSection: { marginBottom: 20 },
  ratingText: { fontSize: 16, fontWeight: '600', color: '#FF9500' },
  requestButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  requestButtonDisabled: { opacity: 0.6 },
  requestButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingTop: 32,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#1a1a1a' },
  dateButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
  dateButtonText: { fontSize: 16, fontWeight: '600', color: '#007AFF', textAlign: 'center' },
  durationSection: { marginBottom: 20 },
  durationLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 },
  durationButtons: { flexDirection: 'row', gap: 12 },
  durationButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  durationButtonActive: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
  durationButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  durationButtonTextActive: { color: '#007AFF' },
  confirmButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#666', fontSize: 16, fontWeight: '600' },
});
