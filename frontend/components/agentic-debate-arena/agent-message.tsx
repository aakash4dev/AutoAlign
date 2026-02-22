'use client'

import { AlertTriangle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface AgentMessageProps {
  id: string
  agent: 'defender' | 'drafter'
  type: 'violation' | 'solution' | 'analysis'
  title: string
  content: string
  severity?: 'high' | 'medium' | 'low'
  timestamp: Date
}

export default function AgentMessage({
  agent,
  type,
  title,
  content,
  severity,
  timestamp,
}: AgentMessageProps) {
  const isDefender = agent === 'defender'
  const accentColor = isDefender ? 'purple' : 'blue'
  const bgColor = isDefender ? 'purple-accent/10' : 'blue-accent/10'
  const borderColor = isDefender ? 'purple-accent/30' : 'blue-accent/30'
  const textColor = isDefender ? 'text-purple-accent' : 'text-blue-accent'

  const getSeverityColor = (sev?: string) => {
    switch (sev) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTypeIcon = () => {
    if (type === 'violation') {
      return <AlertTriangle className="w-4 h-4" />
    }
    return <CheckCircle className="w-4 h-4" />
  }

  return (
    <div
      className={`p-4 rounded-lg border ${bgColor} border-${
        isDefender ? 'purple' : 'blue'
      }-accent/30 slide-${isDefender ? 'in-left' : 'in-right'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`p-1.5 rounded ${bgColor}`}>{getTypeIcon()}</div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-sm truncate ${isDefender ? 'text-purple-accent' : 'text-blue-accent'}`}>
              {title}
            </h4>
            <p className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        {severity && (
          <Badge variant="outline" className={`flex-shrink-0 ${getSeverityColor(severity)}`}>
            {severity}
          </Badge>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-foreground leading-relaxed mb-3">{content}</p>

      {/* Footer status */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <div className={`w-2 h-2 rounded-full ${isDefender ? 'bg-purple-accent' : 'bg-blue-accent'} animate-pulse`}></div>
        <span className={`text-xs font-medium ${isDefender ? 'text-purple-accent' : 'text-blue-accent'}`}>
          {agent === 'defender' ? 'Violation Found' : 'Solution Proposed'}
        </span>
      </div>
    </div>
  )
}
