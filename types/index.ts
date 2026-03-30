import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserRole = 'homeowner' | 'worker';

export type WorkerSkill =
  | 'coconut_tree_climber'
  | 'painter'
  | 'cleaner'
  | 'construction'
  | 'plumber'
  | 'electrician';

export interface UserDocument {
  uid: string;
  role: UserRole;
  name: string;
  phone: string;
  language: 'ml' | 'hi' | 'en';
  location?: {
    district: string;
    area: string;
    geohash: string;
    lat: number;
    lng: number;
  };
  // Onboarding
  onboardingComplete?: boolean;
  onboardingStep?: number;
  // Homeowner-only fields
  preferredSkills?: WorkerSkill[];
  notificationPreferences?: {
    pushEnabled: boolean;
    whatsappEnabled: boolean;
  };
  cancelledJobCount?: number;
  noshowReportCount?: number;
  reportedAsUnreliable?: boolean;
  // Worker-only fields
  skills?: WorkerSkill[];
  dayRate?: number;
  halfDayRate?: number;
  availableToday?: boolean;
  availableTodayResetAt?: FirebaseFirestoreTypes.Timestamp;
  aadhaarVerified?: boolean;
  ratingAvg?: number;
  ratingCount?: number;
  photoURL?: string;
  fcmToken?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

// ─── Job ──────────────────────────────────────────────────────────────────────

export type JobStatus = 'open' | 'confirmed' | 'completed' | 'expired' | 'cancelled' | 'noshow';
export type JobDuration = 'half' | 'full';

export interface JobDocument {
  jobId: string;
  homeownerId: string;
  skill: WorkerSkill;
  date: FirebaseFirestoreTypes.Timestamp;
  duration: JobDuration;
  locationText: string;
  locationGeo: {
    geohash: string;
    lat: number;
    lng: number;
  };
  urgent: boolean;
  description: string;
  status: JobStatus;
  acceptedWorkerId?: string;
  acceptedAt?: FirebaseFirestoreTypes.Timestamp;
  cancelledAt?: FirebaseFirestoreTypes.Timestamp;
  cancelReason?: string;
  cancelledBy?: string;
  noshowReport?: {
    reportedBy: string;
    note?: string;
    reportedAt: FirebaseFirestoreTypes.Timestamp;
  };
  createdAt: FirebaseFirestoreTypes.Timestamp;
  expiresAt: FirebaseFirestoreTypes.Timestamp;
}

// ─── Rating ───────────────────────────────────────────────────────────────────

export interface RatingDocument {
  ratingId: string;
  jobId: string;
  fromUid: string;
  toUid: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

// ─── Notification Queue ───────────────────────────────────────────────────────

export type NotificationType = 'job_alert' | 'rating_prompt';
export type NotificationChannel = 'fcm' | 'whatsapp';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'expired';

export interface NotificationQueueDocument {
  notifId: string;
  workerId: string;
  jobId: string;
  type: NotificationType;
  sentAt?: FirebaseFirestoreTypes.Timestamp;
  channel: NotificationChannel;
  status: NotificationStatus;
}
