'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { validateMermaidSyntax } from '@/lib/mermaidValidator'

interface MermaidDiagramProps {
  chart: string
  isComplete?: boolean
  onFixDiagram?: (diagramCode: string) => void
  showDiagram?: boolean
  onShowDiagramChange?: (show: boolean) => void
}

export default function MermaidDiagram({
  chart,
  isComplete = false,
  onFixDiagram,
  showDiagram: externalShowDiagram,
  onShowDiagramChange,
}: MermaidDiagramProps) {
  const [showDiagram, setShowDiagram] = useState(false)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [syntaxValid, setSyntaxValid] = useState(true)
  // Use ref to remember if user has clicked to view diagram during this component's lifetime
  const userViewedDiagramRef = useRef(false)

  // Use external state if provided, otherwise use internal state
  const actualShowDiagram =
    externalShowDiagram !== undefined ? externalShowDiagram : showDiagram
  const handleShowDiagramChange = (show: boolean) => {
    if (onShowDiagramChange) {
      onShowDiagramChange(show)
    } else {
      setShowDiagram(show)
    }
  }

  // Only validate when response is complete and user tries to view the diagram
  useEffect(() => {
    if (!actualShowDiagram) {
      // Reset error when not viewing
      setRenderError(null)
      return
    }

    // Only validate when trying to show the diagram
    const validation = validateMermaidSyntax(chart)
    setSyntaxValid(validation.valid)
    if (!validation.valid) {
      setRenderError(validation.error || 'Invalid mermaid syntax')
    }
  }, [chart, actualShowDiagram])

  useEffect(() => {
    if (actualShowDiagram && syntaxValid && isComplete) {
      // Run mermaid rendering only when:
      // - User clicked to show diagram
      // - Syntax is valid
      // - Response generation is complete
      mermaid.run().catch((error) => {
        console.error('Mermaid rendering error:', error)
        setRenderError('Failed to render diagram. The syntax may be invalid.')
      })
    }
  }, [chart, actualShowDiagram, syntaxValid, isComplete])

  // When response completes and user previously viewed diagrams, restore the diagram view
  useEffect(() => {
    if (userViewedDiagramRef.current && !actualShowDiagram && isComplete) {
      handleShowDiagramChange(true)
    }
  }, [isComplete])

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '8px',
          gap: '4px',
        }}
      >
        <button
          onClick={() => {
            handleShowDiagramChange(true)
            userViewedDiagramRef.current = true
          }}
          disabled={!isComplete}
          style={{
            padding: '4px 12px',
            fontSize: '11px',
            backgroundColor: actualShowDiagram
              ? '#2196F3'
              : !isComplete
              ? '#e8e8e8'
              : '#e0e0e0',
            color: actualShowDiagram ? '#fff' : !isComplete ? '#aaa' : '#666',
            border: 'none',
            borderRadius: '3px',
            cursor: !isComplete ? 'not-allowed' : 'pointer',
            fontWeight: actualShowDiagram ? 600 : 400,
            transition: 'none',
            opacity: !isComplete ? 0.6 : 1,
          }}
          title={!isComplete ? 'Waiting for response to complete...' : ''}
        >
          View Diagram
        </button>
        <button
          onClick={() => {
            handleShowDiagramChange(false)
            userViewedDiagramRef.current = false
          }}
          style={{
            padding: '4px 12px',
            fontSize: '11px',
            backgroundColor: !actualShowDiagram ? '#2196F3' : '#e0e0e0',
            color: !actualShowDiagram ? '#fff' : '#666',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontWeight: !actualShowDiagram ? 600 : 400,
            transition: 'none',
          }}
        >
          View Code
        </button>
      </div>

      {renderError && (
        <div
          style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ef5350',
            color: '#c62828',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '12px',
            marginBottom: '12px',
          }}
        >
          <strong>Diagram Error:</strong> {renderError}
          <br />
          <em style={{ fontSize: '11px', marginTop: '4px', display: 'block' }}>
            The AI generated invalid Mermaid syntax. Your other content is still
            saved.
          </em>
          {onFixDiagram && (
            <button
              onClick={() => onFixDiagram(chart)}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              🔧 Ask AI to Fix Diagram
            </button>
          )}
        </div>
      )}

      {actualShowDiagram ? (
        syntaxValid && !renderError ? (
          <div
            className='mermaid'
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '16px 0',
              backgroundColor: 'rgba(255,255,255,0.5)',
              borderRadius: '8px',
              overflow: 'auto',
              margin: '8px 0',
              transition: 'none',
            }}
          >
            {chart}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '16px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              color: '#999',
              fontSize: '12px',
            }}
          >
            Unable to render diagram due to syntax errors. View code below to
            inspect.
          </div>
        )
      ) : (
        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: '12px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace',
            margin: '8px 0',
            color: '#333',
            lineHeight: '1.4',
            border: syntaxValid ? 'none' : '2px solid #ef5350',
          }}
        >
          {chart}
        </pre>
      )}
    </div>
  )
}
