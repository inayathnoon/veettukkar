import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'phone' | 'otp'>('phone');

  const { phoneVerification, sendOTP, verifyOTP } = useAuth();

  // Handle sending OTP
  const handleSendOTP = async () => {
    if (!phone.trim()) {
      alert(t('auth.login.phone_placeholder'));
      return;
    }

    const result = await sendOTP(phone);
    if (result.success) {
      setStage('otp');
    }
  };

  // Handle verifying OTP
  const handleVerifyOTP = async () => {
    if (!otp.trim() || !phoneVerification.verificationId) {
      alert('Invalid OTP');
      return;
    }

    const result = await verifyOTP(phoneVerification.verificationId, otp);
    if (result.success) {
      // Navigate to role selection
      router.push('/role-select');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('app.name')}</Text>
          <Text style={styles.tagline}>{t('auth.login.tagline')}</Text>
        </View>

        {stage === 'phone' ? (
          <View style={styles.form}>
            <Text style={styles.label}>{t('auth.login.phone_label')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.login.phone_placeholder')}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!phoneVerification.loading}
            />

            {phoneVerification.error && (
              <Text style={styles.errorText}>{phoneVerification.error}</Text>
            )}

            <TouchableOpacity
              style={[styles.button, phoneVerification.loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={phoneVerification.loading}
            >
              {phoneVerification.loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{t('auth.login.send_otp')}</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>{t('auth.login.otp_label')}</Text>
            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
              editable={!phoneVerification.loading}
            />

            {phoneVerification.error && (
              <Text style={styles.errorText}>{phoneVerification.error}</Text>
            )}

            <TouchableOpacity
              style={[styles.button, phoneVerification.loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={phoneVerification.loading}
            >
              {phoneVerification.loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{t('auth.login.verify')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleSendOTP}
              disabled={phoneVerification.loading}
            >
              <Text style={styles.resendText}>{t('auth.login.resend')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 12,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
