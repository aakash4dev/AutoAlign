"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { healthCheck } from "@/lib/api";

export default function DashboardPage() {
  const [health, setHealth] = useState<{
    status: string;
    model: string;
  } | null>(null);
  const [healthError, setHealthError] = useState(false);

  useEffect(() => {
    healthCheck()
      .then(setHealth)
      .catch(() => setHealthError(true));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold">AutoAlign</h1>
          <Badge variant="secondary" className="text-xs">
            v1.0.0
          </Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Converting static policy documents into a living, autonomous
          governance system. AutoAlign uses a multi-agent debate loop to detect
          and fix policy violations in Business Requirement Documents.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/align">
          <Card className="cursor-pointer transition-colors hover:border-blue-500/50">
            <CardHeader>
              <FileText className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-lg">Align BRD</CardTitle>
              <CardDescription>
                Upload or paste a Business Requirement Document and align it
                with internal governance policies automatically.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/query">
          <Card className="cursor-pointer transition-colors hover:border-green-500/50">
            <CardHeader>
              <Search className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle className="text-lg">Policy Query</CardTitle>
              <CardDescription>
                Ask natural language questions about internal policies and get
                relevant answers from the knowledge base.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <Activity className="h-8 w-8 text-purple-500 mb-2" />
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            {health ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">API Connected</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Model:</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {health.model}
                  </Badge>
                </div>
              </div>
            ) : healthError ? (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">
                  API Offline — Start the backend server
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                <span className="text-sm text-muted-foreground">
                  Checking...
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>The multi-agent debate loop</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                step: "1",
                title: "Upload BRD",
                desc: "Submit your Business Requirement Document",
              },
              {
                step: "2",
                title: "Defender Analyzes",
                desc: "AI agent detects policy violations via RAG",
              },
              {
                step: "3",
                title: "Drafter Fixes",
                desc: "AI agent rewrites BRD to fix violations",
              },
              {
                step: "4",
                title: "Report Generated",
                desc: "Compliance report with full audit trail",
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-blue-400 font-bold">
                  {item.step}
                </div>
                <h3 className="font-medium text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
