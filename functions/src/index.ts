import * as admin from 'firebase-admin';

admin.initializeApp();

// Job functions — full implementation in INO-161 (P1-E: Job Matching & Notifications)
export { onJobCreated, onJobAccepted, expireOldJobs } from './jobs/index';

// Job phase 2 functions — cancellation and no-show reporting
export { onJobCancelled } from './jobs/onJobCancelled';
export { onNoshowReported } from './jobs/onNoshowReported';

// Rating functions — full implementation in INO-163 (P1-G: Post-Job Rating)
export { onRatingCreated, promptRatings } from './ratings/index';

// Rating phase 2 functions — bidirectional rating
export { onWorkerRatingCreated } from './ratings/onWorkerRatingCreated';

// Notification functions — phase 2 (FCM reliability + delivery tracking)
export { checkFcmStaleness } from './notifications/checkFcmStaleness';
export { trackDelivery } from './notifications/trackDelivery';

// WhatsApp functions — phase 2 (retry queue)
export { retryWhatsappQueue } from './whatsapp/retryWhatsappQueue';

// Worker functions — INO-165 (P1-I: Aadhaar Verification)
export { resetAvailableToday, initiateAadhaarVerification, verifyAadhaarCallback } from './workers/index';

// Admin functions — INO-207 (P3-G: Admin Dashboard)
export { getMetrics } from './admin/getMetrics';
