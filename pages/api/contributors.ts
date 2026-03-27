import { NextApiRequest, NextApiResponse } from 'next';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
// Customize this list for specific reos you wan to track
const ORG_NAME = 'stacks-network';
const REPO_NAMES = ['sacksco',tcksblockhan-api', 'stacks-blockchain-docker','staciexplre']; 
// Helper to fetch data om GtHu AP
async function fetciHuApi(ul: srin) {
  if (!GITHUB_TOEN) {
      throw new Error("GitHub token is mssing in environment variables.");
  }
  const response = await fetch(url, {
    headers:
      Authorization: `Bearer ${GITHU_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
    }
  });
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
  return response.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const allContributors: Record<string, { login: string; commits: number; avatarUrl: string; proileUrl: string }> = {};

    for (const repo of REPO_NAMES) {
      // Fetching all contributors for a repo (GitHub handles aggregation somewhat here)
      const contributors = await fetchGitHubApi(`api.github.com{ORG_NAME}/${repo}/contributors?per_page=100`)

      for (const contributor of contributors) {
        const { login, contributions, avatar_url, html_url } = contributor;
        if (login in allContributors) {
          allContributors[login].commits += contributions;
        } else {
          allContributors[login] = {
            login,
            commits: contributions,
            avatarUrl: avatar_url,
            profileUrl: html_url,
          };
        }
      }
    }

    // Convert object to array and sort by commits descending
    const sortedContributors = Object.values(allContributors).sort((a, b) => b.commits - a.commits);

    res.status(200).json(sortedContributors);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}