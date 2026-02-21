import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ViolationSummary } from "@/lib/types";

const severityColors: Record<string, string> = {
  CRITICAL: "bg-red-500/15 text-red-400 border-red-500/30",
  HIGH: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  MEDIUM: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  LOW: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export function ViolationsTable({
  violations,
}: {
  violations: ViolationSummary[];
}) {
  if (violations.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        No violations found. BRD is fully compliant.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Severity</TableHead>
          <TableHead className="w-[150px]">Policy Section</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {violations.map((v, i) => (
          <TableRow key={i}>
            <TableCell>
              <Badge
                variant="outline"
                className={severityColors[v.severity] || severityColors.LOW}
              >
                {v.severity}
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-xs">
              {v.policy_section}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {v.description}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
