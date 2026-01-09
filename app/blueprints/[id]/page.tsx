'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MermaidDiagram from '@/components/MermaidDiagram'
import Link from 'next/link'

export default function BlueprintChatPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const blueprintId = params.id

  const [repos, setRepos] = useState<string[]>([])
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRepoEditor, setShowRepoEditor] = useState(false)
  const [editingRepos, setEditingRepos] = useState<string[]>([])

  useEffect(() => {
    const reposParam = searchParams.get('repos')
    if (reposParam) {
      const parsedRepos = decodeURIComponent(reposParam)
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r.length > 0)
      setRepos(parsedRepos)
      setEditingRepos(parsedRepos)
    }
  }, [searchParams])

  const handleSend = async () => {
    if (!input.trim() || repos.length === 0) return

    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(`/api/blueprints/${blueprintId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          repos: repos,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'API error')
      }

      const reader = response.body?.getReader()
      if (!reader) return

      // Add empty assistant message first
      const messagesWithAssistant = [
        ...newMessages,
        { role: 'assistant', content: '' },
      ]
      setMessages(messagesWithAssistant)

      let assistantMessage = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantMessage += chunk

        // Update the last message (assistant message) with new content
        const updatedMessages = [
          ...newMessages,
          { role: 'assistant', content: assistantMessage },
        ]
        setMessages(updatedMessages)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get response'
      setMessages([
        ...newMessages,
        { role: 'assistant', content: `Error: ${errorMessage}` },
      ])
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRepos = () => {
    const validRepos = editingRepos.filter((r) => r.trim())
    if (validRepos.length === 0) {
      alert('Please enter at least one repository')
      return
    }
    setRepos(validRepos)
    setShowRepoEditor(false)
    setMessages([])
  }

  const handleAddRepoField = () => {
    setEditingRepos([...editingRepos, ''])
  }

  const handleRemoveRepoField = (index: number) => {
    setEditingRepos(editingRepos.filter((_, i) => i !== index))
  }

  const handleEditRepoChange = (index: number, value: string) => {
    const newRepos = [...editingRepos]
    newRepos[index] = value
    setEditingRepos(newRepos)
  }

  return (
    <div
      style={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: '280px',
          borderRight: '1px solid #e0e0e0',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
          <Link href='/'>
            <h2
              style={{
                margin: '0 0 12px 0',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              Blueprint
            </h2>
          </Link>
          <button
            onClick={() => setShowRepoEditor(!showRepoEditor)}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {showRepoEditor ? 'Done' : 'Edit Repos'}
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {showRepoEditor ? (
            <div>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}
              >
                Repositories:
              </p>
              {editingRepos.map((repo, index) => (
                <div
                  key={index}
                  style={{ marginBottom: '8px', display: 'flex', gap: '6px' }}
                >
                  <input
                    type='text'
                    value={repo}
                    onChange={(e) =>
                      handleEditRepoChange(index, e.target.value)
                    }
                    placeholder='owner/repo'
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      fontSize: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                    }}
                  />
                  {editingRepos.length > 1 && (
                    <button
                      onClick={() => handleRemoveRepoField(index)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddRepoField}
                style={{
                  width: '100%',
                  padding: '6px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginBottom: '12px',
                }}
              >
                + Add Repo
              </button>
              <button
                onClick={handleUpdateRepos}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                Update Repos
              </button>
            </div>
          ) : (
            <div>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: '#666',
                }}
              >
                Analyzing:
              </p>
              {repos.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#999' }}>
                  No repos selected. Click "Edit Repos" to add.
                </p>
              ) : (
                repos.map((repo, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#f0f7ff',
                      border: '1px solid #90caf9',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      marginBottom: '6px',
                      color: '#1976d2',
                    }}
                  >
                    {repo}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#fff',
          }}
        >
          <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 600 }}>
            {blueprintId}
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
            {repos.length > 0
              ? `Ready to discuss ${repos.length} repository${
                  repos.length > 1 ? 'ies' : ''
                }`
              : 'No repositories selected'}
          </p>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}
            >
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  marginBottom: '8px',
                }}
              >
                Let's explore
              </p>
              <p style={{ fontSize: '13px' }}>
                {repos.length > 0
                  ? 'Ask me anything about these repositories - architecture, code structure, dependencies, design patterns, deployment, or anything else. I can also generate diagrams when helpful.'
                  : 'Add repositories from the left panel to start a conversation.'}
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent:
                    msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: msg.role === 'user' ? '#2196F3' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#000',
                    border: msg.role === 'user' ? 'none' : '1px solid #e0e0e0',
                    wordWrap: 'break-word',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    overflow: 'auto',
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => (
                          <h2
                            style={{
                              fontSize: '18px',
                              fontWeight: 600,
                              margin: '8px 0',
                            }}
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h3
                            style={{
                              fontSize: '16px',
                              fontWeight: 600,
                              margin: '6px 0',
                            }}
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h4
                            style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              margin: '4px 0',
                            }}
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p style={{ margin: '4px 0' }} {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            style={{ margin: '4px 0', paddingLeft: '20px' }}
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            style={{ margin: '4px 0', paddingLeft: '20px' }}
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li style={{ margin: '2px 0' }} {...props} />
                        ),
                        code: ({
                          node,
                          inline,
                          className,
                          children,
                          ...props
                        }) => {
                          const match = /language-(\w+)/.exec(className || '')
                          const language = match ? match[1] : ''
                          if (language === 'mermaid') {
                            return (
                              <MermaidDiagram
                                chart={String(children).replace(/\n$/, '')}
                              />
                            )
                          }
                          return inline ? (
                            <code
                              style={{
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontFamily: 'monospace',
                                fontSize: '13px',
                              }}
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <code
                              style={{
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                padding: '8px',
                                borderRadius: '4px',
                                display: 'block',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                overflow: 'auto',
                                margin: '4px 0',
                              }}
                              {...props}
                            >
                              {children}
                            </code>
                          )
                        },
                        pre: ({ node, ...props }) => (
                          <pre
                            style={{
                              backgroundColor: 'rgba(0,0,0,0.05)',
                              padding: '8px',
                              borderRadius: '4px',
                              overflow: 'auto',
                              margin: '4px 0',
                            }}
                            {...props}
                          />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            style={{
                              borderLeft: '4px solid #2196F3',
                              paddingLeft: '12px',
                              margin: '4px 0',
                              opacity: 0.8,
                            }}
                            {...props}
                          />
                        ),
                        table: ({ node, ...props }) => (
                          <table
                            style={{
                              borderCollapse: 'collapse',
                              width: '100%',
                              margin: '4px 0',
                            }}
                            {...props}
                          />
                        ),
                        th: ({ node, ...props }) => (
                          <th
                            style={{
                              border: '1px solid #e0e0e0',
                              padding: '6px',
                              textAlign: 'left',
                              fontWeight: 600,
                              backgroundColor: 'rgba(0,0,0,0.05)',
                            }}
                            {...props}
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td
                            style={{
                              border: '1px solid #e0e0e0',
                              padding: '6px',
                            }}
                            {...props}
                          />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  padding: '12px 16px',
                  color: '#999',
                  fontSize: '14px',
                }}
              >
                Analyzing repositories...
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#fff',
          }}
        >
          {repos.length === 0 ? (
            <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>
              Add repositories from the left panel to start chatting
            </p>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && !loading && handleSend()
                }
                placeholder='Ask me anything about these repositories...'
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: loading ? '#ccc' : '#2196F3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
