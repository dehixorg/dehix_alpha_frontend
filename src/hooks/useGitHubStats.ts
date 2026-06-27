import { useState, useEffect, useCallback, useRef } from 'react';

export interface GitHubStats {
  username: string;
  avatarUrl: string;
  bio: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  topLanguages: { name: string; count: number; color: string }[];
  recentCommits: number;
  memberSince: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Lua: '#000080',
  Scala: '#c22d40',
  R: '#198CE7',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};

const DEFAULT_COLOR = '#8b949e';

export function useGitHubStats(token: string | null, username: string | null) {
  const [data, setData] = useState<GitHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchStats = useCallback(async () => {
    if (!token || !username) return;
    if (hasFetched.current) return;

    hasFetched.current = true;
    setIsLoading(true);
    setError(null);

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    };

    try {
      // Fetch profile and repos in parallel
      const [profileRes, reposRes] = await Promise.all([
        fetch('https://api.github.com/user', { headers }),
        fetch(
          `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed&type=owner`,
          { headers },
        ),
      ]);

      if (!profileRes.ok) {
        throw new Error(`Failed to fetch profile: ${profileRes.status}`);
      }

      const profile = await profileRes.json();
      const repos = reposRes.ok ? await reposRes.json() : [];

      // Calculate stars and forks
      let totalStars = 0;
      let totalForks = 0;
      const langMap: Record<string, number> = {};

      if (Array.isArray(repos)) {
        for (const repo of repos) {
          totalStars += repo.stargazers_count || 0;
          totalForks += repo.forks_count || 0;
          if (repo.language) {
            langMap[repo.language] = (langMap[repo.language] || 0) + 1;
          }
        }
      }

      // Sort languages by count
      const topLanguages = Object.entries(langMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([name, count]) => ({
          name,
          count,
          color: LANGUAGE_COLORS[name] || DEFAULT_COLOR,
        }));

      // Fetch recent events for commit count
      let recentCommits = 0;
      try {
        const eventsRes = await fetch(
          `https://api.github.com/users/${username}/events?per_page=100`,
          { headers },
        );
        if (eventsRes.ok) {
          const events = await eventsRes.json();
          if (Array.isArray(events)) {
            for (const event of events) {
              if (event.type === 'PushEvent' && event.payload?.commits) {
                recentCommits += event.payload.commits.length;
              }
            }
          }
        }
      } catch {
        // Events API failure is non-critical
      }

      // Fetch total commit count via search API
      let totalCommits = 0;
      try {
        const searchRes = await fetch(
          `https://api.github.com/search/commits?q=author:${username}&per_page=1`,
          {
            headers: {
              ...headers,
              Accept: 'application/vnd.github.cloak-preview+json',
            },
          },
        );
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          totalCommits = searchData.total_count || 0;
        }
      } catch {
        // Search API failure is non-critical
      }

      const stats: GitHubStats = {
        username: profile.login,
        avatarUrl: profile.avatar_url,
        bio: profile.bio || '',
        profileUrl: profile.html_url,
        publicRepos: profile.public_repos || 0,
        followers: profile.followers || 0,
        following: profile.following || 0,
        totalStars,
        totalForks,
        totalCommits,
        topLanguages,
        recentCommits,
        memberSince: profile.created_at
          ? new Date(profile.created_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })
          : '',
      };

      setData(stats);
    } catch (err: any) {
      console.error('GitHub stats fetch error:', err);
      setError(err.message || 'Failed to fetch GitHub stats');
    } finally {
      setIsLoading(false);
    }
  }, [token, username]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
    hasFetched.current = false;
    fetchStats();
  }, [fetchStats]);

  return { data, isLoading, error, refetch };
}
