import React from "react";
import { Search, Zap, MoreHorizontal, Plus, GitBranch } from "lucide-react";
import { useProjectNext } from "./hooks/projectnexthooks";
import { GitHubModal } from "./components/modals/GithubModal.tsx";
import { OpenRouterModal } from "./components/modals/OpenRouterModal.tsx";
import { IntegrationsModal } from "./components/modals/IntegrationsModal.tsx";
import { ModelPicker } from "./components/ModelPicker.tsx";

const ProjectNext: React.FC = () => {
  const {
    // All state and handlers come from the custom hook
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
  } = useProjectNext();

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
                      onClick={createGitHubRepo}
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

      {/* All Modals are now separate components */}
      <ModelPicker
        isOpen={showModelPicker}
        onClose={() => setShowModelPicker(false)}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />

      <OpenRouterModal
        isOpen={showOpenRouterModal}
        onClose={() => setShowOpenRouterModal(false)}
        openRouterKey={openRouterKey}
        onKeyChange={setOpenRouterKey}
      />

      <GitHubModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        githubToken={githubToken}
        onTokenChange={setGithubToken}
      />

      <IntegrationsModal
        isOpen={showIntegrations}
        onClose={() => setShowIntegrations(false)}
        integrations={integrations}
        onToggleIntegration={toggleIntegration}
      />
    </div>
  );
};

export default ProjectNext;