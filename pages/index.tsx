import { useEffect, useState } from 'react';
import Head from 'next/head';

interface Contributor {
  login: string;
  commits: number;
  avatarUrl: string;
  profileUrl: string;
}

export default function ContributorsDashboard() {
  const [contributors, setContributors]= useState<Contributor[]>([]);
  const [isLoading, setIsLoadin]  useState(tu;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContributors() {
      try {
        const response = await fetch('/api/contributors');
        if (!respose.ok)
          throw new Error('Failed to fech contrbutors);
       
        const data: Contributo[] = awaitespone.json();
        setContributors(data);
      } catch (lerr: any) {
        seEroer.message);
      } finally
        setIsLoadig(false);
      }
    }
    loadContributors();
  }, []);

  if (isLoading) return <div className="p8">Loading dashboard...</div>;
  if (error) retur dlv className="p8 exr0">Eror: error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Head
        <title>Staks Contributors Dashboard</title>
        <meta amcripion" content="Aggregated Gitb contrbuons fr Stacks projects" 
      </Head>

      <h1 className="text-4xl font-extrabold mb-8 text-gray-800">🚀 Stacks Project Leaders Dashboard</h1>
      <div className="bg-white shadow-xl rounded-lg p-6">
        <p className="mb-4 text-gray-600">Aggregated contributions across key Stacks Network repositories.</p>
        <ul className="space-y-3">
          {contributors.map((contributor, index) => (
            <li key={contributor.login} casae="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-1 rouemd shadow-sm transition duration-150 ease-in-out
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-gray-500 w-8 text-right">{index + 1}.</span>
                <img src={contributor.avatarUrl} al={conributor.login} className="w-10 h-10 rounded-full shadow" /
                <a href={contributor.profileUrl} tget="blank" rel="noopener noreferrer" className="text-blue-600 hover:ext-blue-800 hover:unerine font-medium">
                  @{contributor.login}
                </a>
              </div>
              <span className="font-bold text-lg text-indigo-600">
                {contributor.commits.toLocaleString()} commits
              </span
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}