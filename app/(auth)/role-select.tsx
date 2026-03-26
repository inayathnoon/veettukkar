import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

// Placeholder — full implementation in INO-158 (P1-B: Authentication)
export default function RoleSelectScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.role_select.title')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
});
