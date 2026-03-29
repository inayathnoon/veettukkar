import { useCallback } from 'react';
import i18n from '../lib/i18n';
import { auth, collections } from '../lib/firebase';

export type AppLanguage = 'ml' | 'en' | 'hi';

export function useSettings() {
  const changeLanguage = useCallback(async (lang: AppLanguage) => {
    await i18n.changeLanguage(lang);

    // Persist to user's Firestore doc so it's restored on next login
    const uid = auth().currentUser?.uid;
    if (uid) {
      await collections.users().doc(uid).update({ language: lang }).catch(() => null);
    }
  }, []);

  const currentLanguage = i18n.language as AppLanguage;

  return { currentLanguage, changeLanguage };
}
