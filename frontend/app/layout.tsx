import type { Metadata } from 'next';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: 'Credit Union Churn Prediction',
  description: 'Member churn prediction dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}