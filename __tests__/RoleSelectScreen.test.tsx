import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import RoleSelectScreen from '../app/(auth)/role-select';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
  }),
}));

// Mock useAuth hook
const mockCreateUserProfile = jest.fn();
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    createUserProfile: mockCreateUserProfile,
    authState: {
      user: null,
      loading: false,
      error: null,
    },
  }),
}));

describe('RoleSelectScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateUserProfile.mockResolvedValue({ success: true });
  });

  it('should render both role options', () => {
    render(<RoleSelectScreen />);

    expect(screen.getByText('auth.role_select.homeowner')).toBeTruthy();
    expect(screen.getByText('auth.role_select.worker')).toBeTruthy();
  });

  it('should call createUserProfile with homeowner role', async () => {
    render(<RoleSelectScreen />);

    const homeownerButton = screen.getByText('auth.role_select.homeowner');
    fireEvent.press(homeownerButton);

    await waitFor(() => {
      expect(mockCreateUserProfile).toHaveBeenCalledWith('homeowner');
    });
  });

  it('should call createUserProfile with worker role', async () => {
    render(<RoleSelectScreen />);

    const workerButton = screen.getByText('auth.role_select.worker');
    fireEvent.press(workerButton);

    await waitFor(() => {
      expect(mockCreateUserProfile).toHaveBeenCalledWith('worker');
    });
  });

  it('should navigate to homeowner home on homeowner selection', async () => {
    render(<RoleSelectScreen />);

    const homeownerButton = screen.getByText('auth.role_select.homeowner');
    fireEvent.press(homeownerButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(homeowner)');
    });
  });

  it('should navigate to worker home on worker selection', async () => {
    render(<RoleSelectScreen />);

    const workerButton = screen.getByText('auth.role_select.worker');
    fireEvent.press(workerButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(worker)');
    });
  });

  it('should handle creation error', async () => {
    mockCreateUserProfile.mockResolvedValue({
      success: false,
      error: 'Creation failed',
    });

    render(<RoleSelectScreen />);

    const homeownerButton = screen.getByText('auth.role_select.homeowner');
    fireEvent.press(homeownerButton);

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
