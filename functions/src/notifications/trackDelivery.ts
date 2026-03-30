import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const trackDelivery = functions.pubsub
  .schedule('0 * * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    try {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      const undelivered = await db
        .collection('notification-log')
        .where('status', '==', 'sent')
        .where('sentAt', '<', admin.firestore.Timestamp.fromDate(new Date(twoHoursAgo)))
        .get();

      const batch = db.batch();
      undelivered.docs.forEach((doc) => {
        batch.update(doc.ref, { status: 'failed' });
      });
      await batch.commit();

      console.log(`Marked ${undelivered.size} notifications as failed`);
    } catch (error) {
      console.error('Error tracking delivery:', error);
    }
  });
