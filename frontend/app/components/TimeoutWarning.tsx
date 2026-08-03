'use client';

import { AlertCircle, Clock } from 'lucide-react';

interface TimeoutWarningProps {
  elapsedSeconds: number;
  isVisible: boolean;
}

export const TimeoutWarning = ({ elapsedSeconds, isVisible }: TimeoutWarningProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded shadow-lg">
        <div className="flex items-start gap-3">
          <Clock className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-amber-900">Taking a moment...</h3>
            <p className="text-sm text-amber-800 mt-1">
              Since we use free providers, the app is quite slow so be patient. 
              We've been waiting {elapsedSeconds}s. Your request is still processing.
            </p>
            <div className="mt-3 w-full bg-amber-200 rounded-full h-1">
              <div
                className="bg-amber-600 h-1 rounded-full transition-all"
                style={{
                  width: `${Math.min((elapsedSeconds / 120) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};