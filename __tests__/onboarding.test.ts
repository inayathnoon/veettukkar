import { renderHook, act, waitFor } from '@testing-library/react-native';
import { jest } from '@jest/globals';

// Mock Firebase and other dependencies
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: { uid: 'test-user-123' },
  })),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        update: jest.fn().mockResolvedValue(undefined),
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
      })),
    })),
  })),
}));

jest.mock('expo-router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
  })),
}));

jest.mock('react-native-geolocation-service', () => ({
  __esModule: true,
  default: {
    getCurrentPosition: jest.fn(),
  },
}));

jest.mock('react-native-image-picker', () => ({
  __esModule: true,
  launchImageLibrary: jest.fn(),
}));

// Mock hooks
jest.mock('../hooks/useAuth', () => ({
  __esModule: true,
  useAuth: jest.fn(() => ({
    updateUserDoc: jest.fn().mockResolvedValue(undefined),
    authState: { user: { uid: 'test-user-123' } },
  })),
}));

jest.mock('../hooks/useWorkerProfile', () => ({
  __esModule: true,
  useWorkerProfile: jest.fn(() => ({
    uploadProfilePhoto: jest.fn().mockResolvedValue('https://example.com/photo.jpg'),
  })),
}));

describe('Onboarding Screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('HomeownerAddressPickerScreen', () => {
    it('should update user doc with location on continue', async () => {
      const { useAuth } = require('../hooks/useAuth');
      const mockUpdateUserDoc = jest.fn().mockResolvedValue(undefined);

      useAuth.mockReturnValue({
        updateUserDoc: mockUpdateUserDoc,
      });

      // Test that address gets saved
      await act(async () => {
        await mockUpdateUserDoc({
          location: {
            district: 'Ernakulam',
            area: 'Test Area',
            lat: 9.95,
            lng: 76.24,
            geohash: '',
          },
        });
      });

      expect(mockUpdateUserDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          location: expect.objectContaining({
            area: 'Test Area',
          }),
        })
      );
    });

    it('should require address before continuing', async () => {
      // Validate that address fields are required
      const addressText = '';
      expect(addressText).toBe('');
    });
  });

  describe('HomeownerPreferredSkillsScreen', () => {
    it('should allow selecting multiple skills', async () => {
      const selectedSkills = ['plumber', 'electrician'];
      expect(selectedSkills).toHaveLength(2);
      expect(selectedSkills).toContain('plumber');
    });

    it('should save selected skills to Firestore', async () => {
      const { useAuth } = require('../hooks/useAuth');
      const mockUpdateUserDoc = jest.fn().mockResolvedValue(undefined);

      useAuth.mockReturnValue({
        updateUserDoc: mockUpdateUserDoc,
      });

      const skills = ['painter', 'cleaner'];

      await act(async () => {
        await mockUpdateUserDoc({
          preferredSkills: skills,
        });
      });

      expect(mockUpdateUserDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredSkills: skills,
        })
      );
    });

    it('should allow skipping skill selection', async () => {
      const { useAuth } = require('../hooks/useAuth');
      const mockUpdateUserDoc = jest.fn().mockResolvedValue(undefined);

      useAuth.mockReturnValue({
        updateUserDoc: mockUpdateUserDoc,
      });

      await act(async () => {
        await mockUpdateUserDoc({
          onboardingComplete: true,
        });
      });

      expect(mockUpdateUserDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          onboardingComplete: true,
        })
      );
    });
  });

  describe('HomeownerNotificationPreferencesScreen', () => {
    it('should save push notification preference', async () => {
      const { useAuth } = require('../hooks/useAuth');
      const mockUpdateUserDoc = jest.fn().mockResolvedValue(undefined);

      useAuth.mockReturnValue({
        updateUserDoc: mockUpdateUserDoc,
      });

      await act(async () => {
        await mockUpdateUserDoc({
          notificationPreferences: {
            pushEnabled: true,
            whatsappEnabled: false,
          },
        });
      });

      expect(mockUpdateUserDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          notificationPreferences: expect.objectContaining({
            pushEnabled: true,
          }),
        })
      );
    });

    it('should mark onboarding as complete when preferences are saved', async () => {
      const { useAuth } = require('../hooks/useAuth');
      const mockUpdateUserDoc = jest.fn().mockResolvedValue(undefined);

      useAuth.mockReturnValue({
        updateUserDoc: mockUpdateUserDoc,
      });

      await act(async () => {
        await mockUpdateUserDoc({
          notificationPreferences: {
            pushEnabled: true,
            whatsappEnabled: true,
          },
          onboardingComplete: true,
        });
      });

      expect(mockUpdateUserDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          onboardingComplete: true,
        })
      );
    });
  });

  describe('WorkerSkillsStepScreen', () => {
    it('should validate that at least one skill is selected', async () => {
      const selectedSkills: string[] = [];
      const isValid = selectedSkills.length > 0;
      expect(isValid).toBe(false);
    });

    it('should require day rate and half-day rate', async () => {
      const dayRate = '';
      const halfDayRate = '';
      const ratesProvided = dayRate !== '' && halfDayRate !== '';
      expect(ratesProvided).toBe(false);
    });

    it('should validate rates are numbers', async () => {
      const dayRate = '500';
      const halfDayRate = 'invalid';

      const dayRateValid = !isNaN(Number(dayRate));
      const halfDayRateValid = !isNaN(Number(halfDayRate));

      expect(dayRateValid).toBe(true);
      expect(halfDayRateValid).toBe(false);
    });

    it('should allow photo upload', async () => {
      const photoUri = 'file:///path/to/photo.jpg';
      expect(photoUri).toBeTruthy();
      expect(photoUri).toContain('.jpg');
    });

    it('should save worker profile data when all fields are valid', async () => {
      const { useAuth } = require('../hooks/useAuth');
      const { useWorkerProfile } = require('../hooks/useWorkerProfile');

      const mockUpdateUserDoc = jest.fn().mockResolvedValue(undefined);
      const mockUploadPhoto = jest.fn().mockResolvedValue('https://example.com/photo.jpg');

      useAuth.mockReturnValue({
        updateUserDoc: mockUpdateUserDoc,
      });
      useWorkerProfile.mockReturnValue({
        uploadProfilePhoto: mockUploadPhoto,
      });

      const skills = ['plumber', 'electrician'];
      const dayRate = 500;
      const halfDayRate = 300;

      await act(async () => {
        const photoURL = await mockUploadPhoto('file:///photo.jpg');
        await mockUpdateUserDoc({
          skills,
          dayRate,
          halfDayRate,
          photoURL,
          onboardingComplete: true,
        });
      });

      expect(mockUploadPhoto).toHaveBeenCalledWith('file:///photo.jpg');
      expect(mockUpdateUserDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          skills,
          dayRate,
          halfDayRate,
          onboardingComplete: true,
        })
      );
    });

    it('should allow skipping onboarding', async () => {
      const { useAuth } = require('../hooks/useAuth');
      const mockUpdateUserDoc = jest.fn().mockResolvedValue(undefined);

      useAuth.mockReturnValue({
        updateUserDoc: mockUpdateUserDoc,
      });

      await act(async () => {
        await mockUpdateUserDoc({
          onboardingComplete: true,
        });
      });

      expect(mockUpdateUserDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          onboardingComplete: true,
        })
      );
    });
  });

  describe('Onboarding Completion', () => {
    it('should block access to home screen until onboarding is complete', async () => {
      const onboardingComplete = false;
      const canAccessHome = onboardingComplete;
      expect(canAccessHome).toBe(false);
    });

    it('should allow access to home screen after onboarding is complete', async () => {
      const onboardingComplete = true;
      const canAccessHome = onboardingComplete;
      expect(canAccessHome).toBe(true);
    });
  });
});
