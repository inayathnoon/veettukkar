import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../hooks/useAuth';
import * as firebase from '../lib/firebase';

// All auth() calls return the same instance (closed over in the factory).
// PhoneAuthProvider lives as a static property on the auth function itself.
jest.mock('../lib/firebase', () => {
  const instance = {
    signInWithPhoneNumber: jest.fn(),
    signInWithCredential: jest.fn(),
    signOut: jest.fn(),
    currentUser: null as any,
    onAuthStateChanged: jest.fn(),
  };
  const authFn = jest.fn(() => instance);
  (authFn as any).PhoneAuthProvider = { credential: jest.fn() };

  return {
    auth: authFn,
    firestore: {
      Timestamp: {
        now: jest.fn(() => ({ toMillis: () => Date.now() })),
      },
    },
    collections: {
      users: jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn(),
          get: jest.fn(),
        })),
      })),
    },
  };
});

describe('useAuth', () => {
  // Convenience accessors — same objects every time due to closure above
  const authInstance = () => (firebase.auth as jest.Mock)();
  const phoneCredential = () => (firebase.auth as any).PhoneAuthProvider.credential as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Restore currentUser to null after any test that mutates it
    authInstance().currentUser = null;
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.authState.user).toBeNull();
    expect(result.current.phoneVerification.verificationId).toBeNull();
  });

  it('should handle phone number formatting for OTP', async () => {
    const instance = authInstance();
    instance.signInWithPhoneNumber.mockResolvedValue({ verificationId: 'test-verification-id' });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.sendOTP('9876543210');
    });

    expect(instance.signInWithPhoneNumber).toHaveBeenCalledWith('+919876543210', true);
  });

  it('should handle OTP sending error', async () => {
    const instance = authInstance();
    instance.signInWithPhoneNumber.mockRejectedValue(new Error('Too many requests'));

    const { result } = renderHook(() => useAuth());

    const sendResult = await act(async () => {
      return await result.current.sendOTP('9876543210');
    });

    expect(sendResult.success).toBe(false);
    expect(sendResult.error).toContain('Too many requests');
  });

  it('should verify OTP and sign in', async () => {
    const instance = authInstance();
    instance.signInWithPhoneNumber.mockResolvedValue({ verificationId: 'test-verification-id' });
    phoneCredential().mockReturnValue('test-credential');
    instance.signInWithCredential.mockResolvedValue({});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.sendOTP('9876543210');
    });

    const verifyResult = await act(async () => {
      return await result.current.verifyOTP('test-verification-id', '123456');
    });

    expect(verifyResult.success).toBe(true);
    expect(instance.signInWithCredential).toHaveBeenCalledWith('test-credential');
  });

  it('should handle OTP verification error', async () => {
    const instance = authInstance();
    phoneCredential().mockReturnValue('test-credential');
    instance.signInWithCredential.mockRejectedValue(new Error('Invalid OTP'));

    const { result } = renderHook(() => useAuth());

    const verifyResult = await act(async () => {
      return await result.current.verifyOTP('test-verification-id', '000000');
    });

    expect(verifyResult.success).toBe(false);
    expect(verifyResult.error).toContain('Invalid OTP');
  });

  it('should create user profile with role', async () => {
    const instance = authInstance();
    instance.currentUser = { uid: 'test-uid', phoneNumber: '+919876543210' };

    const mockUserDoc = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: jest.fn().mockReturnValue({
          uid: 'test-uid',
          role: 'worker',
          phone: '+919876543210',
          language: 'ml',
        }),
      }),
    };
    (firebase.collections.users as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue(mockUserDoc),
    });

    const { result } = renderHook(() => useAuth());

    const createResult = await act(async () => {
      return await result.current.createUserProfile('worker');
    });

    expect(createResult.success).toBe(true);
    expect(mockUserDoc.set).toHaveBeenCalled();
  });

  it('should logout user', async () => {
    const instance = authInstance();
    instance.signOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    const logoutResult = await act(async () => {
      return await result.current.logout();
    });

    expect(logoutResult.success).toBe(true);
    expect(instance.signOut).toHaveBeenCalled();
  });
});
