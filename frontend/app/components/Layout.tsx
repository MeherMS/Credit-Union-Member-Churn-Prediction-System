// app/components/Layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, FileText, Upload, Home } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Credit Union</h1>
          <p className="text-xs text-gray-500 mt-1">Churn Prediction</p>
        </div>

        <nav className="p-4 space-y-2">
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

          <Link
            href="/upload"
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
        </nav>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 text-xs text-gray-400">
          <p>Backend: localhost:8000</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
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
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}