import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth } from '../hooks/useAuth';
import * as firebase from '../lib/firebase';

// Mock Firebase modules
jest.mock('../lib/firebase', () => ({
  auth: jest.fn(() => ({
    signInWithPhoneNumber: jest.fn(),
    signInWithCredential: jest.fn(),
    signOut: jest.fn(),
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    PhoneAuthProvider: {
      credential: jest.fn(),
    },
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn(),
    Timestamp: {
      now: jest.fn(() => ({ toMillis: () => Date.now() })),
    },
  })),
  collections: {
    users: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
      })),
    })),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.authState.user).toBeNull();
    expect(result.current.phoneVerification.verificationId).toBeNull();
  });

  it('should handle phone number formatting for OTP', async () => {
    const { result } = renderHook(() => useAuth());
    const mockAuth = firebase.auth();

    (mockAuth.signInWithPhoneNumber as jest.Mock).mockResolvedValue({
      verificationId: 'test-verification-id',
    });

    await act(async () => {
      await result.current.sendOTP('9876543210');
    });

    expect(mockAuth.signInWithPhoneNumber).toHaveBeenCalledWith('+919876543210', true);
  });

  it('should handle OTP sending error', async () => {
    const { result } = renderHook(() => useAuth());
    const mockAuth = firebase.auth();

    const errorMessage = 'Too many requests';
    (mockAuth.signInWithPhoneNumber as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );

    const sendResult = await act(async () => {
      return await result.current.sendOTP('9876543210');
    });

    expect(sendResult.success).toBe(false);
    expect(sendResult.error).toContain('Too many requests');
  });

  it('should verify OTP and sign in', async () => {
    const { result } = renderHook(() => useAuth());
    const mockAuth = firebase.auth() as any;

    (mockAuth.signInWithPhoneNumber as jest.Mock).mockResolvedValue({
      verificationId: 'test-verification-id',
    });

    // Send OTP first
    await act(async () => {
      await result.current.sendOTP('9876543210');
    });

    // Verify OTP
    (mockAuth.PhoneAuthProvider.credential as jest.Mock).mockReturnValue('test-credential');
    (mockAuth.signInWithCredential as jest.Mock).mockResolvedValue({});

    const verifyResult = await act(async () => {
      return await result.current.verifyOTP('test-verification-id', '123456');
    });

    expect(verifyResult.success).toBe(true);
    expect(mockAuth.signInWithCredential).toHaveBeenCalledWith('test-credential');
  });

  it('should handle OTP verification error', async () => {
    const { result } = renderHook(() => useAuth());
    const mockAuth = firebase.auth() as any;

    (mockAuth.PhoneAuthProvider.credential as jest.Mock).mockReturnValue('test-credential');
    (mockAuth.signInWithCredential as jest.Mock).mockRejectedValue(
      new Error('Invalid OTP')
    );

    const verifyResult = await act(async () => {
      return await result.current.verifyOTP('test-verification-id', '000000');
    });

    expect(verifyResult.success).toBe(false);
    expect(verifyResult.error).toContain('Invalid OTP');
  });

  it('should create user profile with role', async () => {
    const { result } = renderHook(() => useAuth());
    const mockCollections = firebase.collections as any;
    const mockUserDoc = {
      set: jest.fn(),
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

    (mockCollections.users as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue(mockUserDoc),
    });

    // Mock auth current user
    const mockAuth = firebase.auth() as any;
    Object.defineProperty(mockAuth, 'currentUser', {
      value: { uid: 'test-uid', phoneNumber: '+919876543210' },
    });

    const createResult = await act(async () => {
      return await result.current.createUserProfile('worker');
    });

    expect(createResult.success).toBe(true);
    expect(mockUserDoc.set).toHaveBeenCalled();
  });

  it('should logout user', async () => {
    const { result } = renderHook(() => useAuth());
    const mockAuth = firebase.auth() as any;

    (mockAuth.signOut as jest.Mock).mockResolvedValue(undefined);

    const logoutResult = await act(async () => {
      return await result.current.logout();
    });

    expect(logoutResult.success).toBe(true);
    expect(mockAuth.signOut).toHaveBeenCalled();
  });
});
