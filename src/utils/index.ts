import type { RepoContext } from '../types/index.ts';

export const saveContext = (context: RepoContext): void => {
  localStorage.setItem('github_ai_context', JSON.stringify(context));
};

export const loadContext = (): RepoContext | null => {
  const saved = localStorage.getItem('github_ai_context');
  return saved ? JSON.parse(saved) as RepoContext : null;
};

export const cleanHeaderValue = (value: string): string => {
  return value
    .trim()
    .replace(/[^\x20-\x7E]/g, '')
    .substring(0, 200);
};

export const determineIntent = (userInput: string): string => {
  const text = userInput.toLowerCase();

  if (
    text.includes('view repo') || text.includes('show repo') || text.includes('open repo') ||
    text.includes('view my repo') || text.includes('list repos') || text.includes('see all repos')
    // ... rest of conditions
  ) {
    return 'view_repo';
  }

  if (
    text.includes('create repo') || text.includes('new project') || text.includes('make repo')
    // ... rest of conditions
  ) {
    return 'repo_creation';
  }

  // ... other conditions

  return 'general';
};