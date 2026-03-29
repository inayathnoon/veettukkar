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

// ─── initiateAadhaarVerification ─────────────────────────────────────────────
// Called from the app. Returns the DigiLocker OAuth URL for the worker to open.
// Requires: DIGILOCKER_CLIENT_ID, DIGILOCKER_REDIRECT_URI env secrets.

export const initiateAadhaarVerification = functions.https.onCall(
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }

    const clientId = process.env.DIGILOCKER_CLIENT_ID;
    const redirectUri = process.env.DIGILOCKER_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'DigiLocker credentials not configured'
      );
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state: uid, // passed back in callback so we know which worker to verify
    });

    return {
      url: `https://api.digitallocker.gov.in/public/oauth2/1/authorize?${params.toString()}`,
    };
  }
);

// ─── verifyAadhaarCallback ────────────────────────────────────────────────────
// HTTP endpoint — DigiLocker redirects here after the user grants consent.
// Exchanges code for token, fetches Aadhaar XML, marks worker as verified.
// URL: DIGILOCKER_REDIRECT_URI (set in .env.example)

export const verifyAadhaarCallback = functions.https.onRequest(
  async (req, res) => {
    const { code, state: uid, error } = req.query as Record<string, string>;

    if (error || !code || !uid) {
      console.error('DigiLocker callback error', { error, code, uid });
      res.status(400).send('Aadhaar verification failed. Please try again in the app.');
      return;
    }

    const clientId = process.env.DIGILOCKER_CLIENT_ID;
    const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET;
    const redirectUri = process.env.DIGILOCKER_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      res.status(500).send('Server configuration error');
      return;
    }

    try {
      // Exchange authorization code for access token
      const tokenRes = await fetch('https://api.digitallocker.gov.in/public/oauth2/1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }).toString(),
      });

      if (!tokenRes.ok) {
        throw new Error(`Token exchange failed: ${tokenRes.status}`);
      }

      const tokenData = await tokenRes.json() as { access_token: string };
      const accessToken = tokenData.access_token;

      // Fetch Aadhaar eKYC XML to confirm identity
      const aadhaarRes = await fetch(
        'https://api.digitallocker.gov.in/public/oauth2/1/xml/eaadhaar',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!aadhaarRes.ok) {
        throw new Error(`Aadhaar fetch failed: ${aadhaarRes.status}`);
      }

      // Mark worker as Aadhaar-verified in Firestore
      await db.collection('users').doc(uid).update({
        aadhaarVerified: true,
        updatedAt: admin.firestore.Timestamp.now(),
      });

      console.log(`Worker ${uid} verified via Aadhaar`);
      res.status(200).send('Aadhaar verified. You can return to the Veettukkar app.');
    } catch (err) {
      console.error('Aadhaar verification error', err);
      res.status(500).send('Verification failed. Please try again.');
    }
  }
);
