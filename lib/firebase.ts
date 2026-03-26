import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';

// Firebase is auto-configured from google-services.json (Android).
// No manual initialisation needed — @react-native-firebase handles it via
// the native plugin registered in app.json.

export { firebase, auth, firestore, storage, messaging };

// Collection references — typed helpers so callers never mistype paths.
export const collections = {
  users: () => firestore().collection('users'),
  jobs: () => firestore().collection('jobs'),
  ratings: () => firestore().collection('ratings'),
  notificationsQueue: () => firestore().collection('notifications_queue'),
} as const;
