
'use client';

import { motion } from 'framer-motion';
import { Eye, Edit3 } from 'lucide-react';

export type Tab = 'preview' | 'edit' | 'original';

interface CVTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'original', label: 'Original Text', icon: Eye },
  { id: 'preview', label: 'Formatted CV', icon: Eye },
  { id: 'edit', label: 'Edit CV', icon: Edit3 },
];

export default function CVTabs({ activeTab, onTabChange }: CVTabsProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
      <div className="border-b border-gray-700">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
