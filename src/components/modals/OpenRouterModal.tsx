// components/modals/OpenRouterModal.tsx
import React from 'react';
import { X, Zap } from 'lucide-react';

interface OpenRouterModalProps {
  isOpen: boolean;
  onClose: () => void;
  openRouterKey: string;
  onKeyChange: (key: string) => void;
}

export const OpenRouterModal: React.FC<OpenRouterModalProps> = ({
  isOpen,
  onClose,
  openRouterKey,
  onKeyChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md rounded-2xl p-6 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-orange-500" />
            <h3 className="text-xl font-medium">Connect OpenRouter</h3>
          </div>
          <button
            onClick={onClose}
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
              onChange={(e) => onKeyChange(e.target.value)}
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
            onClick={onClose}
            disabled={!openRouterKey}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect OpenRouter
          </button>
        </div>
      </div>
    </div>
  );
};