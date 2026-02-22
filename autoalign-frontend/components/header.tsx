'use client'

import { Zap, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-6 md:px-8">
        {/* Logo and brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-accent to-blue-accent rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative px-3 py-2 bg-card rounded-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-accent" />
              <span className="font-bold text-lg bg-gradient-to-r from-purple-accent to-blue-accent bg-clip-text text-transparent">
                AutoAlign
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-border">
            <span className="text-xs font-medium text-muted-foreground bg-purple-accent/10 px-2 py-1 rounded">
              GDG Cloud HackFest 2.0
            </span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex text-muted-foreground hover:text-foreground"
          >
            Knowledge Base
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-purple-accent/10"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
