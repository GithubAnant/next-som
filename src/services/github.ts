import type { GitHubRepo, GitHubIssue, GitHubPR, AIResponse } from '../types';
import { cleanHeaderValue } from '../utils';

export class GitHubService {

    private token: string;
    constructor(token:string) {
      this.token = token;
    }

  async createRepository(repoData: AIResponse): Promise<GitHubRepo> {
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${cleanHeaderValue(this.token)}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Project-Next-App'
      },
      body: JSON.stringify({
        name: repoData.repo_name,
        description: repoData.description,
        private: false,
        auto_init: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create repository');
    }

    return await response.json();
  }

  async updateReadme(fullName: string, content: string, message: string): Promise<void> {
    const readmeResponse = await fetch(`https://api.github.com/repos/${fullName}/contents/README.md`, {
      headers: { 'Authorization': `token ${cleanHeaderValue(this.token)}` }
    });
    
    if (readmeResponse.ok) {
      const readmeData = await readmeResponse.json();
      
      await fetch(`https://api.github.com/repos/${fullName}/contents/README.md`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${cleanHeaderValue(this.token)}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          content: btoa(content),
          sha: readmeData.sha
        })
      });
    }
  }

  async createIssue(fullName: string, issueData: AIResponse): Promise<GitHubIssue> {
    const response = await fetch(`https://api.github.com/repos/${fullName}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${cleanHeaderValue(this.token)}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: issueData.title,
        body: issueData.body,
        labels: issueData.labels || [],
        assignees: issueData.assignees || []
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create issue');
    }

    return await response.json();
  }

  async getIssues(fullName: string): Promise<GitHubIssue[]> {
    const response = await fetch(`https://api.github.com/repos/${fullName}/issues`, {
      headers: { 'Authorization': `token ${cleanHeaderValue(this.token)}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch issues');
    }

    return await response.json();
  }

  async getPullRequests(fullName: string): Promise<GitHubPR[]> {
    const response = await fetch(`https://api.github.com/repos/${fullName}/pulls`, {
      headers: { 'Authorization': `token ${cleanHeaderValue(this.token)}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pull requests');
    }

    return await response.json();
  }

  async getRepository(owner: string, repoName: string): Promise<GitHubRepo> {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: { 'Authorization': `token ${cleanHeaderValue(this.token)}` }
    });

    if (!response.ok) {
      throw new Error('Repository not found');
    }

    return await response.json();
  }
}