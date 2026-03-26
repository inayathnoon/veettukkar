import { renderHook, act } from '@testing-library/react-native';
import { useWorkerProfile } from '../hooks/useWorkerProfile';
import * as firebase from '../lib/firebase';

jest.mock('../lib/firebase', () => {
  const mockDoc = {
    set: jest.fn(),
    get: jest.fn(),
  };
  const mockCollection = { doc: jest.fn(() => mockDoc) };
  return {
    auth: jest.fn(() => ({
      currentUser: { uid: 'worker-uid', phoneNumber: '+919876543210' },
    })),
    storage: jest.fn(() => ({
      ref: jest.fn(() => ({
        putFile: jest.fn(() => {
          const task = {
            on: jest.fn(),
            then: jest.fn(),
          };
          return Object.assign(Promise.resolve(), task);
        }),
        getDownloadURL: jest.fn(() => Promise.resolve('https://storage.example.com/photo.jpg')),
      })),
    })),
    firestore: Object.assign(jest.fn(), {
      Timestamp: { now: jest.fn(() => ({ toMillis: () => Date.now() })) },
    }),
    collections: {
      users: jest.fn(() => mockCollection),
    },
  };
});

describe('useWorkerProfile', () => {
  const mockDocRef = () =>
    (firebase.collections.users as jest.Mock)().doc() as {
      set: jest.Mock;
      get: jest.Mock;
    };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useWorkerProfile());
    expect(result.current.profileState.profile).toBeNull();
    expect(result.current.profileState.loading).toBe(false);
  });

  it('loads profile from Firestore', async () => {
    const doc = mockDocRef();
    doc.get.mockResolvedValue({
      exists: true,
      data: () => ({
        uid: 'worker-uid',
        name: 'Rajan',
        skills: ['plumber'],
        dayRate: 500,
        halfDayRate: 300,
        role: 'worker',
      }),
    });

    const { result } = renderHook(() => useWorkerProfile());

    await act(async () => {
      await result.current.loadProfile();
    });

    expect(result.current.profileState.profile?.name).toBe('Rajan');
    expect(result.current.profileState.profile?.skills).toEqual(['plumber']);
  });

  it('saves worker profile', async () => {
    const doc = mockDocRef();
    const savedProfile = {
      uid: 'worker-uid',
      name: 'Rajan',
      skills: ['plumber', 'electrician'],
      dayRate: 600,
      halfDayRate: 350,
      role: 'worker',
    };
    doc.set.mockResolvedValue(undefined);
    doc.get.mockResolvedValue({ exists: true, data: () => savedProfile });

    const { result } = renderHook(() => useWorkerProfile());

    const saveResult = await act(async () => {
      return await result.current.saveProfile({
        name: 'Rajan',
        skills: ['plumber', 'electrician'],
        dayRate: 600,
        halfDayRate: 350,
        locationText: '',
      });
    });

    expect(saveResult.success).toBe(true);
    expect(doc.set).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Rajan', skills: ['plumber', 'electrician'] }),
      { merge: true }
    );
  });

  it('sets availableToday flag', async () => {
    const doc = mockDocRef();
    doc.set.mockResolvedValue(undefined);

    // Seed a profile so the state update works
    const { result } = renderHook(() => useWorkerProfile());
    await act(async () => {
      result.current.profileState.profile = {
        uid: 'worker-uid',
        name: 'Rajan',
        role: 'worker',
        phone: '+919876543210',
        language: 'ml',
        availableToday: false,
        createdAt: {} as any,
        updatedAt: {} as any,
      };
    });

    const toggleResult = await act(async () => {
      return await result.current.setAvailableToday(true);
    });

    expect(toggleResult.success).toBe(true);
    expect(doc.set).toHaveBeenCalledWith(
      expect.objectContaining({ availableToday: true }),
      { merge: true }
    );
  });

  it('handles save error', async () => {
    const doc = mockDocRef();
    doc.set.mockRejectedValue(new Error('Firestore write failed'));

    const { result } = renderHook(() => useWorkerProfile());

    const saveResult = await act(async () => {
      return await result.current.saveProfile({
        name: 'Test',
        skills: ['painter'],
        dayRate: 400,
        halfDayRate: 200,
        locationText: '',
      });
    });

    expect(saveResult.success).toBe(false);
    expect(saveResult.error).toContain('Firestore write failed');
  });
});
