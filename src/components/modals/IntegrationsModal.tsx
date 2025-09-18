import React from 'react';
import { X, Github, Zap } from 'lucide-react';
import type { Integration } from '../../types';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrations: Integration[];
  onToggleIntegration: (index: number) => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({
  isOpen,
  onClose,
  integrations,
  onToggleIntegration
}) => {
  if (!isOpen) return null;

  const getIcon = (integration: Integration) => {
    switch (integration.name) {
      case "GitHub":
        return <Github className="w-6 h-6" />;
      case "OpenRouter":
        return <Zap className="w-6 h-6 text-orange-500" />;
      default:
        return <div className="w-6 h-6 rounded bg-gray-300"></div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-2xl p-6 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-light">Add Integrations</h3>
          <button
            onClick={onClose}
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
                {getIcon(integration)}
                <span className="font-medium">{integration.name}</span>
              </div>
              <button
                onClick={() => onToggleIntegration(index)}
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
  );
};
