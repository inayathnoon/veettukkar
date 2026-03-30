import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { WorkerSkill } from '../../../types';

const SKILLS: { id: WorkerSkill; label: string }[] = [
  { id: 'coconut_tree_climber', label: 'Coconut Tree Climber' },
  { id: 'painter', label: 'Painter' },
  { id: 'cleaner', label: 'Cleaner' },
  { id: 'construction', label: 'Construction Worker' },
  { id: 'plumber', label: 'Plumber' },
  { id: 'electrician', label: 'Electrician' },
];

export default function PreferredSkillsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { updateUserDoc } = useAuth();

  const [selectedSkills, setSelectedSkills] = useState<WorkerSkill[]>([]);

  const toggleSkill = (skillId: WorkerSkill) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  const handleContinue = async () => {
    await updateUserDoc({
      preferredSkills: selectedSkills.length > 0 ? selectedSkills : undefined,
    });

    router.push('/(homeowner)/onboarding/notification-preferences');
  };

  const handleSkip = async () => {
    await updateUserDoc({
      onboardingComplete: true,
    });

    router.push('/(homeowner)/index');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('onboarding.preferred_skills')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.select_skills_you_use')}</Text>

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

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>{t('common.continue')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
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
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  skillButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  skillButtonSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  skillButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  skillButtonTextSelected: {
    color: '#fff',
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
