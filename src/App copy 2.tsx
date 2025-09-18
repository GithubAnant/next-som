import React, { useState } from "react";
import { Search, Zap, X, MoreHorizontal, GitBranch, Plus ,Github} from "lucide-react";

interface Integration {
  name: string;
  icon: string;
  color: string;
  connected: boolean;
}

const ProjectNext: React.FC = () => {
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showOpenRouterModal, setShowOpenRouterModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Meta Llama 405B");

  interface RepoCreated {
    html_url: string;
    full_name: string;
    name: string;
    owner: {
      login: string;
    };
  }
  const [repoCreated, setRepoCreated] = useState<RepoCreated | null>(null);

  // Mock integrations - using Lucide icons as fallback
  const integrations: Integration[] = [
    { name: "GitHub", icon: "github", color: "#181717", connected: false },
    { name: "OpenRouter", icon: "zap", color: "#FF6B35", connected: false },
  ];

  // Use local state for API key, fallback to environment variable
  const apiKey = (openRouterKey && openRouterKey.trim()) || import.meta.env.VITE_OPENROUTER_KEY;


  const handleModelSelect = (model: string) => {
  setSelectedModel(model);
  setShowModelPicker(false);
  // call your function here to update the actual backend or context

};

  const handleConnectTools = () => {
    setShowIntegrations(true);
  };

  const toggleIntegration = (index: number) => {
    if (integrations[index].name === "GitHub") {
      setShowGitHubModal(true);
      setShowIntegrations(false);
    } else if (integrations[index].name === "OpenRouter") {
      setShowOpenRouterModal(true);
      setShowIntegrations(false);
    } else {
      console.log(`Toggle integration: ${integrations[index].name}`);
    }
  };

// Enhanced GitHub AI Assistant with system prompts and context memory - TypeScript

interface RepoContext {
  repo_name: string;
  repo_url: string;
  owner: string;
  created_at: string;
  full_name: string;
}

interface AIResponse {
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

interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  owner: {
    login: string;
  };
}

interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  created_at: string;
  html_url: string;
  body: string;
}

interface GitHubPR {
  number: number;
  title: string;
  state: string;
  created_at: string;
  html_url: string;
  user: {
    login: string;
  };
}

const SYSTEM_PROMPTS = {

  repo_creation: `You are a GitHub repository creation assistant. ONLY respond with valid JSON in this EXACT format with NO additional text, markdown, or explanations:
{
  "action": "create_repo",
  "repo_name": "kebab-case-name",
  "description": "Brief 1-2 sentence description",
  "readme_content": "Complete markdown README content",
  "suggested_files": ["file1.js", "file2.md"],
  "tech_stack": ["javascript", "react", "node"]
}`,

  readme_edit: `You are a README editor assistant. ONLY respond with valid JSON in this EXACT format with NO additional text, markdown, or explanations:
{
  "action": "edit_readme",
  "content": "Complete new markdown README content",
  "change_summary": "Brief description of what was changed"
}`,

  issue_creation: `You are a GitHub issue creation assistant. ONLY respond with valid JSON in this EXACT format with NO additional text, markdown, or explanations:
{
  "action": "create_issue",
  "title": "Clear, descriptive issue title",
  "body": "Detailed issue description with steps to reproduce if it's a bug",
  "labels": ["bug", "enhancement", "documentation"],
  "assignees": []
}`,

  view_repo: `You are a GitHub repository viewer assistant. ONLY respond with valid JSON in this EXACT format with NO additional text, markdown, or explanations:
{
  "action": "view_repo",
  "owner": "username",
  "repo_name": "repository-name"
}`,

  general: `You are a helpful GitHub assistant. Respond with plain text (NOT JSON) to help the user with their GitHub needs. Available actions include: creating repositories, editing README files, creating issues, viewing issues, viewing pull requests, and viewing repositories. Ask the user what they'd like to do.`
};

// Context memory management
const saveContext = (context: RepoContext): void => {
  localStorage.setItem('github_ai_context', JSON.stringify(context));
};

const loadContext = (): RepoContext | null => {
  const saved = localStorage.getItem('github_ai_context');
  return saved ? JSON.parse(saved) as RepoContext : null;
};

