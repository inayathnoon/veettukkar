import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRating } from '../../hooks/useRating';

export default function RateWorkerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { jobId, workerUid } = useLocalSearchParams<{ jobId: string; workerUid: string }>();

  const { state, submitRating } = useRating();
  const [stars, setStars] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (!stars) {
      Alert.alert('', 'Please select a rating');
      return;
    }
    if (!jobId || !workerUid) {
      Alert.alert(t('common.error'), 'Missing job or worker information');
      return;
    }

    const result = await submitRating(jobId, workerUid, 'homeowner_to_worker', stars, comment);
    if (result.success) {
      router.back();
    } else {
      Alert.alert(t('common.error'), result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('rating.title')}</Text>
      <Text style={styles.prompt}>{t('rating.prompt')}</Text>

      {/* Star selector */}
      <View style={styles.starsRow}>
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => setStars(n)}
            disabled={state.submitting}
            style={styles.starButton}
          >
            <Text style={[styles.star, stars !== null && n <= stars && styles.starFilled]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.commentInput}
        value={comment}
        onChangeText={setComment}
        placeholder={t('rating.comment_placeholder')}
        placeholderTextColor="#999"
        multiline
        numberOfLines={3}
        editable={!state.submitting}
      />

      <TouchableOpacity
        style={[styles.submitButton, state.submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={state.submitting}
      >
        {state.submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{t('rating.submit')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', marginBottom: 8 },
  prompt: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 32 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  starButton: { padding: 4 },
  star: { fontSize: 40, color: '#ddd' },
  starFilled: { color: '#FF9500' },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#1a1a1a',
    height: 90,
    textAlignVertical: 'top',
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
