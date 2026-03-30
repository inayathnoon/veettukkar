import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const checkFcmStaleness = functions.pubsub
  .schedule('0 6 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const staleUsers = await db
      .collection('users')
      .where('lastFcmTokenRefresh', '<', admin.firestore.Timestamp.fromDate(new Date(sevenDaysAgo)))
      .get();

    const batch = db.batch();
    staleUsers.docs.forEach((doc) => {
      batch.update(doc.ref, { fcmTokenStale: true });
    });
    await batch.commit();
    console.log(`Marked ${staleUsers.size} users with stale FCM tokens`);
  });
