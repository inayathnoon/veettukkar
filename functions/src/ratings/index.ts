import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { sendRatingReminderWhatsApp } from '../notifications/whatsapp';

const db = admin.firestore();
const messaging = admin.messaging();

// ─── onRatingCreated ──────────────────────────────────────────────────────────
// Triggered when a new rating document is created.
// Recalculates ratingAvg and ratingCount on the worker's user doc.

export const onRatingCreated = functions.firestore.onDocumentCreated(
  'ratings/{ratingId}',
  async (event) => {
    const rating = event.data?.data();
    if (!rating) return;

    const { toUid } = rating;

    // Aggregate all ratings for this worker
    const ratingsSnap = await db
      .collection('ratings')
      .where('toUid', '==', toUid)
      .get();

    if (ratingsSnap.empty) return;

    const total = ratingsSnap.docs.reduce((sum, doc) => sum + (doc.data().stars ?? 0), 0);
    const count = ratingsSnap.size;
    const avg = Math.round((total / count) * 10) / 10; // 1 decimal place

    await db.collection('users').doc(toUid).update({
      ratingAvg: avg,
      ratingCount: count,
      updatedAt: admin.firestore.Timestamp.now(),
    });
  }
);

// ─── promptRatings ────────────────────────────────────────────────────────────
// Runs daily at 8pm IST.
// Sends rating prompts to both homeowners and workers for confirmed jobs from today without a rating.

export const promptRatings = functions.scheduler.onSchedule(
  { schedule: 'every day 20:00', timeZone: 'Asia/Kolkata' },
  async (_event) => {
    const now = admin.firestore.Timestamp.now();
    const startOfDay = admin.firestore.Timestamp.fromMillis(
      new Date(new Date().setHours(0, 0, 0, 0)).getTime()
    );

    const jobsSnap = await db
      .collection('jobs')
      .where('status', '==', 'confirmed')
      .where('date', '>=', startOfDay)
      .where('date', '<=', now)
      .get();

    if (jobsSnap.empty) return;

    let prompted = 0;

    for (const jobDoc of jobsSnap.docs) {
      const job = jobDoc.data();

      // Prompt homeowner to rate worker
      const homeownerRated = await db
        .collection('ratings')
        .where('jobId', '==', job.jobId)
        .where('fromUid', '==', job.homeownerId)
        .where('direction', '==', 'homeowner_to_worker')
        .limit(1)
        .get();

      if (homeownerRated.empty) {
        const homeownerDoc = await db.collection('users').doc(job.homeownerId).get();
        const homeowner = homeownerDoc.data();
        if (homeowner) {
          if (homeowner.fcmToken) {
            await messaging
              .send({
                token: homeowner.fcmToken,
                notification: {
                  title: 'ജോലി എങ്ങനെ ഉണ്ടായിരുന്നു?',
                  body: `${job.skill} — Rate your worker`,
                },
                data: { jobId: job.jobId, type: 'rating_prompt' },
              })
              .catch(() => null);
          }
          if (homeowner.phone) {
            await sendRatingReminderWhatsApp(homeowner.phone, job.skill).catch(() => null);
          }
          prompted++;
        }
      }

      // Prompt worker to rate homeowner
      if (job.acceptedWorkerId) {
        const workerRated = await db
          .collection('ratings')
          .where('jobId', '==', job.jobId)
          .where('fromUid', '==', job.acceptedWorkerId)
          .where('direction', '==', 'worker_to_homeowner')
          .limit(1)
          .get();

        if (workerRated.empty) {
          const workerDoc = await db.collection('users').doc(job.acceptedWorkerId).get();
          const worker = workerDoc.data();
          if (worker) {
            if (worker.fcmToken) {
              await messaging
                .send({
                  token: worker.fcmToken,
                  notification: {
                    title: 'വീട്ടിലാളി എങ്ങനെ ആയിരുന്നു?',
                    body: 'Rate your homeowner',
                  },
                  data: { jobId: job.jobId, type: 'rating_prompt' },
                })
                .catch(() => null);
            }
            prompted++;
          }
        }
      }
    }

    console.log(`Sent rating prompts for ${prompted} users`);
  }
);
