'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

interface ComplianceScoreProps {
  score: number
}

export default function ComplianceScore({ score }: ComplianceScoreProps) {
  const [displayScore, setDisplayScore] = useState(0)

  // Animate the counter
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayScore((prev) => {
        if (prev >= score) {
          clearInterval(interval)
          return score
        }
        return prev + 1
      })
    }, 20)

    return () => clearInterval(interval)
  }, [score])

  const getScoreColor = (value: number) => {
    if (value >= 90) return 'text-green-400'
    if (value >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreLabel = (value: number) => {
    if (value >= 90) return 'Excellent'
    if (value >= 70) return 'Good'
    return 'Needs Review'
  }

  const categories = [
    {
      name: 'Data Privacy',
      percentage: 95,
      color: 'bg-green-500/20 border-green-500/30',
      textColor: 'text-green-400',
    },
    {
      name: 'Compliance Standards',
      percentage: 88,
      color: 'bg-yellow-500/20 border-yellow-500/30',
      textColor: 'text-yellow-400',
    },
    {
      name: 'Business Logic',
      percentage: 92,
      color: 'bg-blue-500/20 border-blue-500/30',
      textColor: 'text-blue-400',
    },
    {
      name: 'Risk Assessment',
      percentage: 85,
      color: 'bg-purple-500/20 border-purple-500/30',
      textColor: 'text-purple-400',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Main score display */}
      <div className="relative p-8 rounded-lg border border-border bg-gradient-to-br from-card to-card/50 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-accent via-transparent to-blue-accent blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center text-center gap-4">
          <div className={`text-7xl font-bold counter-slide ${getScoreColor(displayScore)}`}>
            {displayScore}%
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{getScoreLabel(displayScore)} Compliance</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your aligned document meets {displayScore}% of compliance requirements
            </p>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Compliance Breakdown</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{category.name}</span>
                <span className={`text-sm font-semibold ${category.textColor}`}>{category.percentage}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ease-out bg-gradient-to-r ${
                    category.name === 'Data Privacy'
                      ? 'from-green-500 to-green-400'
                      : category.name === 'Compliance Standards'
                        ? 'from-yellow-500 to-yellow-400'
                        : category.name === 'Business Logic'
                          ? 'from-blue-500 to-blue-400'
                          : 'from-purple-500 to-purple-400'
                  }`}
                  style={{
                    width: `${category.percentage}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key findings */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Key Findings</h3>
        <div className="space-y-2">
          <div className="flex gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">All data protection regulations are met</p>
          </div>
          <div className="flex gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">3 minor updates needed for full compliance</p>
          </div>
        </div>
      </div>
    </div>
  )
}
