import { useState, useCallback } from 'react';
import { auth, firestore, collections } from '../lib/firebase';
import { UserDocument, WorkerSkill } from '../types';
import { logError } from '../lib/crashlytics';

interface WorkerBrowseState {
  workers: UserDocument[];
  loading: boolean;
  error: string | null;
}

export function useWorkerBrowse() {
  const [state, setState] = useState<WorkerBrowseState>({
    workers: [],
    loading: false,
    error: null,
  });

  const browseWorkers = useCallback(
    async (skill?: WorkerSkill, availableOnly?: boolean, ratingMin?: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        let query: any = collections.users().where('role', '==', 'worker');

        if (skill) {
          query = query.where('skills', 'array-contains', skill);
        }

        if (availableOnly) {
          query = query.where('availableToday', '==', true);
        }

        let workers = (await query.get()).docs.map((doc) => doc.data() as UserDocument);

        // Client-side filtering for rating
        if (ratingMin) {
          workers = workers.filter((w) => (w.ratingAvg || 0) >= ratingMin);
        }

        // Sort by rating desc
        workers.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));

        setState({ workers, loading: false, error: null });
        return workers;
      } catch (error: any) {
        const msg = error?.message || 'Failed to browse workers';
        logError(error, { action: 'browseWorkers', skill });
        setState({ workers: [], loading: false, error: msg });
        return [];
      }
    },
    []
  );

  const getWorkerDetail = useCallback(async (workerId: string) => {
    try {
      const doc = await collections.users().doc(workerId).get();
      return doc.exists ? (doc.data() as UserDocument) : null;
    } catch {
      return null;
    }
  }, []);

  return {
    state,
    browseWorkers,
    getWorkerDetail,
  };
}
