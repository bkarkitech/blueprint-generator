'use client'

import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by boundary:', error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              maxWidth: '500px',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#d32f2f',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}
            >
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '24px',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                  Error details
                </summary>
                <pre
                  style={{
                    marginTop: '8px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
