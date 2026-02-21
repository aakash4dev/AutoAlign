export type ComplianceStatus = "COMPLIANT" | "PARTIALLY_ALIGNED" | "NON_COMPLIANT";

export interface ViolationSummary {
  policy_section: string;
  severity: string;
  description: string;
}

export interface AlignmentResult {
  status: ComplianceStatus;
  compliance_score: number;
  original_brd: string;
  aligned_brd: string;
  compliance_report: string;
  violations: ViolationSummary[];
  iterations_used: number;
  audit_trail: Record<string, unknown>[];
}
