import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ContributorsDashboard from '../../pages/index';

// Mock Next.js Head component
jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="head">{children}</div>,
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('ContributorsDashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading message initially', () => {
      // Mock fetch to never resolve (loading state)
      global.fetch.mockImplementation(() => new Promise(() => {}));

      render(<ContributorsDashboard />);

      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('should not show content while loading', () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));

      render(<ContributorsDashboard />);

      expect(screen.queryByText('🚀 Stacks Project Leaders Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when fetch fails', async () => {
      const errorMessage = 'Failed to fetch contributors';
      global.fetch.mockRejectedValue(new Error(errorMessage));

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      });
    });

    it('should display custom error message', async () => {
      const customError = 'Network timeout';
      global.fetch.mockRejectedValue(new Error(customError));

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(`Error: ${customError}`)).toBeInTheDocument();
      });
    });

    it('should not show loading or content when error occurs', async () => {
      global.fetch.mockRejectedValue(new Error('API Error'));

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
        expect(screen.queryByText('🚀 Stacks Project Leaders Dashboard')).not.toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    const mockContributors = [
      {
        login: 'user1',
        commits: 150,
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
        profileUrl: 'https://github.com/user1'
      },
      {
        login: 'user2',
        commits: 120,
        avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4',
        profileUrl: 'https://github.com/user2'
      },
      {
        login: 'user3',
        commits: 90,
        avatarUrl: 'https://avatars.githubusercontent.com/u/3?v=4',
        profileUrl: 'https://github.com/user3'
      }
    ];

    beforeEach(() => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockContributors)
      });
    });

    it('should display dashboard title', async () => {
      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('🚀 Stacks Project Leaders Dashboard')).toBeInTheDocument();
      });
    });

    it('should display dashboard description', async () => {
      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Aggregated contributions across key Stacks Network repositories.')).toBeInTheDocument();
      });
    });

    it('should render contributor list', async () => {
      render(<ContributorsDashboard />);

      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
      });
    });

    it('should display all contributors with correct data', async () => {
      render(<ContributorsDashboard />);

      await waitFor(() => {
        mockContributors.forEach((contributor, index) => {
          expect(screen.getByText(`${index + 1}.`)).toBeInTheDocument();
          expect(screen.getByText(`@${contributor.login}`)).toBeInTheDocument();
          expect(screen.getByText(`${contributor.commits.toLocaleString()} commits`)).toBeInTheDocument();
        });
      });
    });

    it('should render contributor avatars with correct attributes', async () => {
      render(<ContributorsDashboard />);

      await waitFor(() => {
        const avatars = screen.getAllByRole('img');
        expect(avatars).toHaveLength(mockContributors.length);

        avatars.forEach((avatar, index) => {
          expect(avatar).toHaveAttribute('src', mockContributors[index].avatarUrl);
          expect(avatar).toHaveAttribute('alt', mockContributors[index].login);
          expect(avatar).toHaveClass('w-10', 'h-10', 'rounded-full', 'shadow');
        });
      });
    });

    it('should render contributor profile links with correct attributes', async () => {
      render(<ContributorsDashboard />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(mockContributors.length);

        links.forEach((link, index) => {
          expect(link).toHaveAttribute('href', mockContributors[index].profileUrl);
          expect(link).toHaveAttribute('target', '_blank');
          expect(link).toHaveAttribute('rel', 'noopener noreferrer');
          expect(link).toHaveClass('text-blue-600', 'hover:text-blue-800', 'hover:underline', 'font-medium');
        });
      });
    });

    it('should format commit numbers with locale string', async () => {
      const contributorsWithLargeNumbers = [
        {
          login: 'user1',
          commits: 1000,
          avatarUrl: 'https://example.com/avatar1.jpg',
          profileUrl: 'https://github.com/user1'
        },
        {
          login: 'user2',
          commits: 1000000,
          avatarUrl: 'https://example.com/avatar2.jpg',
          profileUrl: 'https://github.com/user2'
        }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(contributorsWithLargeNumbers)
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('1,000 commits')).toBeInTheDocument();
        expect(screen.getByText('1,000,000 commits')).toBeInTheDocument();
      });
    });

    it('should apply correct CSS classes to list items', async () => {
      render(<ContributorsDashboard />);

      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(mockContributors.length);

        listItems.forEach(item => {
          expect(item).toHaveClass(
            'flex', 'items-center', 'justify-between', 'p-4',
            'bg-gray-50', 'hover:bg-gray-100', 'rounded-md', 'shadow-sm',
            'transition', 'duration-150', 'ease-in-out'
          );
        });
      });
    });
  });

  describe('Head Component', () => {
    it('should render Head component with correct title', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        const head = screen.getByTestId('head');
        expect(head).toBeInTheDocument();
      });
    });

    it('should set correct page title', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Stacks Contributors Dashboard')).toBeInTheDocument();
      });
    });

    it('should set correct meta description', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Aggregated GitHub contributions for Stacks projects')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should call the correct API endpoint', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/contributors');
      });
    });

    it('should only call API once on mount', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle API response with ok: false', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error'
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Error: Failed to fetch contributors')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should handle empty contributor list', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('🚀 Stacks Project Leaders Dashboard')).toBeInTheDocument();
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(screen.queryAllByRole('listitem')).toHaveLength(0);
      });
    });
  });

  describe('Data Edge Cases', () => {
    it('should handle contributors with zero commits', async () => {
      const contributorsWithZeroCommits = [
        {
          login: 'inactive-user',
          commits: 0,
          avatarUrl: 'https://example.com/avatar.jpg',
          profileUrl: 'https://github.com/inactive-user'
        }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(contributorsWithZeroCommits)
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('0 commits')).toBeInTheDocument();
      });
    });

    it('should handle contributors with very long usernames', async () => {
      const contributorsWithLongNames = [
        {
          login: 'very-long-username-that-might-cause-layout-issues',
          commits: 50,
          avatarUrl: 'https://example.com/avatar.jpg',
          profileUrl: 'https://github.com/very-long-username'
        }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(contributorsWithLongNames)
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('@very-long-username-that-might-cause-layout-issues')).toBeInTheDocument();
      });
    });

    it('should handle special characters in usernames', async () => {
      const contributorsWithSpecialChars = [
        {
          login: 'user_with_underscores',
          commits: 25,
          avatarUrl: 'https://example.com/avatar.jpg',
          profileUrl: 'https://github.com/user_with_underscores'
        },
        {
          login: 'user-with-dashes',
          commits: 30,
          avatarUrl: 'https://example.com/avatar.jpg',
          profileUrl: 'https://github.com/user-with-dashes'
        }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(contributorsWithSpecialChars)
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('@user_with_underscores')).toBeInTheDocument();
        expect(screen.getByText('@user-with-dashes')).toBeInTheDocument();
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should fetch data on component mount', () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      render(<ContributorsDashboard />);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should not refetch data on re-render', () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      const { rerender } = render(<ContributorsDashboard />);

      expect(global.fetch).toHaveBeenCalledTimes(1);

      rerender(<ContributorsDashboard />);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('🚀 Stacks Project Leaders Dashboard');
      });
    });

    it('should have accessible links', async () => {
      const mockContributors = [
        {
          login: 'user1',
          commits: 50,
          avatarUrl: 'https://example.com/avatar1.jpg',
          profileUrl: 'https://github.com/user1'
        }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockContributors)
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        links.forEach(link => {
          expect(link).toHaveAttribute('target', '_blank');
          expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        });
      });
    });

    it('should have proper image alt text', async () => {
      const mockContributors = [
        {
          login: 'testuser',
          commits: 25,
          avatarUrl: 'https://example.com/avatar.jpg',
          profileUrl: 'https://github.com/testuser'
        }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockContributors)
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('alt', 'testuser');
      });
    });
  });

  describe('Performance', () => {
    it('should render large contributor lists efficiently', async () => {
      const largeContributorList = Array.from({ length: 100 }, (_, i) => ({
        login: `user${i}`,
        commits: Math.floor(Math.random() * 1000),
        avatarUrl: `https://example.com/avatar${i}.jpg`,
        profileUrl: `https://github.com/user${i}`
      }));

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(largeContributorList)
      });

      render(<ContributorsDashboard />);

      await waitFor(() => {
        expect(screen.getAllByRole('listitem')).toHaveLength(100);
      });
    });

    it('should handle rapid re-mounting', () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      const { unmount, rerender } = render(<ContributorsDashboard />);

      expect(global.fetch).toHaveBeenCalledTimes(1);

      unmount();
      rerender(<ContributorsDashboard />);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
