import type { Project } from '../types';

const GITHUB_API_URL = 'https://api.github.com';

interface GithubRepo {
    id: number;
    name: string;
    description: string | null;
    language: string | null;
    html_url: string;
}

export const fetchGithubProjects = async (username: string): Promise<Project[]> => {
    if (!username) {
        return [];
    }
    try {
        const response = await fetch(`${GITHUB_API_URL}/users/${username}/repos?sort=pushed&per_page=25`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`GitHub user '${username}' not found.`);
            }
            throw new Error(`Failed to fetch repositories from GitHub. Status: ${response.status}`);
        }
        const repos: GithubRepo[] = await response.json();

        return repos.map(repo => ({
            id: repo.id.toString(),
            name: repo.name.replace(/[-_]/g, ' '), // Clean up repo name
            description: repo.description || 'No description provided.',
            technologies: repo.language ? [repo.language] : [],
            url: repo.html_url
        }));
    } catch (error) {
        console.error("Error fetching from GitHub:", error);
        throw error; // Re-throw to be caught by the caller
    }
};
