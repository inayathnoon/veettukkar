import * as functions from 'firebase-functions/v2';

// Full implementation in INO-161 (resetAvailableToday) and INO-165 (verifyAadhaar)

export const resetAvailableToday = functions.scheduler.onSchedule(
  { schedule: 'every day 00:00', timeZone: 'Asia/Kolkata' },
  async (_event) => {
    // TODO INO-161: reset availableToday: false for all workers
  },
);

export const verifyAadhaar = functions.https.onCall(
  async (_request) => {
    // TODO INO-165: call DigiLocker API to verify Aadhaar OTP
    // Sets aadhaarVerified: true on worker's user doc
  },
);
