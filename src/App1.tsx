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
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [githubToken, setGithubToken] = useState("");
  interface RepoCreated {
    html_url: string;
    full_name: string;
    // add other properties if needed
  }
  const [repoCreated, setRepoCreated] = useState<RepoCreated | null>(null);

  // Mock integrations - using Lucide icons as fallback
  const integrations: Integration[] = [
    { name: "Gmail", icon: "gmail", color: "#EA4335", connected: true },
    { name: "Docs", icon: "docs", color: "#4285F4", connected: true },
    { name: "Sheets", icon: "sheets", color: "#34A853", connected: false },
    { name: "Drive", icon: "drive", color: "#4285F4", connected: true },
    { name: "Notion", icon: "notion", color: "#000000", connected: false },
    { name: "Slack", icon: "slack", color: "#4A154B", connected: false },
    { name: "Stripe", icon: "stripe", color: "#635BFF", connected: false },
    { name: "GitHub", icon: "github", color: "#181717", connected: false },
    { name: "Spotify", icon: "spotify", color: "#1DB954", connected: false },
  ];

  const apiKey = import.meta.env.VITE_OPENROUTER_KEY;

  const handleConnectTools = () => {
    setShowIntegrations(true);
  };

  const toggleIntegration = (index: number) => {
    if (integrations[index].name === "GitHub") {
      setShowGitHubModal(true);
      setShowIntegrations(false);
    } else {
      console.log(`Toggle integration: ${integrations[index].name}`);
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setIsLoading(true);
    setResponse("");
    setRepoCreated(null);

    try {
      // Enhanced prompt for better repo generation
      const isRepoRequest = searchValue.toLowerCase().includes('repo') || 
                           searchValue.toLowerCase().includes('project') ||
                           searchValue.toLowerCase().includes('app') ||
                           searchValue.toLowerCase().includes('website');

      let prompt = searchValue;
      if (isRepoRequest) {
        prompt = `Create a GitHub repository based on this idea: "${searchValue}"

Please provide:
1. A good repository name (kebab-case, descriptive) only if not provided by the user.
2. A clear description (1-2 sentences)
3. A brief README.md content outline
4. Basic project structure if and only if asked

Format your response clearly with each section.`;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`, // Use your actual API key here
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Project Next'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-405b-instruct:free',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      console.log("Response from API:", data);
      
      if (data.choices && data.choices[0]) {
        setResponse(data.choices[0].message.content);
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

  const createGitHubRepo = async () => {
    if (!githubToken) {
      alert('Please add your GitHub token first!');
      return;
    }

    // Extract repo details from AI response
    const lines = response.split('\n');
    let repoName = '';
    let description = '';
    
    for (const line of lines) {
      if (line.toLowerCase().includes('repository name') || line.toLowerCase().includes('repo name')) {
        repoName = line.split(':')[1]?.trim().replace(/[`"']/g, '') || '';
      }
      if (line.toLowerCase().includes('description')) {
        description = line.split(':')[1]?.trim().replace(/[`"']/g, '') || '';
      }
    }

    // Fallback: generate name from user input
    if (!repoName) {
      repoName = searchValue.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    }

    if (!description) {
      description = `A project for ${searchValue}`;
    }

    try {
      setIsLoading(true);
      
      const repoResponse = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
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

      const repoData = await repoResponse.json();
      setRepoCreated(repoData);

      // Update README with AI content
      const readmeContent = response.includes('README') ? 
        response.split('README')[1]?.split('\n').slice(1, 10).join('\n') : 
        `# ${repoName}\n\n${description}\n\n## Getting Started\n\nThis repository was created to help with: ${searchValue}`;

      setTimeout(async () => {
        try {
          const readmeResponse = await fetch(`https://api.github.com/repos/${repoData.full_name}/contents/README.md`, {
            headers: { 'Authorization': `token ${githubToken}` }
          });
          
          if (readmeResponse.ok) {
            const readmeData = await readmeResponse.json();
            
            await fetch(`https://api.github.com/repos/${repoData.full_name}/contents/README.md`, {
              method: 'PUT',
              headers: {
                'Authorization': `token ${githubToken}`,
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

    } catch (error: unknown) {
      console.error("Error creating repo:", error);
      alert(`Error creating repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

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
          <button className="px-4 py-2 rounded-lg transition-colors hover:bg-gray-100">
            Workflows
          </button>
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
              <span className="text-sm text-gray-400">Llama-3.3-70B</span>
              <button
                onClick={handleSearch}
                disabled={isLoading || !searchValue.trim()}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "..." : "Ask"}
              </button>
            </div>
          </div>

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
                      onClick={() => githubToken ? createGitHubRepo() : setShowGitHubModal(true)}
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
            onClick={() => setShowGitHubModal(true)}
            className="w-full mt-4 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 bg-gray-100 hover:bg-gray-200 text-gray-600 text-center border-t border-gray-200"
          >
            Connect your Github to NEXT
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