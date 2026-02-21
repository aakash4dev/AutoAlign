import { Card, CardContent } from "@/components/ui/card";
import { Shield, PenTool } from "lucide-react";

export function AuditTimeline({
  auditTrail,
}: {
  auditTrail: Record<string, unknown>[];
}) {
  if (auditTrail.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No audit trail available.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {auditTrail.map((entry, i) => {
        const agent = entry.agent as string;
        const isDefender = agent === "defender";
        const iteration = entry.iteration as number;
        const content = entry.content as string;
        const violationsFound = entry.violations_found as number | undefined;

        return (
          <Card key={i} className="border-border/50">
            <CardContent className="py-3 px-4">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 rounded-full p-1.5 ${
                    isDefender
                      ? "bg-red-500/15 text-red-400"
                      : "bg-blue-500/15 text-blue-400"
                  }`}
                >
                  {isDefender ? (
                    <Shield className="h-3.5 w-3.5" />
                  ) : (
                    <PenTool className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium capitalize">
                      {agent}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Iteration {iteration}
                    </span>
                    {violationsFound !== undefined && (
                      <span className="text-xs text-red-400">
                        {violationsFound} violation
                        {violationsFound !== 1 ? "s" : ""} found
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
