import React from "react";
import { Icon } from "@iconify/react";

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service if available
    if (typeof window !== "undefined" && window.errorReporter) {
      window.errorReporter.log(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { mode = "light", fallback } = this.props;

      // Use custom fallback if provided
      if (fallback) {
        return fallback(this.state.error, this.handleReset);
      }

      // Default error UI
      return (
        <div
          className={`min-h-screen flex items-center justify-center p-4 ${
            mode === "dark" ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          <div
            className={`max-w-md w-full rounded-lg shadow-lg p-6 ${
              mode === "dark"
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <Icon
                  icon="mdi:alert-circle"
                  className="w-8 h-8 text-red-500"
                />
              </div>
              <div>
                <h2
                  className={`text-lg font-semibold ${
                    mode === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Something went wrong
                </h2>
                <p
                  className={`text-sm ${
                    mode === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  We encountered an unexpected error
                </p>
              </div>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div
                className={`mb-4 p-3 rounded text-xs font-mono overflow-auto max-h-40 ${
                  mode === "dark"
                    ? "bg-gray-900 text-red-400"
                    : "bg-red-50 text-red-800"
                }`}
              >
                <div className="font-semibold mb-1">Error:</div>
                <div>{this.state.error.toString()}</div>
                {this.state.errorInfo && (
                  <>
                    <div className="font-semibold mt-2 mb-1">Stack:</div>
                    <div className="whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  mode === "dark"
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
              >
                Reload Page
              </button>
            </div>

            <div className="mt-4 text-center">
              <a
                href="/admin"
                className={`text-sm hover:underline ${
                  mode === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              >
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper
 */
export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  return function WithErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
