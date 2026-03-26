import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import LoginScreen from '../app/(auth)/index';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock useAuth hook
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    phoneVerification: {
      loading: false,
      error: null,
      verificationId: null,
    },
    sendOTP: jest.fn(() => ({ success: true, verificationId: 'test-id' })),
    verifyOTP: jest.fn(() => ({ success: true })),
  }),
}));

describe('LoginScreen', () => {
  it('should render phone input initially', () => {
    render(<LoginScreen />);

    const phoneInput = screen.getByPlaceholderText('auth.login.phone_placeholder');
    expect(phoneInput).toBeTruthy();
  });

  it('should show OTP input after sending OTP', async () => {
    const { getByPlaceholderText } = render(<LoginScreen />);

    const phoneInput = getByPlaceholderText('auth.login.phone_placeholder');
    fireEvent.changeText(phoneInput, '9876543210');

    const sendButton = screen.getByText('auth.login.send_otp');
    fireEvent.press(sendButton);

    await waitFor(() => {
      const otpInput = getByPlaceholderText('000000');
      expect(otpInput).toBeTruthy();
    });
  });

  it('should disable button while loading', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const phoneInput = getByPlaceholderText('auth.login.phone_placeholder');
    fireEvent.changeText(phoneInput, '9876543210');

    const sendButton = getByText('auth.login.send_otp');
    expect(sendButton).not.toBeDisabled();
  });

  it('should show resend button on OTP screen', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const phoneInput = getByPlaceholderText('auth.login.phone_placeholder');
    fireEvent.changeText(phoneInput, '9876543210');

    const sendButton = getByText('auth.login.send_otp');
    fireEvent.press(sendButton);

    await waitFor(() => {
      const resendButton = getByText('auth.login.resend');
      expect(resendButton).toBeTruthy();
    });
  });
});
