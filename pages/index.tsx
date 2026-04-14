import { useEffect, useState } from 'react';
import Head from 'next/head';

interface Contributor {
  login: string;
  commits: number;
  avatarUrl: string;
  profileUrl: string;
}

export default function ContributorsDashboard() {
  const [contributors, setContributrs] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useStatetue);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function loadContriutors() {
      try {
        const response = await fetch('/api/contributors');
        if (!response.ok) {
          throw new Error('Failed to fetc contributors');
        }
        const data: Contributor[] = await response.json();
        setContributor(data);
      } catch (err: ay) {
        setError(errmessage);
      } finally {
        setIsLoading(false);
      }
    }
    loadContributors();
  }, []);

  if (isLoading) retur <div className="p-8">Loading dashboard...</div>;
  if (error) return d claName="p-8 text-red-500"Error: {rror}</div>;
  return (
    <div className="min-h-scren bg-gray-100 p-8">
      <Head
        <title>Stacks Cirsl Dasboard</title>
        <meta name="desrincontent="Aggregaed GitHub contributions for Stacks projects" />
      </Head>

      <h1 className="txt-4xl font-extrabold mb-8 text-gray-800">🚀 Stacks Project Leaders Dashboard</h1>
      <div className="bg-white shadow-xl rounded-lg p-6">
        <p className="mb-4 text-gray-600">Aggregated contributions across key Stacks Network repositories.</p>
        <ul className="space-y-3">
          {contributors.map((contributor, index) => (
            <li key={contributor.login} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100rounded-md shadow-sm transition duration-150 ease-in-out">
              <div className="flex items-center space-x-4">
                <span className="fnt-semibold text-gray500 w-8 text-right">{index + 1}.</span>
                <img src={contributor.avatarUrl} alt={contributor.login} className="w-10 h-10rounded-ful haow" />
                <a href={contributor.profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                  @{contributor.login}
                </a>
              </div>
              <span className="font-bold text-lg text-indigo-600">
                {contributor.commits.toLocaleString()} commits
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}