import React, { useState } from "react";
import { Search, Zap, X, MoreHorizontal } from "lucide-react";

// Import SVG assets
import gmailIcon from './assets/gmail.svg';
import docsIcon from './assets/docs.svg';
import sheetsIcon from './assets/sheets.svg';
import driveIcon from './assets/drive.svg';
import notionIcon from './assets/notion.svg';
import slackIcon from './assets/slack.svg';
import stripeIcon from './assets/stripe.svg';
import githubIcon from './assets/github.svg';
import spotifyIcon from './assets/spotify.svg';

interface Integration {
  name: string;
  icon: string;
  color: string;
  connected: boolean;
}

const ProjectNext: React.FC = () => {
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchValue, setSearchValue] = useState("");

const integrations: Integration[] = [
  { name: "Gmail", icon: gmailIcon, color: "#EA4335", connected: true },
  { name: "Docs", icon: docsIcon, color: "#4285F4", connected: true },
  { name: "Sheets", icon: sheetsIcon, color: "#34A853", connected: false },
  { name: "Drive", icon: driveIcon, color: "#4285F4", connected: true },
  { name: "Notion", icon: notionIcon, color: "#000000", connected: true },
  { name: "Slack", icon: slackIcon, color: "#4A154B", connected: false },
  { name: "Stripe", icon: stripeIcon, color: "#635BFF", connected: false },
  { name: "GitHub", icon: githubIcon, color: "#181717", connected: false },
  { name: "Spotify", icon: spotifyIcon, color: "#1DB954", connected: false },
];

  const handleConnectTools = () => {
    setShowIntegrations(true);
  };

  const toggleIntegration = (index: number) => {
    // In a real app, this would connect/disconnect the integration
    console.log(`Toggle integration: ${integrations[index].name}`); 
  };


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
        {/* Project NEXT Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-widest mb-4">
            Project Next
          </h1>
        </div>

        {/* Search Bar + Tools Button */}
<div className="w-full max-w-2xl mb-8 bg-gray-100 rounded-2xl overflow-hidden">
  <div className="flex items-center p-4">
    <Search className="w-5 h-5 mr-3 text-gray-400" />
    <input
      type="text"
      placeholder="How can NEXT help you today . . ."
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      className="flex-1 bg-transparent outline-none text-lg text-gray-500 placeholder-gray-400"
    />
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-400">Default</span>
      <svg
        className="w-4 h-4 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  </div>

  <button
    onClick={handleConnectTools}
    className="w-full mt-4 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 bg-gray-100 hover:bg-gray-90 text-gray-600 text-center border-t border-gray-200"
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
                    <img
                      src={integration.icon} // pointing to /public/*.svg
                      alt={integration.name}
                      className="w-6 h-6" // adjust size
                    />
                    <span className="font-medium">{integration.name}</span>
                  </div>
                  <button
                    onClick={() => toggleIntegration(index)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      integration.connected
                        ? "bg-white-600 text-red-600"
                        : "bg-gray-600 hover:bg-gray-700 text-white"
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