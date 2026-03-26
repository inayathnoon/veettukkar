import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { geohashQueryBounds, distanceBetween } from 'geofire-common';
import { sendWhatsApp } from '../notifications/whatsapp';

const db = admin.firestore();
const messaging = admin.messaging();

const SEARCH_RADIUS_KM = 10;
const MAX_NOTIFIED_WORKERS = 20;

// ─── onJobCreated ─────────────────────────────────────────────────────────────
// Triggered when a new job is created in Firestore.
// Queries workers within 10km by skill, ranks them, sends FCM + WhatsApp.

export const onJobCreated = functions.firestore.onDocumentCreated(
  'jobs/{jobId}',
  async (event) => {
    const job = event.data?.data();
    if (!job) return;

    const { jobId, skill, locationGeo, urgent, date } = job;
    const { lat, lng } = locationGeo;

    // Build geohash range queries for 10km radius
    const bounds = geohashQueryBounds([lat, lng], SEARCH_RADIUS_KM * 1000);

    const workerSnapshots = await Promise.all(
      bounds.map(([start, end]) =>
        db
          .collection('users')
          .where('role', '==', 'worker')
          .where('skills', 'array-contains', skill)
          .where('location.geohash', '>=', start)
          .where('location.geohash', '<=', end)
          .get()
      )
    );

    // Deduplicate and filter by exact distance
    const seen = new Set<string>();
    const candidates: Array<{ uid: string; dist: number; data: FirebaseFirestore.DocumentData }> = [];

    for (const snap of workerSnapshots) {
      for (const doc of snap.docs) {
        if (seen.has(doc.id)) continue;
        seen.add(doc.id);

        const worker = doc.data();
        if (!worker.location?.lat || !worker.location?.lng) continue;

        const dist = distanceBetween(
          [worker.location.lat, worker.location.lng],
          [lat, lng]
        );
        if (dist <= SEARCH_RADIUS_KM) {
          candidates.push({ uid: doc.id, dist, data: worker });
        }
      }
    }

    // Rank: availableToday desc, aadhaarVerified desc, ratingAvg desc, distance asc
    candidates.sort((a, b) => {
      if ((b.data.availableToday ? 1 : 0) !== (a.data.availableToday ? 1 : 0))
        return (b.data.availableToday ? 1 : 0) - (a.data.availableToday ? 1 : 0);
      if ((b.data.aadhaarVerified ? 1 : 0) !== (a.data.aadhaarVerified ? 1 : 0))
        return (b.data.aadhaarVerified ? 1 : 0) - (a.data.aadhaarVerified ? 1 : 0);
      if ((b.data.ratingAvg ?? 0) !== (a.data.ratingAvg ?? 0))
        return (b.data.ratingAvg ?? 0) - (a.data.ratingAvg ?? 0);
      return a.dist - b.dist;
    });

    const top = candidates.slice(0, MAX_NOTIFIED_WORKERS);

    const batch = db.batch();
    const now = admin.firestore.Timestamp.now();

    const jobDateStr = date.toDate().toLocaleDateString('ml-IN');
    const notifBody = `${urgent ? '🚨 ' : ''}${skill} ജോലി — ${jobDateStr} — ${locationGeo.geohash.slice(0, 6)}`;

    for (const worker of top) {
      // Create notification_queue entry
      const notifRef = db.collection('notifications_queue').doc();
      batch.set(notifRef, {
        notifId: notifRef.id,
        workerId: worker.uid,
        jobId,
        type: 'job_alert',
        channel: 'fcm',
        status: 'pending',
        sentAt: now,
      });

      // Send FCM
      if (worker.data.fcmToken) {
        try {
          await messaging.send({
            token: worker.data.fcmToken,
            notification: { title: 'വീട്ടുക്കാർ — പുതിയ ജോലി', body: notifBody },
            data: { jobId, type: 'job_alert' },
          });
          batch.update(notifRef, { status: 'sent' });
        } catch {
          batch.update(notifRef, { status: 'failed' });
        }
      }

      // Send WhatsApp fallback
      if (worker.data.phone) {
        await sendWhatsApp(worker.data.phone, `New job available: ${skill} on ${jobDateStr}. Open the app to accept.`).catch(() => null);
      }
    }

    await batch.commit();
  }
);

// ─── onJobAccepted ────────────────────────────────────────────────────────────
// Triggered when job status changes to "confirmed".
// Notifies homeowner, expires other notifications for this job.

export const onJobAccepted = functions.firestore.onDocumentUpdated(
  'jobs/{jobId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    // Only act when status transitions to "confirmed"
    if (before.status === after.status || after.status !== 'confirmed') return;

    const { jobId, homeownerId, acceptedWorkerId } = after;

    // Get homeowner and worker docs
    const [homeownerDoc, workerDoc] = await Promise.all([
      db.collection('users').doc(homeownerId).get(),
      acceptedWorkerId ? db.collection('users').doc(acceptedWorkerId).get() : Promise.resolve(null),
    ]);

    const homeowner = homeownerDoc.data();
    const worker = workerDoc?.data();

    // Notify homeowner via FCM
    if (homeowner?.fcmToken && worker) {
      const stars = worker.ratingAvg ? `⭐${worker.ratingAvg.toFixed(1)}` : '';
      const body = `${worker.name} ${stars} — ${worker.phone}`;
      await messaging
        .send({
          token: homeowner.fcmToken,
          notification: { title: 'ജോലി സ്ഥിരീകരിച്ചു ✓', body },
          data: { jobId, type: 'job_confirmed' },
        })
        .catch(() => null);
    }

    // WhatsApp to homeowner
    if (homeowner?.phone && worker) {
      await sendWhatsApp(
        homeowner.phone,
        `Your job has been accepted by ${worker.name}. Phone: ${worker.phone}`
      ).catch(() => null);
    }

    // Expire all other pending notifications for this job
    const pendingNotifs = await db
      .collection('notifications_queue')
      .where('jobId', '==', jobId)
      .where('status', '==', 'pending')
      .get();

    const batch = db.batch();
    for (const doc of pendingNotifs.docs) {
      batch.update(doc.ref, { status: 'expired' });
    }
    await batch.commit();
  }
);

// ─── expireOldJobs ────────────────────────────────────────────────────────────
// Runs hourly. Marks open jobs as expired if 24h past their job date.

export const expireOldJobs = functions.scheduler.onSchedule(
  { schedule: 'every 60 minutes', timeZone: 'Asia/Kolkata' },
  async (_event) => {
    const now = admin.firestore.Timestamp.now();
    const cutoff = admin.firestore.Timestamp.fromMillis(now.toMillis());

    const expiredSnap = await db
      .collection('jobs')
      .where('status', '==', 'open')
      .where('expiresAt', '<=', cutoff)
      .get();

    if (expiredSnap.empty) return;

    const batch = db.batch();
    for (const doc of expiredSnap.docs) {
      batch.update(doc.ref, { status: 'expired' });
    }
    await batch.commit();

    console.log(`Expired ${expiredSnap.size} jobs`);
  }
);
