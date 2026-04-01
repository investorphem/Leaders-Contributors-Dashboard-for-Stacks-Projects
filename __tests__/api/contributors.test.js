const { createMocks } = require('node-mocks-http');
const handler = require('../../pages/api/contributors').default;

// Mock the fetch function
global.fetch = jest.fn();

describe('/api/contributors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('HTTP Method Validation', () => {
    it('should return 405 for non-GET requests', async () => {
      const { req, res } = createMocks({
        method: 'POST',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getData()).toBe('');
    });

    it('should accept GET requests', async () => {
      const mockContributors = [
        {
          login: 'user1',
          contributions: 50,
          avatar_url: 'https://example.com/avatar1.jpg',
          html_url: 'https://github.com/user1'
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContributors)
      });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe('GitHub API Integration', () => {
    it('should fetch contributors from all configured repositories', async () => {
      const mockContributors = [
        {
          login: 'user1',
          contributions: 50,
          avatar_url: 'https://example.com/avatar1.jpg',
          html_url: 'https://github.com/user1'
        }
      ];

      // Mock successful responses for all repositories
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockContributors)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(global.fetch).toHaveBeenCalledTimes(4);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/stacks-network/stacks-core/contributors?per_page=100',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-github-token',
            'X-GitHub-Api-Version': '2022-11-28',
          }),
        })
      );
    });

    it('should aggregate contributions from multiple repositories', async () => {
      const repo1Contributors = [
        {
          login: 'user1',
          contributions: 30,
          avatar_url: 'https://example.com/avatar1.jpg',
          html_url: 'https://github.com/user1'
        },
        {
          login: 'user2',
          contributions: 20,
          avatar_url: 'https://example.com/avatar2.jpg',
          html_url: 'https://github.com/user2'
        }
      ];

      const repo2Contributors = [
        {
          login: 'user1',
          contributions: 25,
          avatar_url: 'https://example.com/avatar1.jpg',
          html_url: 'https://github.com/user1'
        },
        {
          login: 'user3',
          contributions: 15,
          avatar_url: 'https://example.com/avatar3.jpg',
          html_url: 'https://github.com/user3'
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(repo1Contributors)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(repo2Contributors)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());

      // user1 should have combined contributions (30 + 25 = 55)
      const user1 = responseData.find(u => u.login === 'user1');
      expect(user1.commits).toBe(55);

      // All unique users should be present
      expect(responseData).toHaveLength(3);
      expect(responseData.map(u => u.login)).toEqual(
        expect.arrayContaining(['user1', 'user2', 'user3'])
      );
    });

    it('should sort contributors by commit count descending', async () => {
      const mockContributors = [
        {
          login: 'user1',
          contributions: 10,
          avatar_url: 'https://example.com/avatar1.jpg',
          html_url: 'https://github.com/user1'
        },
        {
          login: 'user2',
          contributions: 50,
          avatar_url: 'https://example.com/avatar2.jpg',
          html_url: 'https://github.com/user2'
        },
        {
          login: 'user3',
          contributions: 30,
          avatar_url: 'https://example.com/avatar3.jpg',
          html_url: 'https://github.com/user3'
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockContributors)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());

      // Should be sorted by commits descending
      expect(responseData[0].login).toBe('user2'); // 50 commits
      expect(responseData[1].login).toBe('user3'); // 30 commits
      expect(responseData[2].login).toBe('user1'); // 10 commits

      expect(responseData[0].commits).toBe(50);
      expect(responseData[1].commits).toBe(30);
      expect(responseData[2].commits).toBe(10);
    });

    it('should handle GitHub API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.message).toBe('Network error');
    });

    it('should handle GitHub API rate limiting', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'API rate limit exceeded'
      });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.message).toContain('GitHub API error');
    });

    it('should handle missing GitHub token', async () => {
      // Temporarily remove the token
      const originalToken = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.message).toBe('GitHub token is missing in environment variables.');

      // Restore the token
      process.env.GITHUB_TOKEN = originalToken;
    });
  });

  describe('Data Transformation', () => {
    it('should transform GitHub API response to expected format', async () => {
      const mockContributors = [
        {
          login: 'testuser',
          contributions: 42,
          avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
          html_url: 'https://github.com/testuser'
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockContributors)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());

      expect(responseData).toHaveLength(1);
      expect(responseData[0]).toEqual({
        login: 'testuser',
        commits: 42,
        avatarUrl: 'https://avatars.githubusercontent.com/u/12345?v=4',
        profileUrl: 'https://github.com/testuser'
      });
    });

    it('should handle empty contributor lists', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual([]);
    });

    it('should handle contributors with zero contributions', async () => {
      const mockContributors = [
        {
          login: 'inactive-user',
          contributions: 0,
          avatar_url: 'https://example.com/avatar.jpg',
          html_url: 'https://github.com/inactive-user'
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockContributors)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData[0].commits).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed GitHub API responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' })
      });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      // Should not crash, but may return empty or handle gracefully
      expect(res._getStatusCode()).toBe(200);
    });

    it('should handle network timeouts', async () => {
      global.fetch.mockImplementationOnce(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
      );

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });

    it('should handle partial repository failures', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            {
              login: 'user1',
              contributions: 10,
              avatar_url: 'https://example.com/avatar1.jpg',
              html_url: 'https://github.com/user1'
            }
          ])
        })
        .mockRejectedValueOnce(new Error('Repository not found'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            {
              login: 'user2',
              contributions: 20,
              avatar_url: 'https://example.com/avatar2.jpg',
              html_url: 'https://github.com/user2'
            }
          ])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large contributor datasets', async () => {
      const largeContributorList = Array.from({ length: 100 }, (_, i) => ({
        login: `user${i}`,
        contributions: Math.floor(Math.random() * 1000),
        avatar_url: `https://example.com/avatar${i}.jpg`,
        html_url: `https://github.com/user${i}`
      }));

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(largeContributorList)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toHaveLength(100);
    });

    it('should handle concurrent API calls efficiently', async () => {
      const mockContributors = [
        {
          login: 'user1',
          contributions: 50,
          avatar_url: 'https://example.com/avatar1.jpg',
          html_url: 'https://github.com/user1'
        }
      ];

      // All repositories return the same data
      for (let i = 0; i < 4; i++) {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockContributors)
        });
      }

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());

      // user1 should have contributions from all 4 repositories
      expect(responseData[0].commits).toBe(200); // 50 * 4
    });
  });
});
