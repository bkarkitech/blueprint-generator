import { useState } from 'react'

interface SaveToRepoProps {
  blueprintId: string
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function SaveToRepoForm({
  blueprintId,
  onClose,
  onSuccess,
  onError,
}: SaveToRepoProps) {
  const [repoUrl, setRepoUrl] = useState('')
  const [path, setPath] = useState('')
  const [filename, setFilename] = useState(`blueprint-${blueprintId}.md`)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!repoUrl.trim()) {
      onError('Repository URL is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `/api/blueprints/${blueprintId}/save-to-repo`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoUrl: repoUrl.trim(),
            path: path.trim() || undefined,
            filename: filename.trim() || undefined,
          }),
        }
      )

      const data = (await response.json()) as {
        success: boolean
        message: string
        fileUrl?: string
      }

      if (!data.success) {
        onError(data.message || 'Failed to save blueprint')
        setLoading(false)
        return
      }

      onSuccess(
        `✅ Blueprint saved! ${
          data.fileUrl ? `View it at: ${data.fileUrl}` : ''
        }`
      )
      onClose()
    } catch (error: any) {
      onError(error.message || 'Failed to save blueprint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '20px' }}>
          Save Blueprint to GitHub
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 500,
                fontSize: '14px',
              }}
            >
              Repository URL *
            </label>
            <input
              type='text'
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder='owner/repo or https://github.com/owner/repo'
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
              disabled={loading}
            />
            <p
              style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '4px',
                marginBottom: 0,
              }}
            >
              e.g., owner/repo or https://github.com/owner/repo
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 500,
                fontSize: '14px',
              }}
            >
              Path (optional)
            </label>
            <input
              type='text'
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder='e.g., docs or api/docs'
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
              disabled={loading}
            />
            <p
              style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '4px',
                marginBottom: 0,
              }}
            >
              Folder path within the repository (file will be saved in this
              directory)
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 500,
                fontSize: '14px',
              }}
            >
              Filename (optional)
            </label>
            <input
              type='text'
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={`blueprint-${blueprintId}.md`}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
              disabled={loading}
            />
            <p
              style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '4px',
                marginBottom: 0,
              }}
            >
              Defaults to blueprint-{blueprintId}.md if empty
            </p>
          </div>

          <div
            style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}
          >
            <button
              type='button'
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 16px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                opacity: loading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              style={{
                padding: '10px 16px',
                backgroundColor: loading ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {loading ? 'Saving...' : 'Save to GitHub'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
