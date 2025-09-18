export interface Integration {
  name: string;
  icon: string;
  color: string;
  connected: boolean;
}

export interface RepoCreated {
  html_url: string;
  full_name: string;
  name: string;
  owner: {
    login: string;
  };
}

export interface RepoContext {
  repo_name: string;
  repo_url: string;
  owner: string;
  created_at: string;
  full_name: string;
}

export interface AIResponse {
  action: 'create_repo' | 'edit_readme' | 'create_issue' | 'view_issues' | 'view_prs' | 'view_repo' | 'general_help';
  repo_name?: string;
  owner?: string;
  description?: string;
  readme_content?: string;
  suggested_files?: string[];
  tech_stack?: string[];
  content?: string;
  response?: string;
  change_summary?: string;
  title?: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  owner: {
    login: string;
  };
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  created_at: string;
  html_url: string;
  body: string;
}

export interface GitHubPR {
  number: number;
  title: string;
  state: string;
  created_at: string;
  html_url: string;
  user: {
    login: string;
  };
}