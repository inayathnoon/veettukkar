import { useState, useCallback } from 'react';
import { auth, firestore, collections } from '../lib/firebase';
import { JobDocument, UserDocument } from '../types';
import { proximityBounds, withinRadius } from '../lib/geohash';

const SEARCH_RADIUS_KM = 10;

interface FeedState {
  jobs: JobDocument[];
  loading: boolean;
  error: string | null;
}

export function useWorkerJobFeed() {
  const [feedState, setFeedState] = useState<FeedState>({
    jobs: [],
    loading: false,
    error: null,
  });

  const [accepting, setAccepting] = useState<string | null>(null); // jobId being accepted

  // Load open nearby jobs that match worker's skills and location
  const loadFeed = useCallback(async () => {
    setFeedState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');

      const workerDoc = await collections.users().doc(user.uid).get();
      const worker = workerDoc.data() as UserDocument | undefined;

      if (!worker?.skills?.length || !worker.location) {
        setFeedState({ jobs: [], loading: false, error: null });
        return [];
      }

      const { lat, lng } = worker.location;
      const bounds = proximityBounds(lat, lng, SEARCH_RADIUS_KM);

      // Query open jobs for each geohash bound + each skill
      // Using the first skill for simplicity (Cloud Function handles multi-skill)
      const snapshots = await Promise.all(
        bounds.map(([start, end]) =>
          collections
            .jobs()
            .where('status', '==', 'open')
            .where('locationGeo.geohash', '>=', start)
            .where('locationGeo.geohash', '<=', end)
            .get()
        )
      );

      const seen = new Set<string>();
      const jobs: JobDocument[] = [];

      for (const snap of snapshots) {
        for (const doc of snap.docs) {
          if (seen.has(doc.id)) continue;
          seen.add(doc.id);

          const job = doc.data() as JobDocument;
          // Filter by skill and exact distance
          if (!worker.skills.includes(job.skill)) continue;
          if (!withinRadius(lat, lng, job.locationGeo.lat, job.locationGeo.lng, SEARCH_RADIUS_KM)) continue;

          jobs.push(job);
        }
      }

      // Sort: urgent first, then by date
      jobs.sort((a, b) => {
        if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
        return a.date.toMillis() - b.date.toMillis();
      });

      setFeedState({ jobs, loading: false, error: null });
      return jobs;
    } catch (error: any) {
      const msg = error?.message || 'Failed to load jobs';
      setFeedState({ jobs: [], loading: false, error: msg });
      return [];
    }
  }, []);

  // Accept a job — sets status to "confirmed", triggers onJobAccepted Cloud Function
  const acceptJob = useCallback(async (jobId: string) => {
    setAccepting(jobId);

    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');

      await collections.jobs().doc(jobId).update({
        status: 'confirmed',
        acceptedWorkerId: user.uid,
        acceptedAt: firestore.Timestamp.now(),
      });

      // Remove from feed
      setFeedState((prev) => ({
        ...prev,
        jobs: prev.jobs.filter((j) => j.jobId !== jobId),
      }));

      setAccepting(null);
      return { success: true };
    } catch (error: any) {
      setAccepting(null);
      return { success: false, error: error?.message || 'Failed to accept job' };
    }
  }, []);

  // Load jobs accepted/confirmed by the current worker
  const loadMyJobs = useCallback(async () => {
    setFeedState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');

      const snap = await collections
        .jobs()
        .where('acceptedWorkerId', '==', user.uid)
        .orderBy('date', 'desc')
        .get();

      const jobs = snap.docs.map((doc) => doc.data() as JobDocument);
      setFeedState({ jobs, loading: false, error: null });
      return jobs;
    } catch (error: any) {
      const msg = error?.message || 'Failed to load my jobs';
      setFeedState({ jobs: [], loading: false, error: msg });
      return [];
    }
  }, []);

  return {
    feedState,
    accepting,
    loadFeed,
    acceptJob,
    loadMyJobs,
  };
}
