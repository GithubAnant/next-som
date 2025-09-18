import { useState } from 'react';
import type { Integration, RepoCreated, AIResponse, RepoContext } from '../types';
import { GitHubService } from '../services/github';
import { AIService } from '../services/ai';
import { saveContext } from '../utils';

export const useProjectNext = () => {
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
  const [repoCreated, setRepoCreated] = useState<RepoCreated | null>(null);

  const integrations: Integration[] = [
    { name: "GitHub", icon: "github", color: "#181717", connected: false },
    { name: "OpenRouter", icon: "zap", color: "#FF6B35", connected: false },
  ];

  const apiKey = (openRouterKey && openRouterKey.trim()) || import.meta.env.VITE_OPENROUTER_KEY;

  const handleSearch = async (): Promise<void> => {
    if (!searchValue.trim() || !apiKey) {
      if (!apiKey) {
        setResponse("Please configure your OpenRouter API key first. Click the OpenRouter integration to set it up.");
      }
      return;
    }

    setIsLoading(true);
    setResponse("");
    setRepoCreated(null);

    try {
      const aiService = new AIService(apiKey);
      const aiResponse = await aiService.processQuery(searchValue, selectedModel);
      const parsedResponse = aiService.parseResponse(aiResponse);

      if (typeof parsedResponse === 'string') {
        setResponse(parsedResponse);
      } else {
        await handleStructuredResponse(parsedResponse);
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse("Error connecting to AI service. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStructuredResponse = async (parsedResponse: AIResponse): Promise<void> => {
    if (['create_repo', 'edit_readme', 'create_issue', 'view_issues', 'view_prs', 'view_repo'].includes(parsedResponse.action) && !githubToken) {
      setResponse('Please connect your GitHub token first to perform this action.');
      return;
    }

    const githubService = new GitHubService(githubToken);

    try {
      switch (parsedResponse.action) {
        case 'create_repo':
          if (parsedResponse.repo_name && parsedResponse.description) {
            const repo = await githubService.createRepository(parsedResponse);
            setRepoCreated(repo);
            
            // Save context
            const context: RepoContext = {
              repo_name: repo.name,
              repo_url: repo.html_url,
              owner: repo.owner.login,
              created_at: new Date().toISOString(),
              full_name: repo.full_name
            };
            saveContext(context);
            
            setResponse(`Repository "${repo.name}" created successfully! 🎉\n\nRepo URL: ${repo.html_url}`);
          } else {
            setResponse("Missing repository information for creation.");
          }
          break;
        case 'edit_readme':
          // Handle readme editing - you'll need to implement this in GitHubService
          setResponse("README editing functionality coming soon!");
          break;
        case 'create_issue':
          // Handle issue creation - you'll need to implement this
          setResponse("Issue creation functionality coming soon!");
          break;
        case 'view_issues':
          // Handle viewing issues
          setResponse("View issues functionality coming soon!");
          break;
        case 'view_prs':
          // Handle viewing PRs
          setResponse("View pull requests functionality coming soon!");
          break;
        case 'view_repo':
          // Handle viewing repo
          setResponse("View repository functionality coming soon!");
          break;
        default:
          setResponse(parsedResponse.content || parsedResponse.response || "I'm not sure how to help with that. Please try rephrasing your request.");
      }
    } catch (error) {
      console.error("Error handling structured response:", error);
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
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

  const createGitHubRepo = async (): Promise<void> => {
    if (!apiKey) {
      setShowOpenRouterModal(true);
      return;
    }
    
    if (!githubToken) {
      setShowGitHubModal(true);
      return;
    }

    try {
      setIsLoading(true);
      
      // Smart repo name generation from searchValue
      const words = searchValue.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .split(/\s+/) // Split by whitespace
        .filter(word => word.length > 2) // Keep words longer than 2 chars
        .filter(word => !['the', 'and', 'for', 'with', 'from', 'into', 'that', 'this', 'are', 'was', 'will', 'can', 'have', 'has', 'create', 'repo', 'repository', 'project', 'website', 'app', 'application', 'ideas', 'build', 'make'].includes(word))
        .slice(0, 3); // Take only first 3 meaningful words
      
      let repoName: string;
      if (words.length === 0) {
        repoName = `my-project-${Date.now().toString().slice(-4)}`;
      } else if (words.length === 1) {
        repoName = `${words[0]}-app`;
      } else {
        repoName = words.join('-');
      }
      
      repoName = repoName.substring(0, 30); // Ensure it's not too long
      
      const description = `${words.length > 0 ? words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'My'} project`;
      const readmeContent = `# ${repoName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}\n\n${description}\n\nGenerated with Project Next 🚀`;

      // Create the repository
      const githubService = new GitHubService(githubToken);
      const repoResponseData = await githubService.createRepository({
        action: 'create_repo',
        repo_name: repoName,
        description: description,
        readme_content: readmeContent
      });

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

      // Update README after a short delay
      setTimeout(async () => {
        try {
          await githubService.updateReadme(repoResponseData.full_name, readmeContent, 'Update README with AI-generated content');
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

  return {
    // State
    showIntegrations,
    showSettings,
    showGitHubModal,
    showOpenRouterModal,
    searchValue,
    isLoading,
    response,
    githubToken,
    openRouterKey,
    showModelPicker,
    selectedModel,
    repoCreated,
    integrations,
    
    // Actions
    setShowIntegrations,
    setShowSettings,
    setShowGitHubModal,
    setShowOpenRouterModal,
    setSearchValue,
    setGithubToken,
    setOpenRouterKey,
    setShowModelPicker,
    setSelectedModel,
    handleSearch,
    handleConnectTools,
    toggleIntegration,
    createGitHubRepo,
  };
};