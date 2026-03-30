import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface MetricsResponse {
  jobsToday: number;
  jobFillRate: number;
  workersOnline: number;
  avgRating: number;
  flaggedWorkers: Array<{ uid: string; name: string; cancelledCount: number; noshowCount: number }>;
  flaggedHomeowners: Array<{ uid: string; name: string; cancelledCount: number; noshowCount: number }>;
  recentErrors: Array<{ message: string; timestamp: string; context?: string }>;
  whatsappQueueFailedCount: number;
}

export const getMetrics = functions.https.onCall(async (_, context) => {
  // Auth check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  }

  // Admin check
  const adminEmail = 'admin@veettukkar.app';
  const userEmail = context.auth.token.email;
  if (userEmail !== adminEmail) {
    throw new functions.https.HttpsError('permission-denied', 'User is not an admin');
  }

  try {
    // Get jobs from today
    const now = admin.firestore.Timestamp.now();
    const startOfDay = admin.firestore.Timestamp.fromMillis(
      new Date(new Date().setHours(0, 0, 0, 0)).getTime()
    );

    const jobsSnap = await db
      .collection('jobs')
      .where('createdAt', '>=', startOfDay)
      .where('createdAt', '<=', now)
      .get();

    const jobsToday = jobsSnap.size;
    const confirmedJobs = jobsSnap.docs.filter((doc) => doc.data().status === 'confirmed').length;
    const jobFillRate = jobsToday > 0 ? Math.round((confirmedJobs / jobsToday) * 100) : 0;

    // Get workers online (availableToday = true)
    const workersSnap = await db
      .collection('users')
      .where('role', '==', 'worker')
      .where('availableToday', '==', true)
      .get();

    const workersOnline = workersSnap.size;

    // Get average rating across all workers
    const allWorkersSnap = await db
      .collection('users')
      .where('role', '==', 'worker')
      .get();

    const avgRating =
      allWorkersSnap.size > 0
        ? Math.round(
            (allWorkersSnap.docs.reduce((sum, doc) => sum + (doc.data().ratingAvg || 0), 0) /
              allWorkersSnap.size) *
              10
          ) / 10
        : 0;

    // Get flagged workers (reportedAsUnreliable = true)
    const flaggedWorkersSnap = await db
      .collection('users')
      .where('role', '==', 'worker')
      .where('reportedAsUnreliable', '==', true)
      .get();

    const flaggedWorkers = flaggedWorkersSnap.docs.map((doc) => ({
      uid: doc.id,
      name: doc.data().name || 'Unknown',
      cancelledCount: doc.data().noshowReportCount || 0,
      noshowCount: doc.data().noshowReportCount || 0,
    }));

    // Get flagged homeowners (reportedAsUnreliable = true)
    const flaggedHomeownersSnap = await db
      .collection('users')
      .where('role', '==', 'homeowner')
      .where('reportedAsUnreliable', '==', true)
      .get();

    const flaggedHomeowners = flaggedHomeownersSnap.docs.map((doc) => ({
      uid: doc.id,
      name: doc.data().name || 'Unknown',
      cancelledCount: doc.data().cancelledJobCount || 0,
      noshowCount: doc.data().noshowReportCount || 0,
    }));

    // Get recent errors from logs (if available, use a collection or return empty)
    const recentErrors: Array<{ message: string; timestamp: string; context?: string }> = [];

    // Get WhatsApp queue failed count
    const whatsappFailedSnap = await db
      .collection('whatsapp_queue')
      .where('status', '==', 'failed')
      .get();

    const whatsappQueueFailedCount = whatsappFailedSnap.size;

    const response: MetricsResponse = {
      jobsToday,
      jobFillRate,
      workersOnline,
      avgRating,
      flaggedWorkers,
      flaggedHomeowners,
      recentErrors,
      whatsappQueueFailedCount,
    };

    return response;
  } catch (error: any) {
    console.error('Error getting metrics:', error);
    throw new functions.https.HttpsError('internal', 'Failed to retrieve metrics');
  }
});
