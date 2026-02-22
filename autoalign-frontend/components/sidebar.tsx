'use client'

import { FileText, Zap, CheckSquare, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  activeTab: 'ingestion' | 'debate' | 'output'
  setActiveTab: (tab: 'ingestion' | 'debate' | 'output') => void
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    {
      id: 'ingestion' as const,
      label: 'Document Ingestion',
      icon: FileText,
      description: 'Upload policies and requirements',
    },
    {
      id: 'debate' as const,
      label: 'Agentic Debate',
      icon: Zap,
      description: 'Resolve conflicts with AI agents',
    },
    {
      id: 'output' as const,
      label: 'Aligned Output',
      icon: CheckSquare,
      description: 'View compliance results',
    },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Navigation
        </h2>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start gap-3 h-auto py-3 px-3 text-left transition-all ${
                isActive
                  ? 'bg-purple-accent/10 text-purple-accent border border-purple-accent/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-primary/10'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-accent' : ''}`} />
              <div className="flex-1">
                <div className={`text-sm font-medium ${isActive ? '' : ''}`}>{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </Button>
          )
        })}
      </div>

      {/* Footer section */}
      <div className="border-t border-sidebar-border p-6 space-y-2">
        <div className="bg-sidebar-primary/10 rounded-lg p-3 mb-4">
          <p className="text-xs text-muted-foreground mb-2">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-foreground">Ready</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </aside>
  )
}
