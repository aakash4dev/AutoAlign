'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploadAreaProps {
  title: string
  description: string
  onFilesSelected: (files: File[]) => void
  uploadedFiles: File[]
  onRemoveFile: (index: number) => void
  icon?: React.ReactNode
}

export default function FileUploadArea({
  title,
  description,
  onFilesSelected,
  uploadedFiles,
  onRemoveFile,
  icon,
}: FileUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer ${
          isDragOver
            ? 'border-purple-accent bg-purple-accent/10'
            : 'border-border hover:border-purple-accent/50 hover:bg-purple-accent/5'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          accept=".pdf,.doc,.docx,.txt,.md"
        />

        <div
          className="flex flex-col items-center justify-center gap-3"
          onClick={() => inputRef.current?.click()}
        >
          <div className={`p-3 rounded-lg ${isDragOver ? 'bg-purple-accent/20' : 'bg-purple-accent/10'}`}>
            <Upload className={`w-6 h-6 ${isDragOver ? 'text-purple-accent' : 'text-muted-foreground'}`} />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Drag and drop your files here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </div>
          <p className="text-xs text-muted-foreground">Supported: PDF, DOC, DOCX, TXT, MD</p>
        </div>
      </div>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
          </p>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:border-border hover:bg-card/80 transition-all"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-2 h-2 bg-purple-accent rounded-full flex-shrink-0"></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onRemoveFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
