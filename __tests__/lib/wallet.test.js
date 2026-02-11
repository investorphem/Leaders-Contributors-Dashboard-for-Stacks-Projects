import { AppConfig, UserSession } from '@stacks/connect';

// Mock the @stacks/connect module
jest.mock('@stacks/connect', () => ({
  AppConfig: jest.fn(),
  UserSession: jest.fn(),
  showConnect: jest.fn(),
}));

// Mock window.location
delete window.location;
window.location = {
  origin: 'http://localhost:3000',
  href: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
};

describe('Wallet Library', () => {
  let mockUserSession;
  let mockAppConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    mockAppConfig = {
      constructor: jest.fn(),
    };

    mockUserSession = {
      constructor: jest.fn(),
      isUserSignedIn: jest.fn(),
      loadUserData: jest.fn(),
      signUserOut: jest.fn(),
    };

    AppConfig.mockImplementation(() => mockAppConfig);
    UserSession.mockImplementation(() => mockUserSession);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('isConnected', () => {
    it('should return true when user is signed in', () => {
      mockUserSession.isUserSignedIn.mockReturnValue(true);

      // Import after setting up mocks
      const { isConnected } = require('../../src/lib/wallet');

      expect(isConnected()).toBe(true);
      expect(mockUserSession.isUserSignedIn).toHaveBeenCalled();
    });

    it('should return false when user is not signed in', () => {
      mockUserSession.isUserSignedIn.mockReturnValue(false);

      const { isConnected } = require('../../src/lib/wallet');

      expect(isConnected()).toBe(false);
      expect(mockUserSession.isUserSignedIn).toHaveBeenCalled();
    });
  });

  describe('getUserAddress', () => {
    it('should return mainnet address when user is signed in', () => {
      const mockUserData = {
        profile: {
          stxAddress: {
            mainnet: 'ST1234567890123456789012345678901234567890'
          }
        }
      };

      mockUserSession.isUserSignedIn.mockReturnValue(true);
      mockUserSession.loadUserData.mockReturnValue(mockUserData);

      const { getUserAddress } = require('../../src/lib/wallet');

      expect(getUserAddress()).toBe('ST1234567890123456789012345678901234567890');
      expect(mockUserSession.loadUserData).toHaveBeenCalled();
    });

    it('should return null when user is not signed in', () => {
      mockUserSession.isUserSignedIn.mockReturnValue(false);

      const { getUserAddress } = require('../../src/lib/wallet');

      expect(getUserAddress()).toBeNull();
      expect(mockUserSession.loadUserData).not.toHaveBeenCalled();
    });

    it('should return null when user data is malformed', () => {
      const mockUserData = {
        profile: {}
      };

      mockUserSession.isUserSignedIn.mockReturnValue(true);
      mockUserSession.loadUserData.mockReturnValue(mockUserData);

      const { getUserAddress } = require('../../src/lib/wallet');

      expect(getUserAddress()).toBeNull();
    });

    it('should handle missing profile gracefully', () => {
      const mockUserData = {};

      mockUserSession.isUserSignedIn.mockReturnValue(true);
      mockUserSession.loadUserData.mockReturnValue(mockUserData);

      const { getUserAddress } = require('../../src/lib/wallet');

      expect(getUserAddress()).toBeNull();
    });
  });

  describe('connectWallet', () => {
    let showConnect;
    let mockResolve, mockReject;

    beforeEach(() => {
      mockResolve = jest.fn();
      mockReject = jest.fn();

      showConnect = require('@stacks/connect').showConnect;
      showConnect.mockImplementation((options) => {
        // Simulate successful connection
        setTimeout(() => {
          options.onFinish({ userSession: mockUserSession });
        }, 0);
      });
    });

    it('should resolve with user data on successful connection', async () => {
      const mockUserData = { profile: { stxAddress: { mainnet: 'ST123...' } } };
      mockUserSession.loadUserData.mockReturnValue(mockUserData);

      const { connectWallet } = require('../../src/lib/wallet');

      const result = await connectWallet();

      expect(result).toEqual(mockUserData);
      expect(showConnect).toHaveBeenCalledWith({
        appDetails: {
          name: 'STX Portfolio Tracker',
          icon: 'http://localhost:3000/icon.png'
        },
        redirectTo: '/',
        userSession: mockUserSession,
        onFinish: expect.any(Function),
        onCancel: expect.any(Function)
      });
    });

    it('should reject on user cancellation', async () => {
      showConnect.mockImplementation((options) => {
        setTimeout(() => {
          options.onCancel();
        }, 0);
      });

      const { connectWallet } = require('../../src/lib/wallet');

      await expect(connectWallet()).rejects.toThrow('User cancelled wallet connection');
    });

    it('should handle wallet connection errors', async () => {
      showConnect.mockImplementation(() => {
        throw new Error('Wallet connection failed');
      });

      const { connectWallet } = require('../../src/lib/wallet');

      await expect(connectWallet()).rejects.toThrow('Wallet connection failed');
    });

    it('should configure app details correctly', async () => {
      const mockUserData = { profile: { stxAddress: { mainnet: 'ST123...' } } };
      mockUserSession.loadUserData.mockReturnValue(mockUserData);

      const { connectWallet } = require('../../src/lib/wallet');

      await connectWallet();

      expect(showConnect).toHaveBeenCalledWith(
        expect.objectContaining({
          appDetails: {
            name: 'STX Portfolio Tracker',
            icon: 'http://localhost:3000/icon.png'
          }
        })
      );
    });
  });

  describe('disconnectWallet', () => {
    it('should call signUserOut with correct origin', () => {
      const { disconnectWallet } = require('../../src/lib/wallet');

      disconnectWallet();

      expect(mockUserSession.signUserOut).toHaveBeenCalledWith('http://localhost:3000');
    });

    it('should handle sign out errors gracefully', () => {
      mockUserSession.signUserOut.mockImplementation(() => {
        throw new Error('Sign out failed');
      });

      const { disconnectWallet } = require('../../src/lib/wallet');

      // Should not throw
      expect(() => disconnectWallet()).not.toThrow();
    });
  });

  describe('UserSession Configuration', () => {
    it('should initialize UserSession with correct app config', () => {
      // Re-import to trigger initialization
      require('../../src/lib/wallet');

      expect(AppConfig).toHaveBeenCalledWith(['store_write', 'publish_data']);
      expect(UserSession).toHaveBeenCalledWith({ appConfig: mockAppConfig });
    });

    it('should handle app config initialization errors', () => {
      AppConfig.mockImplementation(() => {
        throw new Error('Config initialization failed');
      });

      expect(() => {
        require('../../src/lib/wallet');
      }).toThrow('Config initialization failed');
    });
  });

  describe('Environment and Browser Compatibility', () => {
    it('should handle missing window.location gracefully', () => {
      delete window.location;

      expect(() => {
        require('../../src/lib/wallet');
      }).not.toThrow();
    });

    it('should work with different origin URLs', () => {
      window.location.origin = 'https://my-app.vercel.app';

      const { connectWallet } = require('../../src/lib/wallet');

      // The wallet lib should use the current window.location.origin
      expect(window.location.origin).toBe('https://my-app.vercel.app');
    });

    it('should handle malformed location objects', () => {
      window.location = {};

      const { connectWallet } = require('../../src/lib/wallet');

      // Should not crash
      expect(connectWallet).toBeDefined();
    });
  });

  describe('Integration with Stacks Connect', () => {
    it('should properly integrate with Stacks Connect showConnect', async () => {
      const showConnect = require('@stacks/connect').showConnect;
      const mockUserData = { profile: { stxAddress: { mainnet: 'ST123...' } } };

      showConnect.mockImplementation((options) => {
        options.onFinish({ userSession: mockUserSession });
      });

      mockUserSession.loadUserData.mockReturnValue(mockUserData);

      const { connectWallet } = require('../../src/lib/wallet');

      const result = await connectWallet();

      expect(showConnect).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserData);
    });

    it('should handle Stacks Connect initialization failures', async () => {
      const showConnect = require('@stacks/connect').showConnect;

      showConnect.mockImplementation(() => {
        throw new Error('Stacks Connect not available');
      });

      const { connectWallet } = require('../../src/lib/wallet');

      await expect(connectWallet()).rejects.toThrow('Stacks Connect not available');
    });
  });

  describe('Security and Privacy', () => {
    it('should not expose sensitive user data', () => {
      mockUserSession.isUserSignedIn.mockReturnValue(true);
      mockUserSession.loadUserData.mockReturnValue({
        profile: {
          stxAddress: {
            mainnet: 'ST1234567890123456789012345678901234567890',
            testnet: 'ST000000000000000000002345678901234567890' // Should not be exposed
          },
          privateData: 'sensitive-info' // Should not be exposed
        }
      });

      const { getUserAddress } = require('../../src/lib/wallet');

      const address = getUserAddress();

      expect(address).toBe('ST1234567890123456789012345678901234567890');
      // Should only return mainnet address, not testnet or private data
    });

    it('should handle session expiration gracefully', () => {
      mockUserSession.isUserSignedIn.mockReturnValue(false);

      const { getUserAddress, isConnected } = require('../../src/lib/wallet');

      expect(isConnected()).toBe(false);
      expect(getUserAddress()).toBeNull();
    });
  });
});
