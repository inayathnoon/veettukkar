import * as admin from 'firebase-admin';

admin.initializeApp();

// Job functions — full implementation in INO-161 (P1-E: Job Matching & Notifications)
export { onJobCreated, onJobAccepted, expireOldJobs } from './jobs/index';

// Rating functions — full implementation in INO-163 (P1-G: Post-Job Rating)
export { onRatingCreated, promptRatings } from './ratings/index';

// Worker functions — INO-165 (P1-I: Aadhaar Verification)
export { resetAvailableToday, initiateAadhaarVerification, verifyAadhaarCallback } from './workers/index';
