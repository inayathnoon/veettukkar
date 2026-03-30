import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const retryWhatsappQueue = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    try {
      const failedMessages = await db
        .collection('whatsapp-queue')
        .where('status', '==', 'failed')
        .where('attempts', '<', 3)
        .get();

      const batch = db.batch();
      const now = admin.firestore.Timestamp.now();

      failedMessages.docs.forEach((doc) => {
        const data = doc.data();
        const nextRetryAt = new Date(now.toMillis() + 5 * (data.attempts + 1) * 60 * 1000);

        batch.update(doc.ref, {
          attempts: admin.firestore.FieldValue.increment(1),
          nextRetryAt: admin.firestore.Timestamp.fromDate(nextRetryAt),
          lastAttemptAt: now,
        });
      });

      await batch.commit();
      console.log(`Processed ${failedMessages.size} failed WhatsApp messages`);
    } catch (error) {
      console.error('Error in retryWhatsappQueue:', error);
    }
  });
