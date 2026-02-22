'use client'

import { useState } from 'react'
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import DocumentIngestion from '@/components/document-ingestion'
import AgenticDebateArena from '@/components/agentic-debate-arena'
import AlignedOutputPanel from '@/components/aligned-output-panel'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'ingestion' | 'debate' | 'output'>('ingestion')
  const [uploadedFiles, setUploadedFiles] = useState<{
    knowledge: File[]
    requirement: File[]
  }>({
    knowledge: [],
    requirement: [],
  })

  // State to hold the backend response
  const [alignmentResult, setAlignmentResult] = useState<any>(null)
  const [isAligning, setIsAligning] = useState(false)

  const handleFileUpload = (type: 'knowledge' | 'requirement', files: File[]) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: [...prev[type], ...files],
    }))
  }

  const handleRemoveFile = (type: 'knowledge' | 'requirement', index: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }))
  }

  const handleStartDebate = async () => {
    // Optionally move to the debate tab immediately to show a loading state
    setActiveTab('debate')
    setIsAligning(true)
    setAlignmentResult(null)

    try {
      // For now, we are simulating extracting the content from the first uploaded requirement file.
      // In a real app, you would read the file content here.
      let brdContent = "User data will be stored indefinitely on public servers."
      if (uploadedFiles.requirement.length > 0) {
        brdContent = await uploadedFiles.requirement[0].text()
      }

      const response = await fetch('http://localhost:8000/api/align', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brd_content: brdContent,
          max_iterations: 3,
        }),
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      setAlignmentResult(data)
      setIsAligning(false)
      // Note: We leave the tab on 'debate'. 
      // A common pattern would be to let AgenticDebateArena finish its animation then switch to 'output',
      // or we can just pass the result to the debate arena to render.
    } catch (error) {
      console.error('Error starting debate:', error)
      setIsAligning(false)
    }
  }

  return (
    <div className="dark min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            {activeTab === 'ingestion' && (
              <DocumentIngestion
                onFilesUploaded={handleFileUpload}
                uploadedFiles={uploadedFiles}
                onRemoveFile={handleRemoveFile}
                onStartDebate={handleStartDebate}
              />
            )}
            {activeTab === 'debate' && (
              <AgenticDebateArena
                uploadedFiles={uploadedFiles}
                alignmentResult={alignmentResult}
                isAligning={isAligning}
                onDebateComplete={() => setActiveTab('output')}
              />
            )}
            {activeTab === 'output' && (
              <AlignedOutputPanel alignmentResult={alignmentResult} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

