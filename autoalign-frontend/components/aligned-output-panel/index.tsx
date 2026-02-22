'use client'

import { useState } from 'react'
import { Download, Github, Copy, Share2, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ComplianceScore from './compliance-score'
import DiffViewer from './diff-viewer'

interface AlignedOutputPanelProps {
  alignmentResult: any
}

export default function AlignedOutputPanel({ alignmentResult }: AlignedOutputPanelProps) {
  const [copiedText, setCopiedText] = useState(false)

  const handleCopyToClipboard = () => {
    if (alignmentResult?.aligned_brd) {
      navigator.clipboard.writeText(alignmentResult.aligned_brd)
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    }
  }

  const score = alignmentResult?.compliance_score ? Math.round(alignmentResult.compliance_score * 100) : 0
  const originalBrd = alignmentResult?.original_brd || ""
  const alignedBrd = alignmentResult?.aligned_brd || ""
  const violations = alignmentResult?.violations || []

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-gradient">Aligned Output</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Your document has been transformed and aligned with all compliance requirements.
        </p>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start h-auto p-0">
          <TabsTrigger
            value="compliance"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-accent text-foreground"
          >
            Compliance Score
          </TabsTrigger>
          <TabsTrigger
            value="diff"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-accent text-foreground"
          >
            Document Diff
          </TabsTrigger>
          <TabsTrigger
            value="exports"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-accent text-foreground"
          >
            Exports & Integration
          </TabsTrigger>
        </TabsList>

        {/* Compliance tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left - Score */}
            <div className="lg:col-span-1">
              <ComplianceScore score={score} />
            </div>

            {/* Right - Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-lg border border-border bg-card/50 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Resolution Summary</h3>

                <div className="space-y-4">
                  {violations.length > 0 ? violations.map((violation: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-yellow-400">{violation.policy_section}</h4>
                        <span className="text-xs font-medium text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded uppercase">
                          {violation.severity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {violation.description}
                      </p>
                    </div>
                  )) : (
                    <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/10 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-green-400">All Requirements Met</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No outstanding compliance violations found in the final aligned document.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Next steps */}
              <div className="p-6 rounded-lg border border-border bg-card/50 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Recommended Next Steps</h3>
                <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Review the aligned document with your compliance team</li>
                  <li>Implement consent system changes based on feedback</li>
                  <li>Set up audit trail logging infrastructure</li>
                  <li>Configure data retention policies in production</li>
                </ol>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Diff tab */}
        <TabsContent value="diff" className="space-y-6">
          <DiffViewer originalContent={originalBrd} alignedContent={alignedBrd} />
        </TabsContent>

        {/* Exports tab */}
        <TabsContent value="exports" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Export options */}
            <div className="p-6 rounded-lg border border-border bg-card/50 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Export Document</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start gap-3 h-auto py-3 bg-purple-accent/10 hover:bg-purple-accent/20 border border-purple-accent/30 text-foreground">
                  <FileDown className="w-5 h-5 text-purple-accent" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Export as PDF</p>
                    <p className="text-xs text-muted-foreground">Formatted with compliance annotations</p>
                  </div>
                </Button>
                <Button className="w-full justify-start gap-3 h-auto py-3 bg-blue-accent/10 hover:bg-blue-accent/20 border border-blue-accent/30 text-foreground">
                  <FileDown className="w-5 h-5 text-blue-accent" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Export as Markdown</p>
                    <p className="text-xs text-muted-foreground">Git-friendly format</p>
                  </div>
                </Button>
                <Button className="w-full justify-start gap-3 h-auto py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-foreground">
                  <FileDown className="w-5 h-5 text-green-400" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Export as DOCX</p>
                    <p className="text-xs text-muted-foreground">Microsoft Word format</p>
                  </div>
                </Button>
              </div>
            </div>

            {/* Integration options */}
            <div className="p-6 rounded-lg border border-border bg-card/50 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Integrate with Tools</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start gap-3 h-auto py-3 bg-purple-accent/10 hover:bg-purple-accent/20 border border-purple-accent/30 text-foreground">
                  <Github className="w-5 h-5 text-purple-accent" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Push to GitHub</p>
                    <p className="text-xs text-muted-foreground">Create pull request</p>
                  </div>
                </Button>
                <Button className="w-full justify-start gap-3 h-auto py-3 bg-blue-accent/10 hover:bg-blue-accent/20 border border-blue-accent/30 text-foreground">
                  <Share2 className="w-5 h-5 text-blue-accent" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Share Link</p>
                    <p className="text-xs text-muted-foreground">Generate shareable URL</p>
                  </div>
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-auto py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-foreground"
                  onClick={handleCopyToClipboard}
                >
                  <Copy className="w-5 h-5 text-green-400" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">
                      {copiedText ? 'Copied!' : 'Copy to Clipboard'}
                    </p>
                    <p className="text-xs text-muted-foreground">Full document content</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* API Access */}
          <div className="p-6 rounded-lg border border-border bg-card/50 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">API Access</h3>
            <p className="text-sm text-muted-foreground">
              Access your aligned document programmatically via our REST API.
            </p>
            <div className="p-3 rounded bg-card border border-border font-mono text-sm text-muted-foreground overflow-x-auto">
              curl -X GET /api/documents/aligned/{'{documentId}'} \
              <br />
              -H "Authorization: Bearer {'{token}'}"
            </div>
            <Button variant="outline" className="w-full border-border text-foreground hover:bg-card">
              View API Documentation
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Final CTA */}
      <div className="p-6 rounded-lg border border-purple-accent/30 bg-purple-accent/10 flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground">Document Successfully Aligned</p>
          <p className="text-sm text-muted-foreground mt-1">Ready for deployment and implementation</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-accent to-blue-accent hover:from-purple-accent/80 hover:to-blue-accent/80 text-white gap-2">
          <Download className="w-4 h-4" />
          Download Now
        </Button>
      </div>
    </div>
  )
}
