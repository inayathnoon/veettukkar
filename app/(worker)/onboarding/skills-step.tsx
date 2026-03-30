import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../../hooks/useAuth';
import { useWorkerProfile } from '../../../hooks/useWorkerProfile';
import { WorkerSkill } from '../../../types';

const SKILLS: { id: WorkerSkill; label: string }[] = [
  { id: 'coconut_tree_climber', label: 'Coconut Tree Climber' },
  { id: 'painter', label: 'Painter' },
  { id: 'cleaner', label: 'Cleaner' },
  { id: 'construction', label: 'Construction Worker' },
  { id: 'plumber', label: 'Plumber' },
  { id: 'electrician', label: 'Electrician' },
];

export default function SkillsStepScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { updateUserDoc } = useAuth();
  const { uploadProfilePhoto } = useWorkerProfile();

  const [selectedSkills, setSelectedSkills] = useState<WorkerSkill[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [dayRate, setDayRate] = useState('');
  const [halfDayRate, setHalfDayRate] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skillId: WorkerSkill) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  const handlePickPhoto = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 200,
        maxHeight: 200,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          setPhotoUri(response.assets[0].uri);
        }
      }
    );
  };

  const validateForm = () => {
    if (selectedSkills.length === 0) {
      Alert.alert(t('error.select_at_least_one_skill'));
      return false;
    }
    if (!dayRate || !halfDayRate) {
      Alert.alert(t('error.enter_rates'));
      return false;
    }
    if (isNaN(Number(dayRate)) || isNaN(Number(halfDayRate))) {
      Alert.alert(t('error.rates_must_be_numbers'));
      return false;
    }
    return true;
  };

  const handleComplete = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let photoURL: string | undefined;

      if (photoUri) {
        photoURL = await uploadProfilePhoto(photoUri);
      }

      await updateUserDoc({
        skills: selectedSkills,
        dayRate: Number(dayRate),
        halfDayRate: Number(halfDayRate),
        photoURL,
        onboardingComplete: true,
      });

      router.push('/(worker)/index');
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert(t('error.failed_to_complete_onboarding'));
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    await updateUserDoc({
      onboardingComplete: true,
    });
    router.push('/(worker)/index');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('onboarding.complete_your_profile')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.help_homeowners_trust_you')}</Text>

      {/* Photo Upload */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('onboarding.profile_photo')}</Text>
        <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <Text style={styles.photoButtonText}>{t('onboarding.add_photo')}</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.photoHint}>{t('onboarding.professional_photo_helps')}</Text>
      </View>

      {/* Skills Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('onboarding.select_skills')}</Text>
        <View style={styles.skillsGrid}>
          {SKILLS.map((skill) => (
            <TouchableOpacity
              key={skill.id}
              style={[
                styles.skillButton,
                selectedSkills.includes(skill.id) && styles.skillButtonSelected,
              ]}
              onPress={() => toggleSkill(skill.id)}
            >
              <Text
                style={[
                  styles.skillButtonText,
                  selectedSkills.includes(skill.id) && styles.skillButtonTextSelected,
                ]}
              >
                {skill.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Rates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('onboarding.set_your_rates')}</Text>
        <View style={styles.rateContainer}>
          <View style={styles.rateField}>
            <Text style={styles.rateLabel}>{t('onboarding.full_day_rate')}</Text>
            <TextInput
              style={styles.input}
              placeholder="₹500"
              keyboardType="numeric"
              value={dayRate}
              onChangeText={setDayRate}
            />
          </View>
          <View style={styles.rateField}>
            <Text style={styles.rateLabel}>{t('onboarding.half_day_rate')}</Text>
            <TextInput
              style={styles.input}
              placeholder="₹300"
              keyboardType="numeric"
              value={halfDayRate}
              onChangeText={setHalfDayRate}
            />
          </View>
        </View>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>{t('onboarding.why_this_matters')}</Text>
        <Text style={styles.infoText}>
          • {t('onboarding.photo_builds_trust')}
        </Text>
        <Text style={styles.infoText}>
          • {t('onboarding.skills_help_matching')}
        </Text>
        <Text style={styles.infoText}>
          • {t('onboarding.rates_are_negotiable')}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleComplete}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('onboarding.complete_setup')}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={loading}>
        <Text style={styles.skipButtonText}>{t('common.skip')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  photoButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  photoButtonText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  photoHint: {
    fontSize: 12,
    color: '#999',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  skillButtonSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  skillButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  skillButtonTextSelected: {
    color: '#fff',
  },
  rateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rateField: {
    flex: 1,
  },
  rateLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9fafb',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 4,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
});
