import * as functions from 'firebase-functions/v2';

// Full implementation in INO-161 (P1-E: Job Matching & Notifications)

export const onJobCreated = functions.firestore.onDocumentCreated(
  'jobs/{jobId}',
  async (_event) => {
    // TODO INO-161: query workers within 10km by skill+date, send FCM + WhatsApp
  },
);

export const onJobAccepted = functions.firestore.onDocumentUpdated(
  'jobs/{jobId}',
  async (_event) => {
    // TODO INO-161: send confirmation to homeowner, expire other notifications
  },
);

export const expireOldJobs = functions.scheduler.onSchedule(
  { schedule: 'every 60 minutes', timeZone: 'Asia/Kolkata' },
  async (_event) => {
    // TODO INO-161: mark jobs as expired if past date + 24h with no acceptance
  },
);
