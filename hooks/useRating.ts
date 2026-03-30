import { useState, useCallback } from 'react';
import { auth, firestore, collections } from '../lib/firebase';
import { RatingDocument, RatingDirection } from '../types';

interface RatingState {
  submitting: boolean;
  error: string | null;
  submitted: boolean;
}

export function useRating() {
  const [state, setState] = useState<RatingState>({
    submitting: false,
    error: null,
    submitted: false,
  });

  // Submit a rating for a completed job
  const submitRating = useCallback(
    async (
      jobId: string,
      toUid: string,
      direction: RatingDirection,
      stars: 1 | 2 | 3 | 4 | 5,
      comment?: string
    ) => {
      setState({ submitting: true, error: null, submitted: false });

      try {
        const user = auth().currentUser;
        if (!user) throw new Error('Not authenticated');

        const ratingId = collections.ratings().doc().id;

        const rating: RatingDocument = {
          ratingId,
          jobId,
          fromUid: user.uid,
          toUid,
          direction,
          stars,
          comment: comment?.trim() || undefined,
          createdAt: firestore.Timestamp.now(),
        };

        await collections.ratings().doc(ratingId).set(rating);

        // Mark job as completed
        await collections.jobs().doc(jobId).update({ status: 'completed' });

        setState({ submitting: false, error: null, submitted: true });
        return { success: true };
      } catch (error: any) {
        const msg = error?.message || 'Failed to submit rating';
        setState({ submitting: false, error: msg, submitted: false });
        return { success: false, error: msg };
      }
    },
    []
  );

  // Check if homeowner already rated a job
  const hasRated = useCallback(async (jobId: string): Promise<boolean> => {
    const user = auth().currentUser;
    if (!user) return false;

    const snap = await collections
      .ratings()
      .where('jobId', '==', jobId)
      .where('fromUid', '==', user.uid)
      .limit(1)
      .get();

    return !snap.empty;
  }, []);

  return { state, submitRating, hasRated };
}
