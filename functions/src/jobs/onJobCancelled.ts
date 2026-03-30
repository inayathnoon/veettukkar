import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const onJobCancelled = functions.firestore.onDocumentUpdated(
  'jobs/{jobId}',
  async (event) => {
    const jobId = event.params.jobId;
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    // Only process if status changed to 'cancelled'
    if (before?.status === 'cancelled' || after?.status !== 'cancelled') {
      return;
    }

    const { homeownerId, cancelReason, cancelledAt } = after;

    try {
      // 1. Increment homeowner's cancelledJobCount
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const homeownerRef = db.collection('users').doc(homeownerId);

      await homeownerRef.update({
        cancelledJobCount: admin.firestore.FieldValue.increment(1),
      });

      // 2. Get homeowner's current count to check if unreliable
      const homeownerDoc = await homeownerRef.get();
      const cancelledCount = homeownerDoc.data()?.cancelledJobCount || 1;

      if (cancelledCount >= 3) {
        await homeownerRef.update({
          reportedAsUnreliable: true,
        });
      }

      // 3. Find and expire all pending notifications for this job
      const notificationsSnapshot = await db
        .collection('notifications')
        .where('jobId', '==', jobId)
        .where('status', '==', 'pending')
        .get();

      const batch = db.batch();
      notificationsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: 'expired',
        });
      });
      await batch.commit();

      // 4. Send notifications to workers who were notified about this job
      const workersToNotify = notificationsSnapshot.docs.map((doc) => doc.data().workerId);
      if (workersToNotify.length > 0) {
        const uniqueWorkerIds = [...new Set(workersToNotify)];
        const message = `Job has been cancelled by homeowner (Reason: ${cancelReason || 'Not specified'})`;

        for (const workerId of uniqueWorkerIds) {
          const workerRef = db.collection('users').doc(workerId);
          const workerDoc = await workerRef.get();

          if (workerDoc.exists && workerDoc.data()?.fcmToken) {
            const fcmToken = workerDoc.data()?.fcmToken;
            // Queue WhatsApp message
            await db.collection('whatsapp-queue').add({
              phoneNumber: workerDoc.data()?.phone,
              templateName: 'job_cancellation',
              jobId,
              status: 'pending',
              attempts: 0,
              message,
              createdAt: admin.firestore.Timestamp.now(),
            });
          }
        }
      }

      console.log(`Job ${jobId} cancelled. Notifications expired and workers notified.`);
    } catch (error) {
      console.error(`Error processing job cancellation for ${jobId}:`, error);
      throw error;
    }
  }
);
