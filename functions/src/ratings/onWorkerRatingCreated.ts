import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const onWorkerRatingCreated = functions.firestore.onDocumentCreated('ratings/{ratingId}', async (event) => {
  const rating = event.data?.data();
  if (!rating || rating.direction !== 'worker_to_homeowner') return;

  const homeownerId = rating.ratedId;
  const ratings = await db
    .collection('ratings')
    .where('ratedId', '==', homeownerId)
    .where('direction', '==', 'worker_to_homeowner')
    .get();

  const avgRating = ratings.docs.reduce((sum, doc) => sum + doc.data().stars, 0) / ratings.size;

  await db.collection('users').doc(homeownerId).update({
    homeownerRatingAvg: Math.round(avgRating * 10) / 10,
    homeownerRatingCount: ratings.size,
  });
  console.log(`Updated homeowner ${homeownerId} rating to ${avgRating}`);
});
