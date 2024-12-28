import { GITHUB_API_URL } from "@/env";

export interface GitHubRelease {
  id: number;
  name: string;
  tag_name: string;
  published_at: string;
  body: string;
  html_url: string;
}

export const fetchGitHubReleases = async (): Promise<GitHubRelease[]> => {
  const response = await fetch(`${GITHUB_API_URL}/releases`);
  if (!response.ok) {
    throw new Error('Failed to fetch releases');
  }
  return response.json();
}; 