import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { sendWhatsApp } from '../notifications/whatsapp';

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
// Sends rating prompts to homeowners for confirmed jobs from today without a rating.

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

      // Check if homeowner already rated
      const existingRating = await db
        .collection('ratings')
        .where('jobId', '==', job.jobId)
        .where('fromUid', '==', job.homeownerId)
        .limit(1)
        .get();

      if (!existingRating.empty) continue;

      const homeownerDoc = await db.collection('users').doc(job.homeownerId).get();
      const homeowner = homeownerDoc.data();
      if (!homeowner) continue;

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
        await sendWhatsApp(
          homeowner.phone,
          `How was the job today? Please rate your worker in the Veettukkar app.`
        ).catch(() => null);
      }

      prompted++;
    }

    console.log(`Sent rating prompts for ${prompted} jobs`);
  }
);
