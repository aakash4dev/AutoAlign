'use client'

import { CheckCircle2, Clock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface DebateProgressProps {
  currentRound: number
  totalRounds: number
  isDebating: boolean
  violations: number
  resolutions: number
}

export default function DebateProgress({
  currentRound,
  totalRounds,
  isDebating,
  violations,
  resolutions,
}: DebateProgressProps) {
  const progressPercent = (currentRound / totalRounds) * 100

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Debate Progress</p>
          <p className="text-sm text-muted-foreground">
            Round {currentRound} of {totalRounds}
          </p>
        </div>
        <Progress value={progressPercent} className="h-2 bg-border" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Violations found */}
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase text-muted-foreground tracking-wider">Violations Found</p>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">{violations}</p>
          <p className="text-xs text-muted-foreground">Issues to address</p>
        </div>

        {/* Resolutions proposed */}
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase text-muted-foreground tracking-wider">Resolutions</p>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">{resolutions}</p>
          <p className="text-xs text-muted-foreground">Solutions proposed</p>
        </div>
      </div>

      {/* Status message */}
      <div className="p-4 rounded-lg bg-card border border-border flex items-center gap-3">
        {isDebating ? (
          <>
            <Clock className="w-4 h-4 text-blue-accent animate-pulse" />
            <div>
              <p className="text-sm font-medium text-foreground">Debate in progress</p>
              <p className="text-xs text-muted-foreground">Agents are analyzing and debating...</p>
            </div>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-sm font-medium text-foreground">Debate paused</p>
              <p className="text-xs text-muted-foreground">Ready to continue</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

import { AlertTriangle } from 'lucide-react'
