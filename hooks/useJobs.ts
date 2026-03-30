import { useState, useCallback } from 'react';
import { auth, firestore, collections } from '../lib/firebase';
import { JobDocument, WorkerSkill, JobDuration } from '../types';
import { geohashForLocation } from '../lib/geohash';

export interface PostJobInput {
  skill: WorkerSkill;
  date: Date;
  duration: JobDuration;
  locationText: string;
  locationLat: number;
  locationLng: number;
  description: string;
  urgent: boolean;
  workerPreferredId?: string;
}

interface JobsState {
  jobs: JobDocument[];
  loading: boolean;
  error: string | null;
}

export function useJobs() {
  const [jobsState, setJobsState] = useState<JobsState>({
    jobs: [],
    loading: false,
    error: null,
  });

  const [posting, setPosting] = useState(false);

  // Load all jobs posted by the current homeowner
  const loadMyJobs = useCallback(async () => {
    setJobsState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');

      const snapshot = await collections
        .jobs()
        .where('homeownerId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get();

      const jobs = snapshot.docs.map((doc) => doc.data() as JobDocument);
      setJobsState({ jobs, loading: false, error: null });
      return jobs;
    } catch (error: any) {
      const msg = error?.message || 'Failed to load jobs';
      setJobsState({ jobs: [], loading: false, error: msg });
      return [];
    }
  }, []);

  // Post a new job
  const postJob = useCallback(async (input: PostJobInput) => {
    setPosting(true);

    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');

      const jobId = collections.jobs().doc().id;
      const jobDate = firestore.Timestamp.fromDate(input.date);
      const expiresAt = firestore.Timestamp.fromDate(
        new Date(input.date.getTime() + 24 * 60 * 60 * 1000)
      );

      const geohash = geohashForLocation([input.locationLat, input.locationLng]);

      const job: JobDocument = {
        jobId,
        homeownerId: user.uid,
        skill: input.skill,
        date: jobDate,
        duration: input.duration,
        locationText: input.locationText,
        locationGeo: {
          geohash,
          lat: input.locationLat,
          lng: input.locationLng,
        },
        urgent: input.urgent,
        description: input.description,
        status: 'open',
        ...(input.workerPreferredId && { workerPreferredId: input.workerPreferredId }),
        createdAt: firestore.Timestamp.now(),
        expiresAt,
      };

      await collections.jobs().doc(jobId).set(job);

      setPosting(false);
      return { success: true, jobId };
    } catch (error: any) {
      setPosting(false);
      return { success: false, error: error?.message || 'Failed to post job' };
    }
  }, []);

  // Get a single job by ID
  const getJob = useCallback(async (jobId: string) => {
    try {
      const doc = await collections.jobs().doc(jobId).get();
      return doc.exists ? (doc.data() as JobDocument) : null;
    } catch {
      return null;
    }
  }, []);

  // Cancel a job (only if no confirmed worker)
  const cancelJob = useCallback(async (jobId: string, reason: string) => {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');

      const jobRef = collections.jobs().doc(jobId);
      const jobDoc = await jobRef.get();

      if (!jobDoc.exists) throw new Error('Job not found');

      const job = jobDoc.data() as JobDocument;
      if (job.acceptedWorkerId) throw new Error('Cannot cancel job with confirmed worker');
      if (job.status !== 'open') throw new Error('Can only cancel open jobs');

      await jobRef.update({
        status: 'cancelled',
        cancelledAt: firestore.Timestamp.now(),
        cancelReason: reason,
        cancelledBy: user.uid,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Failed to cancel job' };
    }
  }, []);

  return {
    jobsState,
    posting,
    loadMyJobs,
    postJob,
    getJob,
    cancelJob,
  };
}
