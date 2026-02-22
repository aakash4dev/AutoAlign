'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PingPongAnimation from './ping-pong-animation'
import AgentMessage, { AgentMessageProps } from './agent-message'
import DebateProgress from './debate-progress'

interface AgenticDebateArenaProps {
  uploadedFiles: {
    knowledge: File[]
    requirement: File[]
  }
  alignmentResult: any
  isAligning: boolean
  onDebateComplete: () => void
}

export default function AgenticDebateArena({
  uploadedFiles,
  alignmentResult,
  isAligning,
  onDebateComplete
}: AgenticDebateArenaProps) {
  const [currentRound, setCurrentRound] = useState(1)
  const [messages, setMessages] = useState<AgentMessageProps[]>([])

  // Parse audit trail into messages when alignmentResult is available
  useEffect(() => {
    if (alignmentResult && alignmentResult.audit_trail) {
      const parsedMessages: AgentMessageProps[] = alignmentResult.audit_trail.map((entry: any, index: number) => {
        const isDefender = entry.agent === 'defender'
        return {
          id: `msg-${index}`,
          agent: entry.agent,
          type: isDefender ? 'violation' : 'solution',
          title: isDefender ? `Round ${entry.iteration} Analysis` : `Round ${entry.iteration} Resolution`,
          content: entry.summary || `Addressed ${entry.violations_addressed} violations. Original length: ${entry.original_length}, Revised: ${entry.revised_length}.`,
          severity: isDefender ? 'high' : 'medium', // Default severities for visual distinction
          timestamp: new Date(Date.now() - (alignmentResult.audit_trail.length - index) * 1000)
        }
      })
      setMessages(parsedMessages)
      setCurrentRound(alignmentResult.iterations_used || 1)
    }
  }, [alignmentResult])

  const defenderMessages = messages.filter((m) => m.agent === 'defender')
  const drafterMessages = messages.filter((m) => m.agent === 'drafter')

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-gradient">Agentic Debate Arena</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Watch as the Defender and Drafter agents engage in multi-round debate to find compliant solutions.
        </p>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left panel - Defender agent */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-lg border border-purple-accent/30 bg-purple-accent/10 space-y-2">
            <h2 className="text-lg font-bold text-purple-accent">Defender Agent</h2>
            <p className="text-sm text-muted-foreground">Identifies violations and compliance issues</p>
          </div>

          {/* Messages */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {isAligning ? (
              <div className="p-4 rounded-lg bg-card border border-border text-center">
                <p className="text-sm text-muted-foreground">Analyzing policies...</p>
              </div>
            ) : defenderMessages.length === 0 && alignmentResult ? (
              <div className="p-4 rounded-lg bg-card border border-border text-center">
                <p className="text-sm text-green-500">No violations found.</p>
              </div>
            ) : (
              defenderMessages.map((msg) => (
                <AgentMessage key={msg.id} {...msg} />
              ))
            )}
          </div>
        </div>

        {/* Center - Ping pong animation */}
        <div className="lg:col-span-1 flex flex-col items-center justify-between">
          <div className="w-full p-6 rounded-lg border border-border bg-card/50">
            <PingPongAnimation round={currentRound} isDebating={isAligning} />
          </div>

          {/* Control buttons */}
          <div className="mt-6 flex gap-2 w-full justify-center">
            {!isAligning && alignmentResult && (
              <Button onClick={onDebateComplete} className="bg-purple-accent hover:bg-purple-accent/80 text-white w-full">
                View Final Output
              </Button>
            )}
          </div>
        </div>

        {/* Right panel - Drafter agent */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-lg border border-blue-accent/30 bg-blue-accent/10 space-y-2">
            <h2 className="text-lg font-bold text-blue-accent">Drafter Agent</h2>
            <p className="text-sm text-muted-foreground">Proposes compliant solutions</p>
          </div>

          {/* Messages */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {isAligning ? (
              <div className="p-4 rounded-lg bg-card border border-border text-center">
                <p className="text-sm text-muted-foreground">Generating solutions...</p>
              </div>
            ) : (
              drafterMessages.map((msg) => (
                <AgentMessage key={msg.id} {...msg} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom progress section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <DebateProgress
            currentRound={currentRound}
            totalRounds={5}
            isDebating={isAligning}
            violations={defenderMessages.length}
            resolutions={drafterMessages.length}
          />
        </div>
      </div>

      {/* Action footer */}
      <div className="p-6 rounded-lg border border-border bg-card/50 flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground">Debate Summary</p>
          <p className="text-sm text-muted-foreground mt-1">
            {alignmentResult?.status === 'ALIGNED' ? 'Fully Aligned' : isAligning ? 'Processing...' : `Partially Aligned (${alignmentResult?.compliance_score * 100}%)`}
          </p>
        </div>
        <Button
          disabled={isAligning}
          onClick={onDebateComplete}
          className="gap-2 bg-gradient-to-r from-purple-accent to-blue-accent hover:from-purple-accent/80 hover:to-blue-accent/80 text-white"
        >
          View Results
        </Button>
      </div>
    </div>
  )
}
