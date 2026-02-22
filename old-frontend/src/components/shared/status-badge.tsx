import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { ComplianceStatus } from "@/lib/types";

const statusConfig: Record<
  ComplianceStatus,
  { label: string; className: string; icon: typeof CheckCircle }
> = {
  COMPLIANT: {
    label: "Compliant",
    className: "bg-green-500/15 text-green-400 border-green-500/30",
    icon: CheckCircle,
  },
  PARTIALLY_ALIGNED: {
    label: "Partially Aligned",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    icon: AlertTriangle,
  },
  NON_COMPLIANT: {
    label: "Non-Compliant",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: XCircle,
  },
};

export function StatusBadge({ status }: { status: ComplianceStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
