import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// ─── resetAvailableToday ─────────────────────────────────────────────────────
// Runs at midnight IST every day.
// Resets availableToday: false for all workers.

export const resetAvailableToday = functions.scheduler.onSchedule(
  { schedule: 'every day 00:00', timeZone: 'Asia/Kolkata' },
  async (_event) => {
    const workersSnap = await db
      .collection('users')
      .where('role', '==', 'worker')
      .where('availableToday', '==', true)
      .get();

    if (workersSnap.empty) return;

    // Batch updates — Firestore max 500 per batch
    const chunks: admin.firestore.QueryDocumentSnapshot[][] = [];
    for (let i = 0; i < workersSnap.docs.length; i += 500) {
      chunks.push(workersSnap.docs.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const batch = db.batch();
      for (const doc of chunk) {
        batch.update(doc.ref, {
          availableToday: false,
          updatedAt: admin.firestore.Timestamp.now(),
        });
      }
      await batch.commit();
    }

    console.log(`Reset availableToday for ${workersSnap.size} workers`);
  }
);

// ─── verifyAadhaar ────────────────────────────────────────────────────────────
// Full implementation in INO-165 (P1-I: Aadhaar Verification)

export const verifyAadhaar = functions.https.onCall(
  async (_request) => {
    // TODO INO-165: call DigiLocker API to verify Aadhaar OTP
    // Sets aadhaarVerified: true on worker's user doc
  }
);
