import * as functions from 'firebase-functions/v2';

// Full implementation in INO-163 (P1-G: Post-Job Rating)

export const onRatingCreated = functions.firestore.onDocumentCreated(
  'ratings/{ratingId}',
  async (_event) => {
    // TODO INO-163: recalculate ratingAvg and ratingCount on worker's user doc
  },
);

export const promptRatings = functions.scheduler.onSchedule(
  { schedule: 'every day 20:00', timeZone: 'Asia/Kolkata' },
  async (_event) => {
    // TODO INO-163: send rating prompts for jobs completed today without a rating
  },
);