// Helper function to clean headers for ISO-8859-1 compatibility
const cleanHeaderValue = (value: string): string => {
  return value
    .trim()
    .replace(/[^\x20-\x7E]/g, '') // Remove non-ASCII characters
    .substring(0, 200); // Limit length
};

// const clearContext = (): void => {
//   localStorage.removeItem('github_ai_context');
// };
const handleSearch = async (): Promise<void> => {
  if (!searchValue.trim()) return;

  // Check if API key is available
  if (!apiKey) {
    setResponse("Please configure your OpenRouter API key first. Click the OpenRouter integration to set it up.");
    return;
  }

  setIsLoading(true);
  setResponse("");
  setRepoCreated(null);

  try {
    const context = loadContext();

    // Determine intent from user input
    const intent = determineIntent(searchValue.toLowerCase());
    const systemPrompt =
      SYSTEM_PROMPTS[intent as keyof typeof SYSTEM_PROMPTS] ||
      SYSTEM_PROMPTS.general;

    // Build context-aware prompt
    const contextInfo = context
      ? `\n\nCurrent context: You are working with repository "${context.repo_name}" (${context.repo_url}). Owner: ${context.owner}. Created: ${context.created_at}.`
      : "";

    // Use whatever model user selected (fallback if none)
    const modelToUse =  "meta-llama/llama-3.1-405b-instruct:free";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`, 
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
      },
      body: JSON.stringify({
        model: modelToUse,   // <-- now dynamic
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `${searchValue}${contextInfo}`,
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("Response from API:", data);
    console.log("Status:", response.status);
    console.log("API Key:", apiKey ? "Present" : "Missing");
    console.log("Model used:", modelToUse);

    if (data.choices && data.choices[0]) {
      const aiResponse: string = data.choices[0].message.content;
      
      // Try parsing structured JSON if AI returned it
      try {
        // Clean the response - remove markdown code blocks and extra text
        let cleanedResponse = aiResponse.trim();
        
        // Remove markdown code blocks
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Try to extract JSON from the response
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0];
        }
        
        const parsedResponse: AIResponse = JSON.parse(cleanedResponse);
        console.log("Parsed AI Response:", parsedResponse);
        
        // Validate the response has a valid action field
        const validActions = ['create_repo', 'edit_readme', 'create_issue', 'view_issues', 'view_prs', 'view_repo', 'general_help'];
        if (parsedResponse.action && validActions.includes(parsedResponse.action)) {
          await handleStructuredResponse(parsedResponse);
        } else {
          // If no valid action, display as text
          console.log("Invalid or missing action, displaying as text");
          setResponse(aiResponse);
        }
      } catch (parseError) {
        console.log("Response is not JSON, displaying as text");
        console.log(parseError);
        setResponse(aiResponse);
      }
    } else {
      setResponse("Sorry, I couldn't process your request. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    setResponse("Error connecting to AI service. Please check your API key and try again.");
  } finally {
    setIsLoading(false);
  }
};

const determineIntent = (userInput: string): string => {
  const text = userInput.toLowerCase();

  if (
    text.includes('view repo') || text.includes('show repo') || text.includes('open repo') ||
    text.includes('view my repo') || text.includes('list repos') || text.includes('see all repos') ||
    text.includes('browse repos') || text.includes('check repos') || text.includes('display repos') ||
    text.includes('explore repos') || text.includes('repositories') || text.includes('my repos') ||
    text.includes('repo list') || text.includes('project list') || text.includes('show projects') ||
    text.includes('all projects') || text.includes('project overview') || text.includes('repo overview') ||
    text.includes('check my projects') || text.includes('show me my repos')
  ) {
    return 'view_repo';
  }

  if (
    text.includes('create repo') || text.includes('new project') || text.includes('make repo') ||
    text.includes('start project') || text.includes('init repo') || text.includes('start repo') ||
    text.includes('new repo') || text.includes('spin up repo') || text.includes('make new project') ||
    text.includes('launch repo') || text.includes('build repo') || text.includes('set up repo') ||
    text.includes('initialize repo') || text.includes('kickstart project') || text.includes('generate repo') ||
    text.includes('create new repo') || text.includes('add repo') || text.includes('open new project') ||
    text.includes('make a repo') || text.includes('spawn repo')
  ) {
    return 'repo_creation';
  }

  if (
    text.includes('readme') || text.includes('edit readme') || text.includes('update readme') ||
    text.includes('modify readme') || text.includes('fix readme') || text.includes('change readme') ||
    text.includes('revise readme') || text.includes('improve readme') || text.includes('work on readme') ||
    text.includes('refresh readme') || text.includes('touch readme') || text.includes('edit documentation') ||
    text.includes('update docs') || text.includes('change docs') || text.includes('modify docs') ||
    text.includes('fix docs') || text.includes('docs update') || text.includes('update project info') ||
    text.includes('improve docs') || text.includes('documentation fix')
  ) {
    return 'readme_edit';
  }

  if (
    text.includes('issue') || text.includes('bug') || text.includes('problem') ||
    text.includes('ticket') || text.includes('error report') || text.includes('create issue') ||
    text.includes('raise issue') || text.includes('file issue') || text.includes('log bug') ||
    text.includes('open bug') || text.includes('report bug') || text.includes('report problem') ||
    text.includes('flag issue') || text.includes('add bug') || text.includes('submit bug') ||
    text.includes('bug ticket') || text.includes('new issue') || text.includes('issue report') ||
    text.includes('problem report') || text.includes('track bug')
  ) {
    return 'issue_creation';
  }

  if (
    text.includes('view issues') || text.includes('show issues') || text.includes('list issues') ||
    text.includes('open issues') || text.includes('see issues') || text.includes('issues overview') ||
    text.includes('check issues') || text.includes('display issues') || text.includes('pending issues') ||
    text.includes('active issues') || text.includes('problem list') || text.includes('bug list') ||
    text.includes('all issues') || text.includes('issue board') || text.includes('bug board') ||
    text.includes('view bug reports') || text.includes('review issues') || text.includes('inspect issues') ||
    text.includes('show me issues') || text.includes('issues page')
  ) {
    return 'view_issues';
  }

  if (
    text.includes('pull request') || text.includes('pr') || text.includes('merge request') ||
    text.includes('review request') || text.includes('check prs') || text.includes('list prs') ||
    text.includes('show prs') || text.includes('view prs') || text.includes('open prs') ||
    text.includes('pending prs') || text.includes('active prs') || text.includes('incoming prs') ||
    text.includes('merge prs') || text.includes('display prs') || text.includes('pulls') ||
    text.includes('pull queue') || text.includes('review pulls') || text.includes('pr board') ||
    text.includes('show pull requests') || text.includes('pr overview')
  ) {
    return 'view_prs';
  }

  if (
    text.includes('delete repo') || text.includes('remove repo') || text.includes('nuke repo') ||
    text.includes('destroy repo') || text.includes('drop repo') || text.includes('erase repo') ||
    text.includes('kill repo') || text.includes('wipe repo') || text.includes('remove project') ||
    text.includes('delete project') || text.includes('terminate repo') || text.includes('repo removal') ||
    text.includes('close repo') || text.includes('shut repo') || text.includes('repo delete') ||
    text.includes('delete my repo') || text.includes('remove my repo') || text.includes('obliterate repo') ||
    text.includes('discard repo') || text.includes('take down repo')
  ) {
    return 'repo_deletion';
  }

  if (
    text.includes('branch') || text.includes('create branch') || text.includes('switch branch') ||
    text.includes('checkout') || text.includes('branch off') || text.includes('start branch') ||
    text.includes('new branch') || text.includes('make branch') || text.includes('branch switch') ||
    text.includes('move branch') || text.includes('set branch') || text.includes('pick branch') ||
    text.includes('branch change') || text.includes('git branch') || text.includes('branch out') ||
    text.includes('checkout branch') || text.includes('jump branch') || text.includes('branch swap') ||
    text.includes('repo branch') || text.includes('branch update')
  ) {
    return 'branch_management';
  }

  if (
    text.includes('commit') || text.includes('push') || text.includes('save changes') ||
    text.includes('git commit') || text.includes('git push') || text.includes('record changes') ||
    text.includes('sync repo') || text.includes('update repo') || text.includes('push changes') ||
    text.includes('send commit') || text.includes('write commit') || text.includes('commit code') ||
    text.includes('add commit') || text.includes('upload commit') || text.includes('repo push') ||
    text.includes('save code') || text.includes('upload changes') || text.includes('version commit') ||
    text.includes('publish commit') || text.includes('finalize commit')
  ) {
    return 'commit_push';
  }

  return 'general';
};

const handleStructuredResponse = async (parsedResponse: AIResponse): Promise<void> => {
  // For GitHub operations, check if token is available
  if (['create_repo', 'edit_readme', 'create_issue', 'view_issues', 'view_prs', 'view_repo'].includes(parsedResponse.action) && !githubToken) {
    setResponse('Please connect your GitHub token first to perform this action.');
    return;
  }

  switch (parsedResponse.action) {
    case 'create_repo':
      await createGitHubRepo(parsedResponse);
      break;
    case 'edit_readme':
      await editReadme(parsedResponse);
      break;
    case 'create_issue':
      await createIssue(parsedResponse);
      break;
    case 'view_issues':
      await viewIssues();
      break;
    case 'view_prs':
      await viewPullRequests();
      break;
    case 'view_repo':
      await viewRepo(parsedResponse);
      break;
    default:
      setResponse(parsedResponse.content || parsedResponse.response || "I'm not sure how to help with that. Please try rephrasing your request.");
  }
};

const createGitHubRepo = async (repoData?: AIResponse): Promise<void> => {
  try {
    setIsLoading(true);
    
    let repoName: string;
    let description: string;
    let readmeContent: string;
    
    if (repoData && repoData.repo_name && repoData.description && repoData.readme_content) {
      repoName = repoData.repo_name;
      description = repoData.description;
      readmeContent = repoData.readme_content;
    } else {
      // Smart repo name generation
      const words = searchValue.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .split(/\s+/) // Split by whitespace
        .filter(word => word.length > 2) // Keep words longer than 2 chars
        .filter(word => !['the', 'and', 'for', 'with', 'from', 'into', 'that', 'this', 'are', 'was', 'will', 'can', 'have', 'has', 'create', 'repo', 'repository', 'project', 'website', 'app', 'application', 'ideas', 'build', 'make'].includes(word)) // Remove common/filler words
        .slice(0, 3); // Take only first 3 meaningful words
      
      if (words.length === 0) {
        // If no meaningful words found, use a generic name
        repoName = `my-project-${Date.now().toString().slice(-4)}`;
      } else if (words.length === 1) {
        // Single word - add a suffix
        repoName = `${words[0]}-app`;
      } else {
        // Multiple words - join them
        repoName = words.join('-');
      }
      
      // Ensure it's not too long
      repoName = repoName.substring(0, 30);
      
      description = `${words.length > 0 ? words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'My'} project`;
      readmeContent = `# ${repoName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}\n\n${description}\n\nGenerated with Project Next 🚀`;
    }

    const repoResponse = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${cleanHeaderValue(githubToken)}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Project-Next-App'
      },
      body: JSON.stringify({
        name: repoName,
        description: description,
        private: false,
        auto_init: true
      })
    });

    if (!repoResponse.ok) {
      const error = await repoResponse.json();
      throw new Error(error.message || 'Failed to create repository');
    }

    const repoResponseData: GitHubRepo = await repoResponse.json();
    setRepoCreated(repoResponseData);

    // Save context
    const context: RepoContext = {
      repo_name: repoResponseData.name,
      repo_url: repoResponseData.html_url,
      owner: repoResponseData.owner.login,
      created_at: new Date().toISOString(),
      full_name: repoResponseData.full_name
    };
    saveContext(context);

    // Update README
    setTimeout(async () => {
      try {
        const readmeResponse = await fetch(`https://api.github.com/repos/${repoResponseData.full_name}/contents/README.md`, {
          headers: { 'Authorization': `token ${cleanHeaderValue(githubToken)}` }
        });
        
        if (readmeResponse.ok) {
          const readmeData = await readmeResponse.json();
          
          await fetch(`https://api.github.com/repos/${repoResponseData.full_name}/contents/README.md`, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${cleanHeaderValue(githubToken)}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: 'Update README with AI-generated content',
              content: btoa(readmeContent),
              sha: readmeData.sha
            })
          });
        }
      } catch (readmeError) {
        console.error('Error updating README:', readmeError);
      }
    }, 1000);

    setResponse(`Repository "${repoName}" created successfully! 🎉\n\n${description}\n\nRepo URL: ${repoResponseData.html_url}`);

  } catch (error) {
    console.error("Error creating repo:", error);
    setResponse(`Error creating repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsLoading(false);
  }
};

const editReadme = async (editData: AIResponse): Promise<void> => {
  const context = loadContext();
  if (!context) {
    setResponse("No repository context found. Please create a repository first.");
    return;
  }

  if (!editData.content) {
    setResponse("No content provided for README update.");
    return;
  }

  try {
    setIsLoading(true);

    // Get current README
    const readmeResponse = await fetch(`https://api.github.com/repos/${context.full_name}/contents/README.md`, {
      headers: { 'Authorization': `token ${cleanHeaderValue(githubToken)}` }
    });

    if (!readmeResponse.ok) {
      throw new Error('Could not fetch current README');
    }

    const readmeData = await readmeResponse.json();

    // Update README
    const updateResponse = await fetch(`https://api.github.com/repos/${context.full_name}/contents/README.md`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${cleanHeaderValue(githubToken)}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Update README: ${editData.change_summary || 'AI-generated update'}`,
        content: btoa(editData.content),
        sha: readmeData.sha
      })
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update README');
    }

    setResponse(`README updated successfully! 📝\n\nChanges: ${editData.change_summary || 'Updated content'}\n\nView at: ${context.repo_url}`);

  } catch (error) {
    console.error("Error editing README:", error);
    setResponse(`Error updating README: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsLoading(false);
  }
};

