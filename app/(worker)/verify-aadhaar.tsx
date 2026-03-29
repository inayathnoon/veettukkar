import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import functions from '@react-native-firebase/functions';
import { useWorkerProfile } from '../../hooks/useWorkerProfile';

export default function VerifyAadhaarScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profileState, loadProfile } = useWorkerProfile();
  const [initiating, setInitiating] = useState(false);
  const [awaitingReturn, setAwaitingReturn] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleOpenDigiLocker = async () => {
    setInitiating(true);
    try {
      const result = await functions().httpsCallable('initiateAadhaarVerification')({});
      const url: string = (result.data as any).url;
      await Linking.openURL(url);
      setAwaitingReturn(true);
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || 'Could not open DigiLocker');
    } finally {
      setInitiating(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    await loadProfile();
    setChecking(false);
    if (profileState.profile?.aadhaarVerified) {
      Alert.alert(t('worker.profile.verified'), '', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert(t('common.error'), t('aadhaar.not_verified_yet'));
    }
  };

  const isVerified = profileState.profile?.aadhaarVerified;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('worker.profile.verify_aadhaar')}</Text>

      {isVerified ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{t('worker.profile.verified')}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.description}>{t('aadhaar.description')}</Text>

          <View style={styles.steps}>
            <Text style={styles.stepText}>{t('aadhaar.step1')}</Text>
            <Text style={styles.stepText}>{t('aadhaar.step2')}</Text>
            <Text style={styles.stepText}>{t('aadhaar.step3')}</Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, initiating && styles.buttonDisabled]}
            onPress={handleOpenDigiLocker}
            disabled={initiating}
          >
            {initiating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>{t('aadhaar.open_digilocker')}</Text>
            )}
          </TouchableOpacity>

          {awaitingReturn && (
            <TouchableOpacity
              style={[styles.secondaryButton, checking && styles.buttonDisabled]}
              onPress={handleCheckStatus}
              disabled={checking}
            >
              {checking ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <Text style={styles.secondaryButtonText}>{t('aadhaar.check_status')}</Text>
              )}
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16 },
  description: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 20 },
  steps: { gap: 8, marginBottom: 32 },
  stepText: { fontSize: 14, color: '#555', lineHeight: 20 },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  successBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginTop: 24,
  },
  successText: { color: '#2e7d32', fontSize: 18, fontWeight: '700' },
});
