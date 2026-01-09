'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && chart) {
      mermaid.contentLoaded()
      // Re-initialize mermaid for new content
      mermaid.run()
    }
  }, [chart])

  return (
    <div
      ref={containerRef}
      className='mermaid'
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '16px 0',
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: '8px',
        margin: '8px 0',
        overflow: 'auto',
      }}
    >
      {chart}
    </div>
  )
}
