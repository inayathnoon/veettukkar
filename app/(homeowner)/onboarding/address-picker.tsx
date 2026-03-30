import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Geolocation from 'react-native-geolocation-service';
import { useAuth } from '../../../hooks/useAuth';

export default function AddressPickerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { updateUserDoc } = useAuth();

  const [locationText, setLocationText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      });

      const { latitude, longitude } = position.coords;
      await updateUserDoc({
        location: {
          district: 'Ernakulam',
          area: 'Current Location',
          lat: latitude,
          lng: longitude,
          geohash: '', // Will be computed by Cloud Function
        },
      });

      router.push('/(homeowner)/onboarding/preferred-skills');
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAddress = async () => {
    if (!locationText.trim()) return;

    try {
      await updateUserDoc({
        location: {
          district: 'Ernakulam',
          area: locationText,
          lat: 0,
          lng: 0,
          geohash: '',
        },
      });

      router.push('/(homeowner)/onboarding/preferred-skills');
    } catch (error) {
      console.error('Address update error:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('onboarding.address_picker')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.help_find_workers')}</Text>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleUseCurrentLocation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('onboarding.use_current_location')}</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.orText}>{t('common.or')}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('onboarding.enter_address')}</Text>
        <View style={styles.input}>
          <Text style={styles.placeholderText}>{locationText || t('onboarding.address_placeholder')}</Text>
        </View>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleManualAddress}>
          <Text style={styles.secondaryButtonText}>{t('common.continue')}</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 32,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 16,
  },
  inputContainer: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#f9fafb',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
});
