'use client';

import { useState } from 'react';
import { chatHistoryManager } from '@/services/chatHistoryManager';

export function ConversationExport({ messages = [] }) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    setExporting(true);

    try {
      const exported = chatHistoryManager.export(messages, format);

      // Create blob and download
      const blob = new Blob([exported], {
        type: format === 'json' ? 'application/json' : 'text/plain',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation_${Date.now()}.${format === 'markdown' ? 'md' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowExportMenu(!showExportMenu)}
        className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 transition"
        disabled={messages.length === 0 || exporting}
      >
        {exporting ? 'Exporting...' : '📥 Export'}
      </button>

      {showExportMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg z-10 border border-slate-700">
          <div className="p-2 space-y-1">
            <button
              onClick={() => handleExport('json')}
              className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-sm text-slate-300"
            >
              💾 JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-sm text-slate-300"
            >
              📊 CSV
            </button>
            <button
              onClick={() => handleExport('markdown')}
              className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-sm text-slate-300"
            >
              📝 Markdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
