import { useState, useCallback } from 'react';
import { auth, firestore, collections } from '../lib/firebase';
import { UserRole, UserDocument } from '../types';

interface PhoneVerificationState {
  loading: boolean;
  error: string | null;
  verificationId: string | null;
}

interface AuthState {
  user: UserDocument | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [phoneVerification, setPhoneVerification] = useState<PhoneVerificationState>({
    loading: false,
    error: null,
    verificationId: null,
  });

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Send OTP to phone number
  const sendOTP = useCallback(async (phoneNumber: string) => {
    setPhoneVerification({ loading: true, error: null, verificationId: null });

    try {
      // Add +91 prefix if not present
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

      const confirmation = await auth().signInWithPhoneNumber(formattedPhone, true);
      setPhoneVerification({
        loading: false,
        error: null,
        verificationId: confirmation.verificationId,
      });

      return { success: true, verificationId: confirmation.verificationId };
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to send OTP';
      setPhoneVerification({
        loading: false,
        error: errorMsg,
        verificationId: null,
      });

      return { success: false, error: errorMsg };
    }
  }, []);

  // Verify OTP and sign in
  const verifyOTP = useCallback(
    async (verificationId: string, otp: string) => {
      setPhoneVerification((prev) => ({ ...prev, loading: true }));

      try {
        const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
        await auth().signInWithCredential(credential);

        return { success: true };
      } catch (error: any) {
        const errorMsg = error?.message || 'Failed to verify OTP';
        setPhoneVerification((prev) => ({ ...prev, error: errorMsg }));

        return { success: false, error: errorMsg };
      }
    },
    []
  );

  // Create or update user in Firestore
  const createUserProfile = useCallback(
    async (role: UserRole, name?: string, language: 'ml' | 'hi' | 'en' = 'ml') => {
      setAuthState((prev) => ({ ...prev, loading: true }));

      try {
        const user = auth().currentUser;
        if (!user) throw new Error('No authenticated user');

        const userDoc: Partial<UserDocument> = {
          uid: user.uid,
          phone: user.phoneNumber || '',
          role,
          language,
          updatedAt: firestore.Timestamp.now(),
        };

        // Only add name if provided
        if (name) {
          userDoc.name = name;
        }

        // If this is a new document, add createdAt
        const docRef = collections.users().doc(user.uid);
        const existingDoc = await docRef.get();
        if (!existingDoc.exists) {
          userDoc.createdAt = firestore.Timestamp.now();
          userDoc.name = name || '';
        }

        // Set user document in Firestore
        await docRef.set(userDoc, { merge: true });

        const finalDoc = (await docRef.get()).data() as UserDocument;

        setAuthState({
          user: finalDoc,
          loading: false,
          error: null,
        });

        return { success: true, user: finalDoc };
      } catch (error: any) {
        const errorMsg = error?.message || 'Failed to create user profile';
        setAuthState({
          user: null,
          loading: false,
          error: errorMsg,
        });

        return { success: false, error: errorMsg };
      }
    },
    []
  );

  // Get current authenticated user
  const getCurrentUser = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      const user = auth().currentUser;
      if (!user) {
        setAuthState({ user: null, loading: false, error: null });
        return null;
      }

      const userDoc = await collections.users().doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data() as UserDocument;
        setAuthState({
          user: userData,
          loading: false,
          error: null,
        });
        return userData;
      }

      setAuthState({ user: null, loading: false, error: null });
      return null;
    } catch (error: any) {
      setAuthState({
        user: null,
        loading: false,
        error: error?.message || 'Failed to get user',
      });
      return null;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      await auth().signOut();
      setAuthState({ user: null, loading: false, error: null });
      setPhoneVerification({ loading: false, error: null, verificationId: null });

      return { success: true };
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to logout';
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMsg }));

      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    // Phone verification state
    phoneVerification,
    sendOTP,
    verifyOTP,

    // Auth state
    authState,
    createUserProfile,
    getCurrentUser,
    logout,

    // Current user
    isAuthenticated: !!authState.user,
  };
}
