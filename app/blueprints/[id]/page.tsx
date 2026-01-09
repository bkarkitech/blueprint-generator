'use client'

import { useParams } from 'next/navigation'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { useChatRuntime } from '@assistant-ui/react-ai-sdk'
// You can use assistant-ui's built-in components or your own.
// This example keeps it minimal.
import { Thread } from '@assistant-ui/react'

export default function BlueprintChatPage() {
  const params = useParams<{ id: string }>()
  const blueprintId = params.id

  const runtime = useChatRuntime({
    api: `/api/blueprints/${blueprintId}/chat`,
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr', height: '100vh' }}
      >
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  )
}
