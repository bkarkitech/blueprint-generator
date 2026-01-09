'use client'

import { useEffect, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
  isComplete?: boolean
}

export default function MermaidDiagram({
  chart,
  isComplete = false,
}: MermaidDiagramProps) {
  const [showDiagram, setShowDiagram] = useState(false)

  useEffect(() => {
    if (showDiagram) {
      // Run mermaid rendering only when showing diagram
      mermaid.run()
    }
  }, [chart, showDiagram])

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
          onClick={() => setShowDiagram(true)}
          disabled={!isComplete}
          style={{
            padding: '4px 12px',
            fontSize: '11px',
            backgroundColor: showDiagram
              ? '#2196F3'
              : !isComplete
              ? '#e8e8e8'
              : '#e0e0e0',
            color: showDiagram ? '#fff' : !isComplete ? '#aaa' : '#666',
            border: 'none',
            borderRadius: '3px',
            cursor: !isComplete ? 'not-allowed' : 'pointer',
            fontWeight: showDiagram ? 600 : 400,
            transition: 'none',
            opacity: !isComplete ? 0.6 : 1,
          }}
          title={!isComplete ? 'Waiting for response to complete...' : ''}
        >
          View Diagram
        </button>
        <button
          onClick={() => setShowDiagram(false)}
          style={{
            padding: '4px 12px',
            fontSize: '11px',
            backgroundColor: !showDiagram ? '#2196F3' : '#e0e0e0',
            color: !showDiagram ? '#fff' : '#666',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontWeight: !showDiagram ? 600 : 400,
            transition: 'none',
          }}
        >
          View Code
        </button>
      </div>

      {showDiagram ? (
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
          }}
        >
          {chart}
        </pre>
      )}
    </div>
  )
}
