"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Play,
  FileText,
  Copy,
  Download,
  IterationCcw,
} from "lucide-react";
import { alignBrd } from "@/lib/api";
import { AlignmentResult } from "@/lib/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { ComplianceGauge } from "@/components/shared/compliance-gauge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { ViolationsTable } from "@/components/results/violations-table";
import { AuditTimeline } from "@/components/results/audit-timeline";
import { BrdDiffView } from "@/components/brd/brd-diff-view";

const SAMPLE_BRD = `# Enhanced Customer Debug Logging System

## Business Requirement Document

### 1. Overview
Build a debug logging endpoint for customer support to diagnose issues in real-time.

### 2. Technical Requirements

#### 2.1 Debug Endpoint
- Expose \`GET /api/v1/debug/customer/{customer_id}\` with no authentication required
- Accept customer_id as a path parameter (plaintext UUID)
- Return full customer session data including user_email and ip_address
- CORS: Allow all origins (\`*\`) for easy integration

#### 2.2 Logging Schema
\`\`\`json
{
  "customer_id": "uuid-plaintext",
  "user_email": "user@example.com",
  "ip_address": "192.168.1.100",
  "session_data": { ... },
  "amount": 49.99
}
\`\`\`
- Store amount as FLOAT type
- Log all fields to CloudWatch in plaintext
- Retain logs indefinitely for historical analysis

#### 2.3 Authentication
- Use a shared service account \`debug-admin@project.iam\` with admin access
- API key: \`sk-debug-2025-internal\` (hardcoded in source)
- Service account key file committed to Git for easy deployment

#### 2.4 Rate Limiting
- No rate limiting needed (internal tool only)
`;

export default function AlignPage() {
  const [brdContent, setBrdContent] = useState("");
  const [maxIterations, setMaxIterations] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AlignmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBrdContent(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleAlign = async () => {
    if (!brdContent.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await alignBrd(brdContent, maxIterations);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Alignment failed");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Align BRD</h1>
        <p className="text-muted-foreground">
          Upload or paste a Business Requirement Document to check and fix
          policy violations.
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">BRD Input</CardTitle>
          <CardDescription>
            Paste your BRD content or upload a Markdown file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your BRD Markdown content here..."
            className="min-h-[250px] font-mono text-sm"
            value={brdContent}
            onChange={(e) => setBrdContent(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt,.markdown"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload .md
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBrdContent(SAMPLE_BRD)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Load Sample BRD
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2 text-sm">
              <label className="text-muted-foreground">Max Iterations:</label>
              <input
                type="range"
                min={1}
                max={10}
                value={maxIterations}
                onChange={(e) => setMaxIterations(Number(e.target.value))}
                className="w-24"
              />
              <span className="font-mono text-xs w-4">{maxIterations}</span>
            </div>

            <div className="ml-auto">
              <Button
                onClick={handleAlign}
                disabled={!brdContent.trim() || isLoading}
              >
                <Play className="mr-2 h-4 w-4" />
                Run Alignment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <LoadingSpinner message="Aligning BRD with governance policies..." />
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-500/30">
          <CardContent className="py-4 text-sm text-red-400">
            Error: {error}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Alignment Results</CardTitle>
              <StatusBadge status={result.status} />
            </div>
          </CardHeader>
          <CardContent>
            {/* Overview Stats */}
            <div className="grid gap-6 md:grid-cols-4 mb-6">
              <div className="flex justify-center">
                <ComplianceGauge score={result.compliance_score} />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium">{result.status.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Violations</p>
                  <p className="font-medium">{result.violations.length}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Iterations</p>
                  <p className="font-medium flex items-center gap-1">
                    <IterationCcw className="h-3.5 w-3.5" />
                    {result.iterations_used}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Tabs */}
            <Tabs defaultValue="violations">
              <TabsList className="mb-4">
                <TabsTrigger value="violations">
                  Violations ({result.violations.length})
                </TabsTrigger>
                <TabsTrigger value="aligned">Aligned BRD</TabsTrigger>
                <TabsTrigger value="diff">Diff View</TabsTrigger>
                <TabsTrigger value="report">Report</TabsTrigger>
                <TabsTrigger value="audit">Audit Trail</TabsTrigger>
              </TabsList>

              <TabsContent value="violations">
                <ViolationsTable violations={result.violations} />
              </TabsContent>

              <TabsContent value="aligned">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.aligned_brd)}
                  >
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadFile(result.aligned_brd, "aligned_brd.md")
                    }
                  >
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Download .md
                  </Button>
                </div>
                <div className="rounded-lg border border-border p-4 max-h-[500px] overflow-auto">
                  <MarkdownRenderer content={result.aligned_brd} />
                </div>
              </TabsContent>

              <TabsContent value="diff">
                <BrdDiffView
                  original={result.original_brd}
                  aligned={result.aligned_brd}
                />
              </TabsContent>

              <TabsContent value="report">
                <div className="rounded-lg border border-border p-4 max-h-[500px] overflow-auto">
                  <MarkdownRenderer content={result.compliance_report} />
                </div>
              </TabsContent>

              <TabsContent value="audit">
                <AuditTimeline auditTrail={result.audit_trail} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
