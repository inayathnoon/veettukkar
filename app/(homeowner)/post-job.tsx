import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useJobs } from '../../hooks/useJobs';
import { WorkerSkill, JobDuration } from '../../types';

const ALL_SKILLS: WorkerSkill[] = [
  'coconut_tree_climber',
  'painter',
  'cleaner',
  'construction',
  'plumber',
  'electrician',
];

// Ernakulam district centre as default (lat/lng required for geohash)
const DEFAULT_LAT = 9.9312;
const DEFAULT_LNG = 76.2673;

export default function PostJobScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { posting, postJob } = useJobs();

  const [skill, setSkill] = useState<WorkerSkill | null>(null);
  const [dateText, setDateText] = useState('');
  const [duration, setDuration] = useState<JobDuration>('full');
  const [locationText, setLocationText] = useState('');
  const [description, setDescription] = useState('');
  const [urgent, setUrgent] = useState(false);

  const parseDateFromText = (text: string): Date | null => {
    // Accept DD/MM/YYYY
    const parts = text.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const date = new Date(y, m, d);
      if (!isNaN(date.getTime())) return date;
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!skill) {
      Alert.alert('', t('homeowner.post_job.skill_label') + ' required');
      return;
    }
    const date = parseDateFromText(dateText);
    if (!date) {
      Alert.alert('', 'Enter date as DD/MM/YYYY');
      return;
    }
    if (!locationText.trim()) {
      Alert.alert('', t('homeowner.post_job.location_label') + ' required');
      return;
    }

    const result = await postJob({
      skill,
      date,
      duration,
      locationText: locationText.trim(),
      locationLat: DEFAULT_LAT,
      locationLng: DEFAULT_LNG,
      description: description.trim(),
      urgent,
    });

    if (result.success) {
      router.back();
    } else {
      Alert.alert(t('common.error'), result.error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t('homeowner.post_job.title')}</Text>

      {/* Skill category */}
      <Text style={styles.label}>{t('homeowner.post_job.skill_label')}</Text>
      <View style={styles.skillsGrid}>
        {ALL_SKILLS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.skillChip, skill === s && styles.skillChipSelected]}
            onPress={() => setSkill(s)}
            disabled={posting}
          >
            <Text style={[styles.skillChipText, skill === s && styles.skillChipTextSelected]}>
              {t(`skills.${s}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date */}
      <Text style={styles.label}>{t('homeowner.post_job.date_label')}</Text>
      <TextInput
        style={styles.input}
        value={dateText}
        onChangeText={setDateText}
        placeholder="DD/MM/YYYY"
        placeholderTextColor="#999"
        keyboardType="numeric"
        editable={!posting}
      />

      {/* Duration */}
      <Text style={styles.label}>{t('homeowner.post_job.duration_label')}</Text>
      <View style={styles.durationRow}>
        {(['full', 'half'] as JobDuration[]).map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.durationChip, duration === d && styles.durationChipSelected]}
            onPress={() => setDuration(d)}
            disabled={posting}
          >
            <Text style={[styles.durationText, duration === d && styles.durationTextSelected]}>
              {t(`homeowner.post_job.${d}_day`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Location */}
      <Text style={styles.label}>{t('homeowner.post_job.location_label')}</Text>
      <TextInput
        style={styles.input}
        value={locationText}
        onChangeText={setLocationText}
        placeholderTextColor="#999"
        editable={!posting}
      />

      {/* Description */}
      <Text style={styles.label}>{t('homeowner.post_job.description_label')}</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        placeholderTextColor="#999"
        editable={!posting}
      />

      {/* Urgent toggle */}
      <View style={styles.urgentRow}>
        <Text style={styles.label}>{t('homeowner.post_job.urgent')}</Text>
        <Switch
          value={urgent}
          onValueChange={setUrgent}
          trackColor={{ false: '#ddd', true: '#FF3B30' }}
          thumbColor="#fff"
          disabled={posting}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, posting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={posting}
      >
        {posting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{t('homeowner.post_job.submit')}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  skillChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  skillChipSelected: { borderColor: '#007AFF', backgroundColor: '#e8f0ff' },
  skillChipText: { fontSize: 14, color: '#555' },
  skillChipTextSelected: { color: '#007AFF', fontWeight: '600' },
  durationRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  durationChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  durationChipSelected: { borderColor: '#007AFF', backgroundColor: '#e8f0ff' },
  durationText: { fontSize: 14, color: '#555' },
  durationTextSelected: { color: '#007AFF', fontWeight: '600' },
  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
