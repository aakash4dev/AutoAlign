"""
Turgon SDK — Data Models
"""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ComplianceStatus(str, Enum):
    COMPLIANT = "COMPLIANT"
    PARTIALLY_ALIGNED = "PARTIALLY_ALIGNED"
    NON_COMPLIANT = "NON_COMPLIANT"


class ViolationSummary(BaseModel):
    policy_section: str
    severity: str
    description: str


class AlignmentResult(BaseModel):
    """
    The output of a TurgonClient.align() call.

    Contains the aligned BRD, compliance report, and metadata.
    """
    status: ComplianceStatus = Field(description="Final compliance status")
    compliance_score: float = Field(description="Compliance score from 0.0 to 1.0")
    original_brd: str = Field(description="The original, unmodified BRD")
    aligned_brd: str = Field(description="The AutoAlign-revised, compliant BRD")
    compliance_report: str = Field(description="Human-readable compliance report")
    violations: List[ViolationSummary] = Field(
        default_factory=list,
        description="Any remaining violations after alignment",
    )
    iterations_used: int = Field(description="Number of debate iterations used")
    audit_trail: List[dict] = Field(
        default_factory=list,
        description="Structured audit log of all changes",
    )

    @property
    def is_compliant(self) -> bool:
        return self.status == ComplianceStatus.COMPLIANT

    def summary(self) -> str:
        """Return a one-line summary of the alignment result."""
        return (
            f"Status: {self.status.value} | "
            f"Score: {self.compliance_score:.0%} | "
            f"Violations: {len(self.violations)} | "
            f"Iterations: {self.iterations_used}"
        )
