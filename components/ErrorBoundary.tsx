import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { logError } from '../lib/crashlytics';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Crashlytics with component stack
    logError(error, {
      component: 'ErrorBoundary',
      stack: errorInfo.componentStack,
      type: 'uncaught_react_error',
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>എന്തോ കുഴപ്പം നേരിട്ടു</Text>
            <Text style={styles.errorSubtitle}>ദയവായി വീണ്ടും ശ്രമിക്കുക</Text>

            {__DEV__ && this.state.error && (
              <View style={styles.devSection}>
                <Text style={styles.devLabel}>Dev Info:</Text>
                <Text style={styles.devError}>{this.state.error.message}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>വീണ്ടും ശ്രമിക്കുക</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  devSection: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  devLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  devError: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
