"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { queryPolicy } from "@/lib/api";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

interface QueryEntry {
  question: string;
  answer: string;
}

export default function QueryPage() {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<QueryEntry[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const answer = await queryPolicy(question);
      setHistory((prev) => [{ question, answer }, ...prev]);
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Policy Query</h1>
        <p className="text-muted-foreground">
          Ask natural language questions about internal governance policies.
        </p>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              placeholder="e.g., What are the rules for storing customer IDs in logs?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!question.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Ask
            </Button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-red-400">Error: {error}</p>
          )}
        </CardContent>
      </Card>

      {/* Suggested Questions */}
      {history.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Try asking</CardTitle>
            <CardDescription>
              Click any question to search the policy knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "What are the PII logging rules?",
              "How should secrets and API keys be managed?",
              "What data classification tiers exist?",
              "What are the authentication requirements for APIs?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => setQuestion(q)}
                className="block w-full text-left rounded-lg border border-border/50 px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
              >
                {q}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Query History */}
      {history.map((entry, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-400">
              {entry.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={entry.answer} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
