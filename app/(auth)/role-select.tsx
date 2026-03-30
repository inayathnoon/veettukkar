import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function RoleSelectScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createUserProfile, authState } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'homeowner' | 'worker' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role: 'homeowner' | 'worker') => {
    setSelectedRole(role);
    setLoading(true);

    try {
      const result = await createUserProfile(role);
      if (result.success) {
        // Navigate to appropriate onboarding screen
        if (role === 'homeowner') {
          router.replace('/(homeowner)/onboarding/address-picker');
        } else {
          router.replace('/(worker)/onboarding/skills-step');
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to select role');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('auth.role_select.title')}</Text>
      </View>

      <View style={styles.options}>
        {/* Homeowner option */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedRole === 'homeowner' && styles.optionCardSelected,
          ]}
          onPress={() => !loading && handleRoleSelect('homeowner')}
          disabled={loading}
        >
          {loading && selectedRole === 'homeowner' && (
            <ActivityIndicator color="#007AFF" size="large" style={styles.loader} />
          )}
          <Text style={styles.optionTitle}>{t('auth.role_select.homeowner')}</Text>
          <Text style={styles.optionDescription}>
            {t('auth.role_select.homeowner_desc')}
          </Text>
        </TouchableOpacity>

        {/* Worker option */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedRole === 'worker' && styles.optionCardSelected,
          ]}
          onPress={() => !loading && handleRoleSelect('worker')}
          disabled={loading}
        >
          {loading && selectedRole === 'worker' && (
            <ActivityIndicator color="#007AFF" size="large" style={styles.loader} />
          )}
          <Text style={styles.optionTitle}>{t('auth.role_select.worker')}</Text>
          <Text style={styles.optionDescription}>
            {t('auth.role_select.worker_desc')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  options: {
    gap: 16,
  },
  optionCard: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  optionCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  loader: {
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