const createIssue = async (issueData: AIResponse): Promise<void> => {
  const context = loadContext();
  if (!context) {
    setResponse("No repository context found. Please create a repository first.");
    return;
  }

  if (!issueData.title || !issueData.body) {
    setResponse("Issue title and body are required.");
    return;
  }

  try {
    setIsLoading(true);

    const issueResponse = await fetch(`https://api.github.com/repos/${context.full_name}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${cleanHeaderValue(githubToken)}`,
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

    if (!issueResponse.ok) {
      throw new Error('Failed to create issue');
    }

    const issue: GitHubIssue = await issueResponse.json();
    setResponse(`Issue created successfully! 🐛\n\nTitle: ${issue.title}\nNumber: #${issue.number}\nURL: ${issue.html_url}`);

  } catch (error) {
    console.error("Error creating issue:", error);
    setResponse(`Error creating issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsLoading(false);
  }
};

const viewIssues = async (): Promise<void> => {
  const context = loadContext();
  if (!context) {
    setResponse("No repository context found. Please create a repository first.");
    return;
  }

  try {
    setIsLoading(true);

    const issuesResponse = await fetch(`https://api.github.com/repos/${context.full_name}/issues`, {
      headers: { 'Authorization': `token ${cleanHeaderValue(githubToken)}` }
    });

    if (!issuesResponse.ok) {
      throw new Error('Failed to fetch issues');
    }

    const issues: GitHubIssue[] = await issuesResponse.json();
    
    if (issues.length === 0) {
      setResponse("No issues found in this repository. 🎉");
      return;
    }

    const issuesList = issues.map(issue => 
      `#${issue.number}: ${issue.title}\n   State: ${issue.state}\n   Created: ${new Date(issue.created_at).toLocaleDateString()}\n   URL: ${issue.html_url}`
    ).join('\n\n');

    setResponse(`Found ${issues.length} issue(s):\n\n${issuesList}`);

  } catch (error) {
    console.error("Error fetching issues:", error);
    setResponse(`Error fetching issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsLoading(false);
  }
};

const viewPullRequests = async (): Promise<void> => {
  const context = loadContext();
  if (!context) {
    setResponse("No repository context found. Please create a repository first.");
    return;
  }

  try {
    setIsLoading(true);

    const prsResponse = await fetch(`https://api.github.com/repos/${context.full_name}/pulls`, {
      headers: { 'Authorization': `token ${cleanHeaderValue(githubToken)}` }
    });

    if (!prsResponse.ok) {
      throw new Error('Failed to fetch pull requests');
    }

    const prs: GitHubPR[] = await prsResponse.json();
    
    if (prs.length === 0) {
      setResponse("No pull requests found in this repository.");
      return;
    }

    const prsList = prs.map(pr => 
      `#${pr.number}: ${pr.title}\n   State: ${pr.state}\n   Author: ${pr.user.login}\n   Created: ${new Date(pr.created_at).toLocaleDateString()}\n   URL: ${pr.html_url}`
    ).join('\n\n');

    setResponse(`Found ${prs.length} pull request(s):\n\n${prsList}`);

  } catch (error) {
    console.error("Error fetching pull requests:", error);
    setResponse(`Error fetching pull requests: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsLoading(false);
  }
};

const viewRepo = async (parsedResponse: AIResponse): Promise<void> => {
  if (!parsedResponse.owner || !parsedResponse.repo_name) {
    setResponse("Please provide both owner and repository name.");
    return;
  }

  try {
    setIsLoading(true);

    const repoResponse = await fetch(`https://api.github.com/repos/${parsedResponse.owner}/${parsedResponse.repo_name}`, {
      headers: { 'Authorization': `token ${cleanHeaderValue(githubToken)}` }
    });

    if (!repoResponse.ok) {
      throw new Error('Repository not found');
    }

    const repo: GitHubRepo = await repoResponse.json();
    
    // Save context for future operations
    const context: RepoContext = {
      repo_name: repo.name,
      repo_url: repo.html_url,
      owner: repo.owner.login,
      created_at: new Date().toISOString(),
      full_name: repo.full_name
    };
    saveContext(context);

    setResponse(`Found repository: ${repo.full_name}\nURL: ${repo.html_url}\nOwner: ${repo.owner.login}`);

  } catch (error) {
    console.error("Error viewing repository:", error);
    setResponse(`Error viewing repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsLoading(false);
  }
};

// Add helper function to clear context
// const clearRepoContext = (): void => {
//   clearContext();
//   setResponse("Repository context cleared. You can now work with a new repository.");
// };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const isRepoResponse = response && (
    response.toLowerCase().includes('repository') || 
    response.toLowerCase().includes('repo') ||
    response.toLowerCase().includes('github')
  );

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="flex justify-between items-center p-4 md:p-6">
        <div className="flex items-center space-x-2">
          <Zap className="w-6 h-6 text-black" />
          <span className="text-lg font-medium">Next</span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleConnectTools}
            className="px-4 py-2 rounded-lg transition-colors hover:bg-gray-100"
          >
            Integrations
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-widest mb-4">
            Project Next
          </h1>
        </div>

        {/* Search Bar + AI Integration */}
        <div className="w-full max-w-2xl mb-8 bg-gray-100 rounded-2xl overflow-hidden">
          <div className="flex items-center p-4">
            <Search className="w-5 h-5 mr-3 text-gray-400" />
            <input
              type="text"
              placeholder="How can NEXT help you today . . ."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent outline-none text-lg text-gray-500 placeholder-gray-400"
              disabled={isLoading}
            />
<div className="flex items-center space-x-2">
  <button
    onClick={() => setShowModelPicker(true)}
    className="px-2 py-1 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
  >
    {selectedModel}
  </button>
  <button
    onClick={handleSearch}
    disabled={isLoading || !searchValue.trim()}
    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLoading ? "..." : "Ask"}
  </button>
</div>

          </div>

{/* Modal Picker for Model */}
{showModelPicker && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="w-full max-w-sm rounded-2xl p-6 bg-white">
      <h3 className="text-lg font-medium mb-4">Choose a Model</h3>
      <ul className="space-y-2">
        {[
          "Meta Llama 405B",
          "Meta Llama 70B ",
          "Gemma 9B  "
        ].map((model) => (
          <li key={model}>
            <button
              onClick={() => handleModelSelect(model)}
              className="w-full px-4 py-2 rounded-lg hover:bg-gray-100 text-left text-sm"
            >
              {model.split('/')[1] || model}
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setShowModelPicker(false)}
        className="mt-4 w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        Cancel
      </button>
    </div>
  </div>
)}

          {/* AI Response */}
          {(response || isLoading) && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
              {isLoading ? (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <span className="ml-2">Thinking...</span>
                </div>
              ) : (
                <>
                  <div className="prose prose-sm max-w-none mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {response}
                    </p>
                  </div>
                  
                  {/* GitHub Repo Creation Button */}
                  {isRepoResponse && !repoCreated && (
                    <button
                      onClick={() => {
                        if (!apiKey) {
                          setShowOpenRouterModal(true);
                        } else if (!githubToken) {
                          setShowGitHubModal(true);
                        } else {
                          createGitHubRepo();
                        }
                      }}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 mb-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Repository on GitHub</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Success Message */}
          {repoCreated && (
            <div className="mt-4 p-4 bg-green-50 rounded-2xl">
              <div className="flex items-center space-x-2 text-green-700 mb-2">
                <GitBranch className="w-5 h-5" />
                <span className="font-semibold">Repository Created Successfully!</span>
              </div>
              <a
                href={repoCreated.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View on GitHub: {repoCreated.full_name}
              </a>
            </div>
          )}

          <button
            onClick={handleConnectTools}
            className="w-full mt-4 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 bg-gray-100 hover:bg-gray-200 text-gray-600 text-center border-t border-gray-200"
          >
            Connect your tools to NEXT
          </button>
        </div>
      </main>

      {/* Settings Toggle */}
      <div className="fixed bottom-6 left-6">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 rounded-full transition-all duration-200 hover:scale-110 bg-gray-200 hover:bg-gray-300 text-black"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {showSettings && (
          <div className="absolute bottom-16 left-0 p-4 rounded-lg shadow-lg min-w-[200px] bg-white border border-gray-200">
            <button className="w-full text-left p-2 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors text-sm text-gray-700">
              Settings
            </button>
            <button className="w-full text-left p-2 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors text-sm text-gray-700">
              Help
            </button>
            <button className="w-full text-left p-2 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors text-sm text-gray-700">
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* OpenRouter Setup Modal */}
      {showOpenRouterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Zap className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-medium">Connect OpenRouter</h3>
              </div>
              <button
                onClick={() => setShowOpenRouterModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenRouter API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-or-v1-xxxxxxxxxxxx"
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>To get your API key:</strong>
                </p>
                <ol className="text-sm text-orange-700 mt-1 space-y-1">
                  <li>1. Go to <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="underline">OpenRouter.ai</a></li>
                  <li>2. Sign up or log in to your account</li>
                  <li>3. Navigate to API Keys section</li>
                  <li>4. Create a new API key</li>
                </ol>
              </div>
              
              <button
                onClick={() => setShowOpenRouterModal(false)}
                disabled={!openRouterKey}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Connect OpenRouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Setup Modal */}
      {showGitHubModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Github className="w-6 h-6" />
                <h3 className="text-xl font-medium">Connect GitHub</h3>
              </div>
              <button
                onClick={() => setShowGitHubModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>To create a token:</strong>
                </p>
                <ol className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>1. Go to GitHub → Settings → Developer settings</li>
                  <li>2. Personal access tokens → Tokens (classic)</li>
                  <li>3. Generate new token with 'repo' scope</li>
                </ol>
              </div>
              
              <button
                onClick={() => setShowGitHubModal(false)}
                disabled={!githubToken}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Connect GitHub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Modal */}
      {showIntegrations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-2xl p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-light">Add Integrations</h3>
              <button
                onClick={() => setShowIntegrations(false)}
                className="p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 text-gray-600 hover:text-black"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration, index) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    {integration.name === "GitHub" ? (
                      <Github className="w-6 h-6" />
                    ) : integration.name === "OpenRouter" ? (
                      <Zap className="w-6 h-6 text-orange-500" />
                    ) : (
                      <div className="w-6 h-6 rounded bg-gray-300"></div>
                    )}
                    <span className="font-medium">{integration.name}</span>
                  </div>
                  <button
                    onClick={() => toggleIntegration(index)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      integration.connected
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-gray-300 text-black hover:bg-gray-500 hover:text-white"
                    }`}
                  >
                    {integration.connected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectNext;