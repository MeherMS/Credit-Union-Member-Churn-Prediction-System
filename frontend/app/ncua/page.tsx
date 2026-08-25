// frontend/app/ncua/page.tsx

'use client';

import React from 'react';
import { FileText, Zap, Shield, Clock, BookOpen, Download } from 'lucide-react';
import Layout from '@/app/components/Layout';
import StatusBadge from '@/app/components/StatusBadge';
import DownloadButton from '@/app/components/DownloadButton';

function NCUAContent() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={40} className="text-blue-600" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              NCUA Compliance Copilot
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Regulatory Compliance RAG Engine
            </p>
          </div>
        </div>
        <StatusBadge status="in-development" text="Under Development" />
      </div>

      {/* Description Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          The NCUA Compliance Copilot is a <strong>Retrieval-Augmented Generation (RAG) system</strong> designed 
          to help credit union staff quickly access and understand regulatory guidance from the National Credit Union Administration.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Staff members can ask compliance questions in plain English and receive answers grounded in official NCUA 
          regulations, letters, and supervisory guidance—with direct citations to source documents.
        </p>
      </div>


      {/* Download Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Technical Roadmap</h2>
        <p className="text-gray-700 mb-6">
          Download the complete technical roadmap for detailed implementation specifications, API design, 
          data models, and deployment instructions.
        </p>

        <div className="flex gap-4 flex-wrap">
          <DownloadButton
            filename="NCUA_Compliance_Copilot_Technical_Roadmap.md"
            githubPath="roadmaps/NCUA_Compliance_Copilot_Technical_Roadmap.md"
            type="md"
            label="📄 Download Markdown"
          />
          <DownloadButton
            filename="NCUA_Compliance_Copilot_Technical_Roadmap.pdf"
            githubPath="roadmaps/NCUA_Compliance_Copilot_Technical_Roadmap.pdf"
            type="pdf"
            label="📕 Download PDF"
          />
        </div>
      </div>

      {/* Status Callout */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg">
        <h3 className="font-bold text-amber-900 mb-2">🚀 Coming Soon</h3>
        <p className="text-amber-800 text-sm">
          This feature is currently under active development. Check back soon for live updates on 
          implementation progress. For questions about this feature, contact the development team.
        </p>
      </div>
    </div>
  );
}

export default function NCUAPage() {
  return (
    <Layout>
      <NCUAContent />
    </Layout>
  );
}