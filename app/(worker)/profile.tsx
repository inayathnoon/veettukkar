import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useWorkerProfile } from '../../hooks/useWorkerProfile';
import { WorkerSkill } from '../../types';

const ALL_SKILLS: WorkerSkill[] = [
  'coconut_tree_climber',
  'painter',
  'cleaner',
  'construction',
  'plumber',
  'electrician',
];

export default function WorkerProfileScreen() {
  const { t } = useTranslation();
  const { profileState, uploadState, loadProfile, saveProfile, uploadPhoto } =
    useWorkerProfile();

  const [name, setName] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<WorkerSkill[]>([]);
  const [dayRate, setDayRate] = useState('');
  const [halfDayRate, setHalfDayRate] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const profile = profileState.profile;
    if (profile) {
      setName(profile.name || '');
      setSelectedSkills(profile.skills || []);
      setDayRate(profile.dayRate ? String(profile.dayRate) : '');
      setHalfDayRate(profile.halfDayRate ? String(profile.halfDayRate) : '');
      setPhotoUri(profile.photoURL || null);
    }
  }, [profileState.profile]);

  const toggleSkill = (skill: WorkerSkill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permission is needed to upload a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      await uploadPhoto(uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('', t('worker.profile.name_label') + ' required');
      return;
    }
    if (selectedSkills.length === 0) {
      Alert.alert('', t('worker.profile.skills_label') + ' required');
      return;
    }

    const result = await saveProfile({
      name: name.trim(),
      skills: selectedSkills,
      dayRate: parseInt(dayRate, 10) || 0,
      halfDayRate: parseInt(halfDayRate, 10) || 0,
      locationText: '',
    });

    if (!result.success) {
      Alert.alert(t('common.error'), result.error);
    }
  };

  const isLoading = profileState.loading || uploadState.uploading;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t('worker.profile.title')}</Text>

      {profileState.profile?.aadhaarVerified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>{t('worker.profile.verified')}</Text>
        </View>
      )}

      {/* Photo picker */}
      <TouchableOpacity style={styles.photoArea} onPress={handlePickPhoto} disabled={isLoading}>
        {uploadState.uploading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <Text style={styles.photoPlaceholder}>{t('worker.profile.photo_label')}</Text>
        )}
      </TouchableOpacity>

      {/* Name */}
      <Text style={styles.label}>{t('worker.profile.name_label')}</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        editable={!isLoading}
        placeholderTextColor="#999"
      />

      {/* Skills */}
      <Text style={styles.label}>{t('worker.profile.skills_label')}</Text>
      <View style={styles.skillsGrid}>
        {ALL_SKILLS.map((skill) => (
          <TouchableOpacity
            key={skill}
            style={[
              styles.skillChip,
              selectedSkills.includes(skill) && styles.skillChipSelected,
            ]}
            onPress={() => toggleSkill(skill)}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.skillChipText,
                selectedSkills.includes(skill) && styles.skillChipTextSelected,
              ]}
            >
              {t(`skills.${skill}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Day Rate */}
      <Text style={styles.label}>{t('worker.profile.day_rate_label')}</Text>
      <TextInput
        style={styles.input}
        value={dayRate}
        onChangeText={setDayRate}
        keyboardType="numeric"
        editable={!isLoading}
        placeholderTextColor="#999"
      />

      {/* Half Day Rate */}
      <Text style={styles.label}>{t('worker.profile.half_day_rate_label')}</Text>
      <TextInput
        style={styles.input}
        value={halfDayRate}
        onChangeText={setHalfDayRate}
        keyboardType="numeric"
        editable={!isLoading}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isLoading}
      >
        {profileState.loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>{t('worker.profile.save')}</Text>
        )}
      </TouchableOpacity>

      {profileState.error && (
        <Text style={styles.errorText}>{profileState.error}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingBottom: 48 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16 },
  verifiedBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  verifiedText: { color: '#2e7d32', fontWeight: '600', fontSize: 14 },
  photoArea: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: { fontSize: 12, color: '#999', textAlign: 'center', padding: 8 },
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
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#FF3B30', fontSize: 14, marginTop: 12, textAlign: 'center' },
});
