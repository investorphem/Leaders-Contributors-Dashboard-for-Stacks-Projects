import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectWallet from '../../src/components/ConnectWallet';

// Mock the wallet library
jest.mock('../../src/lib/wallet', () => ({
  connectWallet: jest.fn(),
  disconnectWallet: jest.fn(),
  getUserAddress: jest.fn(),
  isConnected: jest.fn(),
}));

describe('ConnectWallet Component', () => {
  const mockConnectWallet = require('../../src/lib/wallet').connectWallet;
  const mockDisconnectWallet = require('../../src/lib/wallet').disconnectWallet;
  const mockGetUserAddress = require('../../src/lib/wallet').getUserAddress;
  const mockIsConnected = require('../../src/lib/wallet').isConnected;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial State - Not Connected', () => {
    beforeEach(() => {
      mockIsConnected.mockReturnValue(false);
      mockGetUserAddress.mockReturnValue(null);
    });

    it('should render connect button when not connected', () => {
      render(<ConnectWallet />);

      const connectButton = screen.getByRole('button', { name: /connect wallet/i });
      expect(connectButton).toBeInTheDocument();
      expect(connectButton).not.toBeDisabled();
    });

    it('should display correct button text when not connected', () => {
      render(<ConnectWallet />);

      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });

    it('should have correct styling for connect button', () => {
      render(<ConnectWallet />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'bg-indigo-600', 'text-white', 'rounded');
    });
  });

  describe('Wallet Connection Flow', () => {
    beforeEach(() => {
      mockIsConnected.mockReturnValue(false);
      mockGetUserAddress.mockReturnValue(null);
    });

    it('should call connectWallet when connect button is clicked', async () => {
      const user = userEvent.setup();
      const mockUserData = {
        profile: {
          stxAddress: {
            mainnet: 'ST1234567890123456789012345678901234567890'
          }
        }
      };

      mockConnectWallet.mockResolvedValue(mockUserData);

      render(<ConnectWallet />);

      const connectButton = screen.getByRole('button', { name: /connect wallet/i });
      await user.click(connectButton);

      expect(mockConnectWallet).toHaveBeenCalledTimes(1);
    });

    it('should show loading state during connection', async () => {
      const user = userEvent.setup();

      // Mock a delayed connection
      mockConnectWallet.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({}), 100))
      );

      render(<ConnectWallet />);

      const connectButton = screen.getByRole('button');
      await user.click(connectButton);

      // Button should be disabled during loading
      expect(connectButton).toBeDisabled();
      expect(screen.getByText('Connecting…')).toBeInTheDocument();
    });

    it('should update state after successful connection', async () => {
      const user = userEvent.setup();
      const mockUserData = {
        profile: {
          stxAddress: {
            mainnet: 'ST1234567890123456789012345678901234567890'
          }
        }
      };

      mockConnectWallet.mockResolvedValue(mockUserData);
      mockIsConnected.mockReturnValue(true);
      mockGetUserAddress.mockReturnValue('ST1234567890123456789012345678901234567890');

      render(<ConnectWallet />);

      const connectButton = screen.getByRole('button');
      await user.click(connectButton);

      // Wait for state update
      await waitFor(() => {
        expect(screen.getByText('Disconnect (ST123…7890)')).toBeInTheDocument();
      });
    });

    it('should handle connection errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockConnectWallet.mockRejectedValue(new Error('Connection failed'));

      // Mock alert
      global.alert = jest.fn();

      render(<ConnectWallet />);

      const connectButton = screen.getByRole('button');
      await user.click(connectButton);

      expect(global.alert).toHaveBeenCalledWith('Connection failed');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle user cancellation', async () => {
      const user = userEvent.setup();

      mockConnectWallet.mockRejectedValue(new Error('User cancelled wallet connection'));

      render(<ConnectWallet />);

      const connectButton = screen.getByRole('button');
      await user.click(connectButton);

      // Should not show error alert for cancellation
      expect(global.alert).not.toHaveBeenCalled();
    });
  });

  describe('Connected State', () => {
    beforeEach(() => {
      mockIsConnected.mockReturnValue(true);
      mockGetUserAddress.mockReturnValue('ST1234567890123456789012345678901234567890');
    });

    it('should render disconnect button when connected', () => {
      render(<ConnectWallet />);

      const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
      expect(disconnectButton).toBeInTheDocument();
    });

    it('should display truncated address in disconnect button', () => {
      render(<ConnectWallet />);

      expect(screen.getByText('Disconnect (ST123…7890)')).toBeInTheDocument();
    });

    it('should have correct styling for disconnect button', () => {
      render(<ConnectWallet />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'bg-red-600', 'text-white', 'rounded');
    });

    it('should call disconnectWallet when disconnect button is clicked', async () => {
      const user = userEvent.setup();

      render(<ConnectWallet />);

      const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
      await user.click(disconnectButton);

      expect(mockDisconnectWallet).toHaveBeenCalledTimes(1);
    });

    it('should update state after disconnection', async () => {
      const user = userEvent.setup();

      // Start connected
      mockIsConnected.mockReturnValue(true);
      mockGetUserAddress.mockReturnValue('ST1234567890123456789012345678901234567890');

      const { rerender } = render(<ConnectWallet />);

      expect(screen.getByText('Disconnect (ST123…7890)')).toBeInTheDocument();

      // Simulate disconnection
      mockIsConnected.mockReturnValue(false);
      mockGetUserAddress.mockReturnValue(null);

      // Click disconnect
      const disconnectButton = screen.getByRole('button');
      await user.click(disconnectButton);

      // Rerender to simulate state change
      rerender(<ConnectWallet />);

      await waitFor(() => {
        expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
      });
    });
  });

  describe('Address Formatting', () => {
    it('should truncate long addresses correctly', () => {
      mockIsConnected.mockReturnValue(true);
      mockGetUserAddress.mockReturnValue('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');

      render(<ConnectWallet />);

      expect(screen.getByText('Disconnect (ST1PQ…PGZGM)')).toBeInTheDocument();
    });

    it('should handle short addresses', () => {
      mockIsConnected.mockReturnValue(true);
      mockGetUserAddress.mockReturnValue('ST123');

      render(<ConnectWallet />);

      expect(screen.getByText('Disconnect (ST123)')).toBeInTheDocument();
    });

    it('should handle empty addresses gracefully', () => {
      mockIsConnected.mockReturnValue(true);
      mockGetUserAddress.mockReturnValue('');

      render(<ConnectWallet />);

      expect(screen.getByText('Disconnect ()')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('should check connection status on mount', () => {
      render(<ConnectWallet />);

      expect(mockIsConnected).toHaveBeenCalled();
      expect(mockGetUserAddress).toHaveBeenCalled();
    });

    it('should handle component unmounting gracefully', () => {
      const { unmount } = render(<ConnectWallet />);

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle wallet library errors', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockConnectWallet.mockRejectedValue(new Error('Wallet library error'));
      global.alert = jest.fn();

      render(<ConnectWallet />);

      const connectButton = screen.getByRole('button');
      await user.click(connectButton);

      expect(global.alert).toHaveBeenCalledWith('Wallet library error');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle malformed user data', async () => {
      const user = userEvent.setup();

      mockConnectWallet.mockResolvedValue(null);
      mockIsConnected.mockReturnValue(true);
      mockGetUserAddress.mockReturnValue(null);

      render(<ConnectWallet />);

      const connectButton = screen.getByRole('button');
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<ConnectWallet />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      mockConnectWallet.mockResolvedValue({});

      render(<ConnectWallet />);

      const button = screen.getByRole('button');

      // Tab to button
      await user.tab();
      expect(button).toHaveFocus();

      // Press Enter
      await user.keyboard('{Enter}');
      expect(mockConnectWallet).toHaveBeenCalled();
    });
  });

  describe('UI States and Transitions', () => {
    it('should transition from loading back to connect state on error', async () => {
      const user = userEvent.setup();

      mockConnectWallet.mockRejectedValue(new Error('Connection failed'));

      render(<ConnectWallet />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Should show loading state
      expect(button).toBeDisabled();
      expect(screen.getByText('Connecting…')).toBeInTheDocument();

      // After error, should return to normal state
      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
      });
    });

    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup();

      mockConnectWallet.mockResolvedValue({});

      render(<ConnectWallet />);

      const button = screen.getByRole('button');

      // Click multiple times rapidly
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should only call connect once due to loading state
      expect(mockConnectWallet).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration with Wallet Library', () => {
    it('should use wallet library functions correctly', async () => {
      const user = userEvent.setup();
      const mockUserData = {
        profile: {
          stxAddress: {
            mainnet: 'ST1234567890123456789012345678901234567890'
          }
        }
      };

      mockConnectWallet.mockResolvedValue(mockUserData);

      render(<ConnectWallet />);

      const connectButton = screen.getByRole('button');
      await user.click(connectButton);

      expect(mockConnectWallet).toHaveBeenCalledTimes(1);

      // Simulate state change
      mockIsConnected.mockReturnValue(true);
      mockGetUserAddress.mockReturnValue('ST1234567890123456789012345678901234567890');

      await waitFor(() => {
        const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
        expect(disconnectButton).toBeInTheDocument();
      });

      const disconnectButton = screen.getByRole('button');
      await user.click(disconnectButton);

      expect(mockDisconnectWallet).toHaveBeenCalledTimes(1);
    });
  });
});
