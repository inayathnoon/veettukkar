import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Picker,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useWorkerBrowse } from '../../../hooks/useWorkerBrowse';
import { UserDocument, WorkerSkill } from '../../../types';

const SKILL_OPTIONS: { label: string; value: WorkerSkill | undefined }[] = [
  { label: 'browse.all_skills', value: undefined },
  { label: 'skills.coconut_tree_climber', value: 'coconut_tree_climber' },
  { label: 'skills.painter', value: 'painter' },
  { label: 'skills.cleaner', value: 'cleaner' },
  { label: 'skills.construction', value: 'construction' },
  { label: 'skills.plumber', value: 'plumber' },
  { label: 'skills.electrician', value: 'electrician' },
];

const RATING_OPTIONS = [
  { label: 'browse.all_ratings', value: undefined },
  { label: 'browse.rating_4', value: 4 },
  { label: 'browse.rating_45', value: 4.5 },
];

function WorkerCard({
  worker,
  onPress,
}: {
  worker: UserDocument;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {worker.photoURL ? (
        <Image source={{ uri: worker.photoURL }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Text style={styles.photoPlaceholderText}>📷</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{worker.name}</Text>
          {worker.aadhaarVerified && (
            <Text style={styles.verifiedBadge}>✓</Text>
          )}
        </View>

        {worker.skills && worker.skills.length > 0 && (
          <View style={styles.skillsTags}>
            {worker.skills.slice(0, 2).map((skill) => (
              <Text key={skill} style={styles.skillTag}>
                {t(`skills.${skill}`)}
              </Text>
            ))}
            {worker.skills.length > 2 && (
              <Text style={styles.skillTag}>+{worker.skills.length - 2}</Text>
            )}
          </View>
        )}

        <View style={styles.cardFooter}>
          <View>
            {worker.dayRate && (
              <Text style={styles.rateLabel}>
                ₹{worker.dayRate} {t('homeowner.browse.day_rate')}
              </Text>
            )}
            {worker.halfDayRate && (
              <Text style={styles.rateLabel}>
                ₹{worker.halfDayRate} {t('homeowner.browse.half_day_rate')}
              </Text>
            )}
          </View>

          <View style={styles.ratingBox}>
            <Text style={styles.rating}>
              {worker.ratingAvg ? worker.ratingAvg.toFixed(1) : 'N/A'} ⭐
            </Text>
            <Text style={styles.ratingCount}>
              ({worker.ratingCount || 0})
            </Text>
          </View>
        </View>

        {worker.reportedAsUnreliable && (
          <Text style={styles.warningBadge}>⚠️ Reliability concerns</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function WorkerBrowseScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { state, browseWorkers } = useWorkerBrowse();

  const [skill, setSkill] = useState<WorkerSkill | undefined>(undefined);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [ratingMin, setRatingMin] = useState<number | undefined>(undefined);

  // Initial load
  useEffect(() => {
    browseWorkers(skill, availableOnly, ratingMin);
  }, []);

  // Refetch when filters change
  const handleFilterChange = (
    newSkill: WorkerSkill | undefined,
    newAvailable: boolean,
    newRating: number | undefined
  ) => {
    setSkill(newSkill);
    setAvailableOnly(newAvailable);
    setRatingMin(newRating);
    browseWorkers(newSkill, newAvailable, newRating);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('homeowner.browse.title')}</Text>
      </View>

      <View style={styles.filterBar}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('homeowner.browse.filter_skill')}</Text>
          <Picker
            selectedValue={skill}
            onValueChange={(value) => handleFilterChange(value, availableOnly, ratingMin)}
            style={styles.picker}
          >
            {SKILL_OPTIONS.map((opt) => (
              <Picker.Item key={opt.value || 'all'} label={t(opt.label)} value={opt.value} />
            ))}
          </Picker>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.toggleRow}>
            <Text style={styles.filterLabel}>{t('homeowner.browse.filter_available')}</Text>
            <Switch
              value={availableOnly}
              onValueChange={(val) => handleFilterChange(skill, val, ratingMin)}
            />
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('homeowner.browse.filter_rating')}</Text>
          <Picker
            selectedValue={ratingMin}
            onValueChange={(value) => handleFilterChange(skill, availableOnly, value)}
            style={styles.picker}
          >
            {RATING_OPTIONS.map((opt) => (
              <Picker.Item key={opt.value || 'all'} label={t(opt.label)} value={opt.value} />
            ))}
          </Picker>
        </View>
      </View>

      {state.loading ? (
        <ActivityIndicator style={styles.loader} color="#007AFF" size="large" />
      ) : state.workers.length === 0 ? (
        <Text style={styles.empty}>{t('homeowner.browse.no_results')}</Text>
      ) : (
        <FlatList
          data={state.workers}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <WorkerCard
              worker={item}
              onPress={() =>
                router.push({
                  pathname: '/(homeowner)/workers/[workerId]',
                  params: { workerId: item.uid },
                })
              }
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
  header: {
    padding: 24,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterSection: { marginBottom: 12 },
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  picker: { height: 40, color: '#1a1a1a' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loader: { marginTop: 48 },
  empty: { textAlign: 'center', color: '#999', fontSize: 15, marginTop: 48 },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  photo: { width: 100, height: 100, backgroundColor: '#e5e5e5' },
  photoPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  photoPlaceholderText: { fontSize: 40 },
  cardContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  verifiedBadge: {
    marginLeft: 6,
    fontSize: 14,
    color: '#34C759',
    fontWeight: '700',
  },
  skillsTags: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  skillTag: { fontSize: 11, backgroundColor: '#e5e5e5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, color: '#555' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  rateLabel: { fontSize: 12, color: '#666', marginBottom: 2 },
  ratingBox: { alignItems: 'flex-end' },
  rating: { fontSize: 13, fontWeight: '600', color: '#FF9500' },
  ratingCount: { fontSize: 10, color: '#999' },
  warningBadge: { fontSize: 11, color: '#FF3B30', marginTop: 6, fontWeight: '600' },
});
