// frontend/app/components/DownloadButton.tsx

'use client';

import React, { useState } from 'react';
import { Download, FileText, File } from 'lucide-react';

interface DownloadButtonProps {
  filename: string;
  githubPath: string; // Path in GitHub repo (e.g., "roadmaps/NCUA_Compliance_Copilot_Technical_Roadmap.md")
  type: 'md' | 'pdf';
  label?: string;
}

export default function DownloadButton({
  filename,
  githubPath,
  type,
  label
}: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const displayLabel = label || (type === 'md' ? 'Download Markdown' : 'Download PDF');
  const Icon = type === 'md' ? FileText : File;
  const bgColor = type === 'md' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-red-50 hover:bg-red-100';
  const textColor = type === 'md' ? 'text-slate-700' : 'text-red-600';

  // GitHub raw content URL
  const githubRawUrl = `https://raw.githubusercontent.com/MeherMS/Credit-Union-Member-Churn-Prediction-System/main/${githubPath}`;

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      // Fetch from GitHub raw URL
      const response = await fetch(githubRawUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download ${type.toUpperCase()} (HTTP ${response.status})`);
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Failed to download ${displayLabel}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 ${bgColor} ${textColor} font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Download size={18} />
      <span>{isLoading ? 'Downloading...' : displayLabel}</span>
    </button>
  );
}