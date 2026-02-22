'use client';
import React, { useState } from 'react';
import ErrorStateCard from '@/components/shared/ErrorStateCard';

export default function ErrorTestPage() {
  const [showError, setShowError] = useState<'network' | 'server' | 'general' | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRetrying(false);
    
    // Simulate successful retry
    setShowError(null);
    alert('Error resolved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Error Handling Test</h1>
        
        {/* Control Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Test Error Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowError('network')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Network Error
            </button>
            <button
              onClick={() => setShowError('server')}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Server Error
            </button>
            <button
              onClick={() => setShowError('general')}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              General Error
            </button>
          </div>
          {showError && (
            <button
              onClick={() => setShowError(null)}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Clear Error
            </button>
          )}
        </div>

        {/* Error Display */}
        {showError && (
          <ErrorStateCard
            type={showError}
            title={showError === 'network' ? 'Network Connection Failed' : 
                   showError === 'server' ? 'Server Error' : 
                   'Something went wrong'}
            message={showError === 'network' ? 'Unable to connect to the server. Please check your internet connection and try again.' :
                   showError === 'server' ? 'The server is experiencing issues. Our team has been notified.' :
                   'An unexpected error occurred. Please try again.'}
            onRetry={handleRetry}
            isRetrying={isRetrying}
          />
        )}

        {/* Success State */}
        {!showError && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              All Systems Working
            </h3>
            <p className="text-green-600 dark:text-green-400">
              Click the buttons above to test different error types and verify the ErrorStateCard component.
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
            Fixed Issues
          </h3>
          <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-300">
            <li>✅ Error types are now correctly classified (network, server, general)</li>
            <li>✅ Network errors show WiFi-off icon</li>
            <li>✅ Server errors show server-crash icon</li>
            <li>✅ General errors show alert-triangle icon</li>
            <li>✅ Proper error messages for each error type</li>
            <li>✅ Retry functionality works correctly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
