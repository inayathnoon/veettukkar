import '../lib/i18n';
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { collections } from '../lib/firebase';
import { UserDocument } from '../types';
import { useNotifications } from '../hooks/useNotifications';
import { ErrorBoundary } from '../components/ErrorBoundary';

function useProtectedRoute(user: FirebaseAuthTypes.User | null, role: string | null, isAdmin: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (user && isAdmin && inAuthGroup) {
      router.replace('/(admin)');
    } else if (user && !isAdmin && inAdminGroup) {
      router.replace('/(auth)');
    } else if (user && role === 'homeowner' && inAuthGroup) {
      router.replace('/(homeowner)');
    } else if (user && role === 'worker' && inAuthGroup) {
      router.replace('/(worker)');
    }
  }, [user, role, isAdmin, segments]);
}

export default function RootLayout() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialising, setInitialising] = useState(true);

  // Wire in notification deep linking
  useNotifications();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check if admin
        const adminEmail = 'admin@veettukkar.app';
        setIsAdmin(firebaseUser.email === adminEmail);

        // Load user role
        const doc = await collections.users().doc(firebaseUser.uid).get();
        const data = doc.data() as UserDocument | undefined;
        setRole(data?.role ?? null);
      } else {
        setRole(null);
        setIsAdmin(false);
      }
      if (initialising) setInitialising(false);
    });
    return unsubscribe;
  }, []);

  useProtectedRoute(user, role, isAdmin);

  if (initialising) return null;

  return (
    <ErrorBoundary>
      <Slot />
    </ErrorBoundary>
  );
}
