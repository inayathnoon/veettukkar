import { useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import messaging from '@react-native-firebase/messaging';
import { auth, collections } from '../lib/firebase';
import { JobDocument, UserDocument } from '../types';

interface NotificationData {
  jobId: string;
  type: 'job_alert' | 'job_confirmed' | 'rating_prompt';
}

export function useNotifications() {
  const router = useRouter();

  // Route to the appropriate screen based on notification type and current user role
  const routeToNotification = useCallback(async (data: NotificationData) => {
    const { jobId, type } = data;
    const user = auth().currentUser;

    if (!user) return;

    try {
      // Fetch job details to determine context
      const jobDoc = await collections.jobs().doc(jobId).get();
      const job = jobDoc.data() as JobDocument | undefined;

      if (!job) return;

      switch (type) {
        case 'job_alert':
          // Worker received a job alert - navigate to my-jobs
          router.push('/(worker)/my-jobs');
          break;

        case 'job_confirmed':
          // Homeowner's job was confirmed - navigate to job detail
          router.push({
            pathname: '/(homeowner)/job-detail',
            params: { id: jobId },
          });
          break;

        case 'rating_prompt':
          // Rating prompt - navigate to appropriate rating screen based on user role
          const userDoc = await collections.users().doc(user.uid).get();
          const userData = userDoc.data() as UserDocument | undefined;

          if (userData?.role === 'homeowner') {
            // Navigate to rate-worker screen
            router.push({
              pathname: '/(homeowner)/rate-worker',
              params: {
                jobId,
                workerUid: job.acceptedWorkerId || '',
              },
            });
          } else if (userData?.role === 'worker') {
            // Navigate to rate-homeowner screen
            router.push({
              pathname: '/(worker)/rate-homeowner',
              params: {
                jobId,
                homeownerUid: job.homeownerId,
              },
            });
          }
          break;
      }
    } catch (error) {
      console.error('Error routing to notification:', error);
    }
  }, [router]);

  // Listen for notification opened app (app in foreground or resumed from background)
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp((message) => {
      const data = message.data as NotificationData | undefined;
      if (data?.jobId && data?.type) {
        routeToNotification(data);
      }
    });

    return unsubscribe;
  }, [routeToNotification]);

  // Handle notification when app is launched from a notification (cold start)
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then((message) => {
        if (message) {
          const data = message.data as NotificationData | undefined;
          if (data?.jobId && data?.type) {
            routeToNotification(data);
          }
        }
      })
      .catch((error) => {
        console.error('Error getting initial notification:', error);
      });
  }, [routeToNotification]);

  return { routeToNotification };
}
