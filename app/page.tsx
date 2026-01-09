'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [repos, setRepos] = useState<string[]>([''])
  const [blueprintId, setBlueprintId] = useState('')

  const handleRepoChange = (index: number, value: string) => {
    const newRepos = [...repos]
    newRepos[index] = value
    setRepos(newRepos)
  }

  const addRepoField = () => {
    setRepos([...repos, ''])
  }

  const removeRepoField = (index: number) => {
    setRepos(repos.filter((_, i) => i !== index))
  }

  const handleCreate = () => {
    const validRepos = repos.filter((r) => r.trim())
    if (validRepos.length === 0) {
      alert('Please enter at least one repository')
      return
    }

    // Generate a blueprint ID and pass repos as query params
    const id = `blueprint-${Date.now()}`
    const repoParam = encodeURIComponent(validRepos.join(','))
    window.location.href = `/blueprints/${id}?repos=${repoParam}`
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
        Blueprint Generator
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Analyze GitHub repositories and generate architecture blueprints
      </p>

      <div
        style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Add Repositories to Analyze
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            Enter repository names in the format:{' '}
            <code
              style={{
                backgroundColor: '#f0f0f0',
                padding: '2px 6px',
                borderRadius: '3px',
              }}
            >
              owner/repo
            </code>
          </p>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            Example: facebook/react, kubernetes/kubernetes, vercel/next.js
          </p>
        </div>

        {repos.map((repo, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '12px',
              alignItems: 'center',
            }}
          >
            <input
              type='text'
              placeholder='owner/repo (e.g., facebook/react)'
              value={repo}
              onChange={(e) => handleRepoChange(index, e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace',
              }}
            />
            {repos.length > 1 && (
              <button
                onClick={() => removeRepoField(index)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addRepoField}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          + Add Another Repository
        </button>

        <button
          onClick={handleCreate}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          Start Analysis
        </button>
      </div>

      <div
        style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Quick Start
        </h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
          Try with popular repos:
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            'vercel/next.js',
            'facebook/react',
            'nodejs/node',
            'kubernetes/kubernetes',
          ].map((repo) => (
            <button
              key={repo}
              onClick={() =>
                (window.location.href = `/blueprints/blueprint-${Date.now()}?repos=${encodeURIComponent(
                  repo
                )}`)
              }
              style={{
                padding: '6px 12px',
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                border: '1px solid #90caf9',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {repo}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
