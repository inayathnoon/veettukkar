import '../lib/i18n';
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { collections } from '../lib/firebase';
import { UserDocument } from '../types';

function useProtectedRoute(user: FirebaseAuthTypes.User | null, role: string | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (user && role === 'homeowner' && inAuthGroup) {
      router.replace('/(homeowner)');
    } else if (user && role === 'worker' && inAuthGroup) {
      router.replace('/(worker)');
    }
  }, [user, role, segments]);
}

export default function RootLayout() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const doc = await collections.users().doc(firebaseUser.uid).get();
        const data = doc.data() as UserDocument | undefined;
        setRole(data?.role ?? null);
      } else {
        setRole(null);
      }
      if (initialising) setInitialising(false);
    });
    return unsubscribe;
  }, []);

  useProtectedRoute(user, role);

  if (initialising) return null;

  return <Slot />;
}
