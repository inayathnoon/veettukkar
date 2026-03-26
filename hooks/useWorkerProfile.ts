import { useState, useCallback } from 'react';
import { auth, storage, firestore, collections } from '../lib/firebase';
import { UserDocument, WorkerSkill } from '../types';

export interface WorkerProfileInput {
  name: string;
  skills: WorkerSkill[];
  dayRate: number;
  halfDayRate: number;
  locationText: string;
}

interface ProfileState {
  profile: UserDocument | null;
  loading: boolean;
  error: string | null;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function useWorkerProfile() {
  const [profileState, setProfileState] = useState<ProfileState>({
    profile: null,
    loading: false,
    error: null,
  });

  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });

  // Load current worker profile from Firestore
  const loadProfile = useCallback(async () => {
    setProfileState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');

      const doc = await collections.users().doc(user.uid).get();
      const data = doc.exists ? (doc.data() as UserDocument) : null;

      setProfileState({ profile: data, loading: false, error: null });
      return data;
    } catch (error: any) {
      const msg = error?.message || 'Failed to load profile';
      setProfileState({ profile: null, loading: false, error: msg });
      return null;
    }
  }, []);

  // Save worker profile fields to Firestore
  const saveProfile = useCallback(async (input: WorkerProfileInput) => {
    setProfileState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');

      const updates: Partial<UserDocument> = {
        name: input.name,
        skills: input.skills,
        dayRate: input.dayRate,
        halfDayRate: input.halfDayRate,
        updatedAt: firestore.Timestamp.now(),
      };

      await collections.users().doc(user.uid).set(updates, { merge: true });

      const updated = (await collections.users().doc(user.uid).get()).data() as UserDocument;
      setProfileState({ profile: updated, loading: false, error: null });

      return { success: true, profile: updated };
    } catch (error: any) {
      const msg = error?.message || 'Failed to save profile';
      setProfileState((prev) => ({ ...prev, loading: false, error: msg }));
      return { success: false, error: msg };
    }
  }, []);

  // Upload photo to Firebase Storage — resize is handled by Cloud Function trigger
  const uploadPhoto = useCallback(async (localUri: string) => {
    setUploadState({ uploading: true, progress: 0, error: null });

    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');

      const storagePath = `profile_photos/${user.uid}/photo.jpg`;
      const ref = storage().ref(storagePath);

      const task = ref.putFile(localUri);

      task.on('state_changed', (snapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        setUploadState((prev) => ({ ...prev, progress }));
      });

      await task;

      const downloadURL = await ref.getDownloadURL();

      // Save photoURL to user doc
      await collections.users().doc(user.uid).set(
        { photoURL: downloadURL, updatedAt: firestore.Timestamp.now() },
        { merge: true }
      );

      setUploadState({ uploading: false, progress: 1, error: null });
      return { success: true, photoURL: downloadURL };
    } catch (error: any) {
      const msg = error?.message || 'Failed to upload photo';
      setUploadState({ uploading: false, progress: 0, error: msg });
      return { success: false, error: msg };
    }
  }, []);

  // Toggle "Available Today"
  const setAvailableToday = useCallback(async (available: boolean) => {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');

      await collections.users().doc(user.uid).set(
        {
          availableToday: available,
          availableTodayResetAt: firestore.Timestamp.now(),
          updatedAt: firestore.Timestamp.now(),
        },
        { merge: true }
      );

      setProfileState((prev) =>
        prev.profile
          ? { ...prev, profile: { ...prev.profile, availableToday: available } }
          : prev
      );

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Failed to update availability' };
    }
  }, []);

  return {
    profileState,
    uploadState,
    loadProfile,
    saveProfile,
    uploadPhoto,
    setAvailableToday,
  };
}
