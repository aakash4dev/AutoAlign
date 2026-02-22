'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface DiffViewerProps {
  showDiff?: boolean
  originalContent?: string
  alignedContent?: string
}

export default function DiffViewer({ showDiff = true, originalContent = "", alignedContent = "" }: DiffViewerProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Document Comparison</h3>
        <span className="text-xs font-medium text-muted-foreground bg-purple-accent/10 px-3 py-1 rounded">
          {showDiff ? 'Differences highlighted' : 'Full document'}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Original document */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <p className="font-medium text-foreground">Original BRD</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(originalContent, 0)}
              className="h-8 w-8 p-0"
            >
              {copiedIndex === 0 ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 min-h-[500px] font-mono text-sm text-foreground overflow-auto">
            <div className="space-y-2">
              {originalContent.split('\n').map((line, idx) => (
                <div key={idx} className="hover:bg-red-500/10 px-2 py-1 rounded transition-colors break-words whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aligned document */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <p className="font-medium text-foreground">AutoAligned BRD</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(alignedContent, 1)}
              className="h-8 w-8 p-0"
            >
              {copiedIndex === 1 ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5 min-h-[500px] font-mono text-sm text-foreground overflow-auto">
            <div className="space-y-2">
              {alignedContent.split('\n').map((line, idx) => {
                const isNew = line.includes('ALIGNED:')
                return (
                  <div
                    key={idx}
                    className={`px-2 py-1 rounded transition-colors break-words whitespace-pre-wrap ${isNew ? 'bg-green-500/20 border-l-2 border-green-400' : 'hover:bg-green-500/10'
                      }`}
                  >
                    {isNew && <span className="text-green-400">+ </span>}
                    {line}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
