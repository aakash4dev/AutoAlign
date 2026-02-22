'use client'

import { BookOpen, Lightbulb, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FileUploadArea from '@/components/file-upload-area'

interface DocumentIngestionProps {
  onFilesUploaded: (type: 'knowledge' | 'requirement', files: File[]) => void
  uploadedFiles: {
    knowledge: File[]
    requirement: File[]
  }
  onRemoveFile: (type: 'knowledge' | 'requirement', index: number) => void
  onStartDebate: () => void
}

export default function DocumentIngestion({
  onFilesUploaded,
  uploadedFiles,
  onRemoveFile,
  onStartDebate,
}: DocumentIngestionProps) {
  const canStartDebate = uploadedFiles.knowledge.length > 0 && uploadedFiles.requirement.length > 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header section */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-gradient">Document Ingestion</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Upload your company policies and new requirements to begin the autonomous governance transformation.
          Our multi-agent AI system will analyze, debate, and align them.
        </p>
      </div>

      {/* Main content grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left column - Knowledge Base */}
        <div className="space-y-6">
          <div className="p-6 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-all hover:border-purple-accent/50">
            <FileUploadArea
              title="Knowledge Base"
              description="Upload existing company policies, compliance documents, and data dictionaries."
              onFilesSelected={(files) => onFilesUploaded('knowledge', files)}
              uploadedFiles={uploadedFiles.knowledge}
              onRemoveFile={(index) => onRemoveFile('knowledge', index)}
              icon={<BookOpen className="w-5 h-5 text-purple-accent" />}
            />
          </div>

          {/* Info box */}
          <div className="p-4 rounded-lg bg-purple-accent/10 border border-purple-accent/20 space-y-2">
            <p className="text-sm font-medium text-purple-accent">What is a Knowledge Base?</p>
            <p className="text-sm text-muted-foreground">
              Your existing policies, compliance frameworks, and organizational standards that define how your company operates.
            </p>
          </div>
        </div>

        {/* Right column - New Requirements */}
        <div className="space-y-6">
          <div className="p-6 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-all hover:border-blue-accent/50">
            <FileUploadArea
              title="New Requirement"
              description="Upload new business requirements, feature proposals, or regulatory changes."
              onFilesSelected={(files) => onFilesUploaded('requirement', files)}
              uploadedFiles={uploadedFiles.requirement}
              onRemoveFile={(index) => onRemoveFile('requirement', index)}
              icon={<Lightbulb className="w-5 h-5 text-blue-accent" />}
            />
          </div>

          {/* Info box */}
          <div className="p-4 rounded-lg bg-blue-accent/10 border border-blue-accent/20 space-y-2">
            <p className="text-sm font-medium text-blue-accent">What is a New Requirement?</p>
            <p className="text-sm text-muted-foreground">
              Any new feature request, business requirement, or regulatory change that needs to be evaluated against your existing policies.
            </p>
          </div>
        </div>
      </div>

      {/* Summary section */}
      {(uploadedFiles.knowledge.length > 0 || uploadedFiles.requirement.length > 0) && (
        <div className="p-6 rounded-lg border border-border bg-card/50 space-y-4 animate-float-in">
          <h3 className="font-semibold text-foreground">Ready for Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-purple-accent/10">
                <BookOpen className="w-4 h-4 text-purple-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Knowledge Base Files</p>
                <p className="font-semibold text-foreground">{uploadedFiles.knowledge.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-blue-accent/10">
                <Lightbulb className="w-4 h-4 text-blue-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Requirements</p>
                <p className="font-semibold text-foreground">{uploadedFiles.requirement.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA section */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          size="lg"
          disabled={!canStartDebate}
          onClick={onStartDebate}
          className="bg-gradient-to-r from-purple-accent to-blue-accent hover:from-purple-accent/80 hover:to-blue-accent/80 text-white font-semibold py-6"
        >
          <span>Start Agentic Debate</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="border-border text-foreground hover:bg-card"
        >
          Save as Template
        </Button>
      </div>

      {!canStartDebate && (
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground text-center">
            Upload at least one Knowledge Base file and one New Requirement to start the debate arena.
          </p>
        </div>
      )}
    </div>
  )
}
