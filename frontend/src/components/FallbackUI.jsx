/**
 * Fallback UI Components for Error Boundaries
 * Provides user-friendly error displays with recovery options
 */

import React from 'react';
import { RefreshCw, AlertTriangle, Home, ArrowLeft, Bug } from 'lucide-react';

const FallbackUI = ({
  error,
  errorId,
  onRetry,
  isRetrying = false,
  context = 'Application',
  showDetails = false
}) => {
  const getErrorMessage = () => {
    switch (context) {
      case 'DealWizard':
        return 'We encountered an issue with the deal creation process. Your progress has been saved.';
      case 'Profile':
        return 'We\'re having trouble loading your profile. Please try again.';
      case 'Dashboard':
        return 'We\'re having trouble loading your dashboard. Please refresh the page.';
      default:
        return 'Something went wrong. We\'re working to fix this issue.';
    }
  };

  const getActionButtons = () => {
    const buttons = [];

    // Always show retry button
    buttons.push(
      <button
        key="retry"
        onClick={onRetry}
        disabled={isRetrying}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
        {isRetrying ? 'Retrying...' : 'Try Again'}
      </button>
    );

    // Add context-specific actions
    if (context === 'DealWizard') {
      buttons.push(
        <button
          key="save-draft"
          onClick={() => window.location.href = '/dashboard?tab=drafts'}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Dashboard
        </button>
      );
    } else if (context === 'Profile') {
      buttons.push(
        <button
          key="home"
          onClick={() => window.location.href = '/dashboard'}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Home className="mr-2 h-4 w-4" />
          Go to Dashboard
        </button>
      );
    } else {
      buttons.push(
        <button
          key="home"
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Home className="mr-2 h-4 w-4" />
          Go Home
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="mt-4 text-lg font-medium text-gray-900">
              Oops! Something went wrong
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {getErrorMessage()}
            </p>

            {errorId && (
              <p className="mt-2 text-xs text-gray-500">
                Error ID: {errorId}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col space-y-3">
            {getActionButtons().map((button, index) => (
              <div key={index}>{button}</div>
            ))}
          </div>

          {showDetails && error && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <details className="group">
                <summary className="flex items-center cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  <Bug className="mr-2 h-4 w-4" />
                  Show technical details
                </summary>
                <div className="mt-3 p-3 bg-gray-100 rounded-md">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {error.name}: {error.message}
                  </pre>
                  {error.stack && (
                    <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Compact fallback for smaller components
export const CompactFallbackUI = ({
  error,
  errorId,
  onRetry,
  isRetrying = false,
  context = 'Component'
}) => (
  <div className="p-4 border border-red-200 rounded-md bg-red-50">
    <div className="flex items-center">
      <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
      <h3 className="text-sm font-medium text-red-800">
        {context} Error
      </h3>
    </div>
    <div className="mt-2 text-sm text-red-700">
      <p>Unable to load this section. Please try again.</p>
    </div>
    <div className="mt-3 flex items-center space-x-2">
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
      >
        <RefreshCw className={`mr-1 h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
        {isRetrying ? 'Retrying...' : 'Retry'}
      </button>
      {errorId && (
        <span className="text-xs text-red-500">ID: {errorId}</span>
      )}
    </div>
  </div>
);

// Inline fallback for form fields
export const InlineFallbackUI = ({
  error,
  onRetry,
  isRetrying = false,
  context = 'Field'
}) => (
  <div className="inline-flex items-center space-x-2 p-2 text-sm text-red-600 bg-red-50 rounded-md">
    <AlertTriangle className="h-4 w-4" />
    <span>Failed to load {context.toLowerCase()}</span>
    <button
      onClick={onRetry}
      disabled={isRetrying}
      className="inline-flex items-center text-xs text-red-700 hover:text-red-800 disabled:opacity-50"
    >
      <RefreshCw className={`mr-1 h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
      {isRetrying ? 'Retrying...' : 'Retry'}
    </button>
  </div>
);

export default FallbackUI;