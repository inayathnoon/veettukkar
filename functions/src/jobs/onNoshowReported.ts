import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const onNoshowReported = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { jobId, note } = data;
  const workerId = context.auth.uid;

  try {
    // 1. Get the job
    const jobRef = db.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Job not found');
    }

    const job = jobDoc.data();
    const homeownerId = job.homeownerId;
    const jobDate = job.date.toDate();

    // 2. Check if within 3 days after job date
    const now = new Date();
    const daysSinceJob = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceJob > 3) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Can only report no-show within 3 days of job date'
      );
    }

    if (daysSinceJob < 0) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Cannot report no-show for future job'
      );
    }

    // 3. Update job with no-show report
    await jobRef.update({
      status: 'noshow',
      noshowReport: {
        reportedBy: workerId,
        note: note || '',
        reportedAt: admin.firestore.Timestamp.now(),
      },
    });

    // 4. Get worker info for notification
    const workerRef = db.collection('users').doc(workerId);
    const workerDoc = await workerRef.get();
    const workerName = workerDoc.data()?.name || 'Worker';

    // 5. Increment homeowner's noshowReportCount
    const homeownerRef = db.collection('users').doc(homeownerId);
    await homeownerRef.update({
      noshowReportCount: admin.firestore.FieldValue.increment(1),
    });

    // 6. Check if homeowner should be flagged as unreliable (2+ reports)
    const homeownerDoc = await homeownerRef.get();
    const noshowCount = homeownerDoc.data()?.noshowReportCount || 1;

    if (noshowCount >= 2) {
      await homeownerRef.update({
        reportedAsUnreliable: true,
      });
    }

    // 7. Send notification to homeowner
    const message = `${workerName} says you cancelled this job on day-of. Please rate fairly.`;
    const homeownerPhone = homeownerDoc.data()?.phone;

    if (homeownerPhone) {
      await db.collection('whatsapp-queue').add({
        phoneNumber: homeownerPhone,
        templateName: 'no_show_report',
        jobId,
        workerId,
        status: 'pending',
        attempts: 0,
        message,
        createdAt: admin.firestore.Timestamp.now(),
      });
    }

    console.log(`No-show reported for job ${jobId} by worker ${workerId}`);

    return {
      success: true,
      message: 'No-show reported successfully',
      unreliableCount: noshowCount,
    };
  } catch (error: any) {
    console.error(`Error reporting no-show for job ${jobId}:`, error);
    throw error;
  }
});
