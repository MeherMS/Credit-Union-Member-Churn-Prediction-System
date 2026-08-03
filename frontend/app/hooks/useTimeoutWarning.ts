'use client';

import { useState, useEffect } from 'react';

export const useTimeoutWarning = (isLoading: boolean) => {
  const [showWarning, setShowWarning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setShowWarning(false);
      setElapsedTime(0);
      return;
    }

    // Show warning after 8 seconds
    const warningTimer = setTimeout(() => {
      setShowWarning(true);
    }, 8000);

    // Update elapsed time every second
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(warningTimer);
      clearInterval(interval);
    };
  }, [isLoading]);

  return { showWarning, elapsedTime };
};