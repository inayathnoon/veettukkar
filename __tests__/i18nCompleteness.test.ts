import en from '../locales/en.json';
import ml from '../locales/ml.json';
import hi from '../locales/hi.json';

function getAllKeys(obj: any, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, val]) =>
    typeof val === 'object' && val !== null
      ? getAllKeys(val, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );
}

describe('i18n completeness', () => {
  const enKeys = getAllKeys(en).sort();
  const mlKeys = getAllKeys(ml).sort();
  const hiKeys = getAllKeys(hi).sort();

  it('should have identical key sets across all languages', () => {
    const allKeys = new Set([...enKeys, ...mlKeys, ...hiKeys]);

    for (const key of allKeys) {
      expect(enKeys).toContain(key, `English missing: ${key}`);
      expect(mlKeys).toContain(key, `Malayalam missing: ${key}`);
      expect(hiKeys).toContain(key, `Hindi missing: ${key}`);
    }
  });

  it('Malayalam has all English keys', () => {
    const missing = enKeys.filter((k) => !mlKeys.includes(k));
    expect(missing).toEqual(
      [],
      `Malayalam is missing keys: ${missing.join(', ')}`
    );
  });

  it('Hindi has all English keys', () => {
    const missing = enKeys.filter((k) => !hiKeys.includes(k));
    expect(missing).toEqual(
      [],
      `Hindi is missing keys: ${missing.join(', ')}`
    );
  });

  it('should have no empty strings in translations', () => {
    const checkEmpty = (obj: any, lang: string, prefix = ''): string[] => {
      return Object.entries(obj).flatMap(([key, val]) => {
        const fullKey = `${prefix}${key}`;
        if (typeof val === 'object' && val !== null) {
          return checkEmpty(val, lang, `${fullKey}.`);
        }
        if (val === '' || val === null || val === undefined) {
          return [`${lang}: ${fullKey}`];
        }
        return [];
      });
    };

    const emptyEn = checkEmpty(en, 'English');
    const emptyMl = checkEmpty(ml, 'Malayalam');
    const emptyHi = checkEmpty(hi, 'Hindi');
    const allEmpty = [...emptyEn, ...emptyMl, ...emptyHi];

    expect(allEmpty).toEqual(
      [],
      `Found empty translations: ${allEmpty.join(', ')}`
    );
  });

  it('should have all required onboarding keys', () => {
    const requiredOnboardingKeys = [
      'onboarding.address_picker',
      'onboarding.help_find_workers',
      'onboarding.use_current_location',
      'onboarding.enter_address',
      'onboarding.address_placeholder',
      'onboarding.preferred_skills',
      'onboarding.select_skills_you_use',
      'onboarding.notification_preferences',
      'onboarding.how_to_notify_you',
      'onboarding.push_notifications',
      'onboarding.instant_updates_in_app',
      'onboarding.whatsapp_messages',
      'onboarding.backup_if_no_push',
      'onboarding.complete_your_profile',
      'onboarding.help_homeowners_trust_you',
      'onboarding.profile_photo',
      'onboarding.add_photo',
      'onboarding.professional_photo_helps',
      'onboarding.select_skills',
      'onboarding.set_your_rates',
      'onboarding.full_day_rate',
      'onboarding.half_day_rate',
      'onboarding.why_this_matters',
      'onboarding.photo_builds_trust',
      'onboarding.skills_help_matching',
      'onboarding.rates_are_negotiable',
      'onboarding.complete_setup',
    ];

    for (const key of requiredOnboardingKeys) {
      expect(enKeys).toContain(key, `Missing English onboarding key: ${key}`);
      expect(mlKeys).toContain(key, `Missing Malayalam onboarding key: ${key}`);
      expect(hiKeys).toContain(key, `Missing Hindi onboarding key: ${key}`);
    }
  });

  it('should have all required error keys', () => {
    const requiredErrorKeys = [
      'error.select_at_least_one_skill',
      'error.enter_rates',
      'error.rates_must_be_numbers',
      'error.failed_to_complete_onboarding',
    ];

    for (const key of requiredErrorKeys) {
      expect(enKeys).toContain(key, `Missing English error key: ${key}`);
      expect(mlKeys).toContain(key, `Missing Malayalam error key: ${key}`);
      expect(hiKeys).toContain(key, `Missing Hindi error key: ${key}`);
    }
  });

  it('should have all required common keys', () => {
    const requiredCommonKeys = [
      'common.loading',
      'common.error',
      'common.success',
      'common.retry',
      'common.cancel',
      'common.save',
      'common.logout',
      'common.continue',
      'common.skip',
      'common.or',
    ];

    for (const key of requiredCommonKeys) {
      expect(enKeys).toContain(key, `Missing English common key: ${key}`);
      expect(mlKeys).toContain(key, `Missing Malayalam common key: ${key}`);
      expect(hiKeys).toContain(key, `Missing Hindi common key: ${key}`);
    }
  });

  it('should have rating keys for both directions', () => {
    const requiredRatingKeys = [
      'rating.title',
      'rating.prompt',
      'rating.homeowner_prompt',
      'rating.rate_homeowner',
      'rating.comment_placeholder',
      'rating.submit',
    ];

    for (const key of requiredRatingKeys) {
      expect(enKeys).toContain(key, `Missing English rating key: ${key}`);
      expect(mlKeys).toContain(key, `Missing Malayalam rating key: ${key}`);
      expect(hiKeys).toContain(key, `Missing Hindi rating key: ${key}`);
    }
  });

  it('should report total key count', () => {
    console.log(`English keys: ${enKeys.length}`);
    console.log(`Malayalam keys: ${mlKeys.length}`);
    console.log(`Hindi keys: ${hiKeys.length}`);
    expect(mlKeys.length).toBe(enKeys.length);
    expect(hiKeys.length).toBe(enKeys.length);
  });
});
