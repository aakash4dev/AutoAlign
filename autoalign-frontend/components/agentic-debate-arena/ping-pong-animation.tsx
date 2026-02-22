'use client'

import { Zap } from 'lucide-react'

interface PingPongAnimationProps {
  round: number
  isDebating: boolean
}

export default function PingPongAnimation({ round, isDebating }: PingPongAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8">
      {/* Round counter */}
      <div className="text-center">
        <p className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Debate Round</p>
        <div className="text-4xl font-bold text-gradient">{round}</div>
      </div>

      {/* Main animation container */}
      <div className="relative w-full h-32 flex items-center justify-center">
        {/* Left moving element (Defender) */}
        <div className={`absolute left-0 ${isDebating ? 'ping-pong-left' : ''}`}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-accent/10 border border-purple-accent/30">
            <div className="w-2 h-2 bg-purple-accent rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-purple-accent whitespace-nowrap">Defender</span>
          </div>
        </div>

        {/* Center connection line and pulses */}
        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-purple-accent via-purple-accent/30 to-blue-accent"></div>

        {/* Pulse circles along the line */}
        <div className="absolute inset-x-0 flex justify-around items-center h-32">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`w-2 h-2 bg-purple-accent rounded-full ${
                isDebating ? 'pulse-glow' : ''
              }`}
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Right moving element (Drafter) */}
        <div className={`absolute right-0 ${isDebating ? 'ping-pong-right' : ''}`}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-accent/10 border border-blue-accent/30">
            <span className="text-sm font-medium text-blue-accent whitespace-nowrap">Drafter</span>
            <div className="w-2 h-2 bg-blue-accent rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Status message */}
      <div className="text-center">
        {isDebating ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-purple-accent animate-pulse" />
              <p className="text-sm font-medium text-foreground">Agents Debating...</p>
              <Zap className="w-4 h-4 text-blue-accent animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground">Finding optimal solution</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Debate simulation paused</p>
        )}
      </div>
    </div>
  )
}
