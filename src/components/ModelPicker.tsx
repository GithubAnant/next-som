import React from 'react';
import { MODELS } from '../constants/index';

interface ModelPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const ModelPicker: React.FC<ModelPickerProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel
}) => {
  if (!isOpen) return null;

  const handleModelSelect = (model: string) => {
    onSelectModel(model);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm rounded-2xl p-6 bg-white">
        <h3 className="text-lg font-medium mb-4">Choose a Model</h3>
        <ul className="space-y-2">
          {MODELS.map((model) => (
            <li key={model}>
              <button
                onClick={() => handleModelSelect(model)}
                className={`w-full px-4 py-2 rounded-lg hover:bg-gray-100 text-left text-sm ${
                  selectedModel === model ? 'bg-blue-100 text-blue-600' : ''
                }`}
              >
                {model}
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};