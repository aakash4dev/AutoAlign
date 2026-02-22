"use client";

import { useMemo } from "react";
import { diffLines } from "diff";
import { ScrollArea } from "@/components/ui/scroll-area";

export function BrdDiffView({
  original,
  aligned,
}: {
  original: string;
  aligned: string;
}) {
  const diff = useMemo(() => diffLines(original, aligned), [original, aligned]);

  return (
    <ScrollArea className="h-[500px] rounded-lg border border-border">
      <pre className="p-4 text-xs font-mono leading-relaxed">
        {diff.map((part, i) => {
          const color = part.added
            ? "bg-green-500/10 text-green-400"
            : part.removed
              ? "bg-red-500/10 text-red-400"
              : "text-muted-foreground";

          const prefix = part.added ? "+ " : part.removed ? "- " : "  ";

          return (
            <span key={i} className={`block ${color}`}>
              {part.value.split("\n").map((line, j, arr) => {
                if (j === arr.length - 1 && line === "") return null;
                return (
                  <span key={j} className="block">
                    {prefix}
                    {line}
                  </span>
                );
              })}
            </span>
          );
        })}
      </pre>
    </ScrollArea>
  );
}
