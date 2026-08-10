// app/components/Layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, FileText, Upload, Home, Building2, Layers } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path) 
      ? 'bg-blue-600 text-white' 
      : 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Credit Union</h1>
          <p className="text-xs text-gray-500 mt-1">Churn Prediction</p>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <Link
            href="/"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/')}`}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/members"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/members')}`}
          >
            <Users size={20} />
            <span>All Members</span>
          </Link>

          {/* NEW: Households & Cohorts Section */}
          <div className="pt-4 border-t mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase px-4 mb-2">Analytics</p>
            
            <Link
              href="/households"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/households')}`}
            >
              <Building2 size={20} />
              <span>Households</span>
            </Link>

            <Link
              href="/cohorts"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/cohorts')}`}
            >
              <Layers size={20} />
              <span>Cohorts</span>
            </Link>
          </div>

          <div className="pt-4 border-t mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase px-4 mb-2">Tools</p>

            <Link
              href="/predict-single"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/predict-single')}`}
            >
              <Upload size={20} />
              <span>Single Predict</span>
            </Link>

            <Link
              href="/upload"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/upload')}`}
            >
              <Upload size={20} />
              <span>Bulk Upload</span>
            </Link>

            <Link
              href="/reports"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/reports')}`}
            >
              <FileText size={20} />
              <span>Reports</span>
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t p-4 text-xs text-gray-400">
          <p>Backend: localhost:8000</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Executive Dashboard</h2>
            <div className="text-sm text-gray-500">
              Powered by ML Churn Prediction Model
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}