import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

// Placeholder — full implementation in INO-166 (P1-J: Job History)
export default function HomeownerHistoryScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('nav.history')}</Text>
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
