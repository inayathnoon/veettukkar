import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SectionList,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { httpsCallable } from '@react-native-firebase/functions';
import { auth } from '../lib/firebase';

interface MetricsData {
  jobsToday: number;
  jobFillRate: number;
  workersOnline: number;
  avgRating: number;
  flaggedWorkers: Array<{ uid: string; name: string; cancelledCount: number; noshowCount: number }>;
  flaggedHomeowners: Array<{ uid: string; name: string; cancelledCount: number; noshowCount: number }>;
  recentErrors: Array<{ message: string; timestamp: string; context?: string }>;
  whatsappQueueFailedCount: number;
}

export default function AdminDashboardScreen() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = auth().currentUser;
      if (!user || user.email !== 'admin@veettukkar.app') {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const getMetrics = httpsCallable(
        require('@react-native-firebase/functions').default().httpsCallable,
        'getMetrics'
      );
      const response = await getMetrics();
      setMetrics(response.data as MetricsData);
    } catch (err: any) {
      console.error('Failed to load metrics:', err);
      setError(err.message || 'Failed to load metrics');
      Alert.alert('Error', err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      </View>
    );
  }

  if (accessDenied) {
    return (
      <View style={styles.container}>
        <Text style={styles.accessDeniedText}>Access denied. Admin only.</Text>
      </View>
    );
  }

  if (error || !metrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Failed to load dashboard'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMetrics}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Metrics Cards */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Jobs Today</Text>
          <Text style={styles.metricValue}>{metrics.jobsToday}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Fill Rate</Text>
          <Text style={styles.metricValue}>{metrics.jobFillRate}%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Workers Online</Text>
          <Text style={styles.metricValue}>{metrics.workersOnline}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Avg Rating</Text>
          <Text style={styles.metricValue}>{metrics.avgRating}⭐</Text>
        </View>
      </View>

      {/* Flagged Workers Section */}
      {metrics.flaggedWorkers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flagged Workers ({metrics.flaggedWorkers.length})</Text>
          <FlatList
            scrollEnabled={false}
            data={metrics.flaggedWorkers}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>No-shows: {item.noshowCount}</Text>
                <Text style={styles.itemId}>{item.uid}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* Flagged Homeowners Section */}
      {metrics.flaggedHomeowners.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flagged Homeowners ({metrics.flaggedHomeowners.length})</Text>
          <FlatList
            scrollEnabled={false}
            data={metrics.flaggedHomeowners}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>Cancelled: {item.cancelledCount}</Text>
                <Text style={styles.itemId}>{item.uid}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* Recent Errors Section */}
      {metrics.recentErrors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Errors ({metrics.recentErrors.length})</Text>
          <FlatList
            scrollEnabled={false}
            data={metrics.recentErrors}
            keyExtractor={(item, idx) => `error-${idx}`}
            renderItem={({ item }) => (
              <View style={styles.errorItem}>
                <Text style={styles.errorMessage}>{item.message}</Text>
                <Text style={styles.errorTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* WhatsApp Queue Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>WhatsApp Queue</Text>
        <View
          style={[
            styles.queueStatus,
            metrics.whatsappQueueFailedCount > 0 ? styles.queueStatusAlert : styles.queueStatusOk,
          ]}
        >
          <Text style={styles.queueStatusText}>
            Failed Messages: {metrics.whatsappQueueFailedCount}
          </Text>
        </View>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={loadMetrics}>
        <Text style={styles.refreshButtonText}>Refresh Metrics</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 40 },
  loader: { marginTop: 48 },
  accessDeniedText: {
    textAlign: 'center',
    color: '#FF3B30',
    fontSize: 16,
    marginTop: 48,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    fontSize: 16,
    marginTop: 48,
  },
  retryButton: {
    alignSelf: 'center',
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  metricLabel: { fontSize: 12, color: '#666', marginBottom: 8 },
  metricValue: { fontSize: 24, fontWeight: 'bold', color: '#007AFF' },
  section: { paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' },
  listItem: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
  itemName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  itemDetail: { fontSize: 12, color: '#666', marginBottom: 2 },
  itemId: { fontSize: 11, color: '#999', fontFamily: 'monospace' },
  errorItem: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
  errorMessage: { fontSize: 13, color: '#1a1a1a', marginBottom: 4 },
  errorTimestamp: { fontSize: 11, color: '#666' },
  queueStatus: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  queueStatusOk: { backgroundColor: '#d4edda', borderWidth: 1, borderColor: '#28a745' },
  queueStatusAlert: { backgroundColor: '#f8d7da', borderWidth: 1, borderColor: '#f5c6cb' },
  queueStatusText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  refreshButton: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  refreshButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
