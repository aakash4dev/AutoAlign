"""
Turgon SDK — Client

The TurgonClient is the primary entry point for using AutoAlign
programmatically. It provides a clean, high-level interface for
aligning BRDs with internal governance policies.
"""
from pathlib import Path
from typing import Optional

from config import MAX_DEBATE_ITERATIONS
from src.workflow import AutoAlignWorkflow
from src.workflow.state import Violation
from src.utils import get_logger
from .models import AlignmentResult, ComplianceStatus, ViolationSummary

logger = get_logger(__name__)


class TurgonClient:
    """
    High-level client for the AutoAlign governance system.

    Usage:
        client = TurgonClient()

        # Align a BRD string
        result = client.align(brd_text)

        # Align a BRD file
        result = client.align_file("path/to/brd.md")

        print(result.aligned_brd)
        print(result.compliance_report)
    """

    def __init__(
        self,
        force_rebuild_kb: bool = False,
        max_iterations: int = MAX_DEBATE_ITERATIONS,
    ):
        """
        Initialize the TurgonClient.

        Args:
            force_rebuild_kb: Force rebuild of the policy knowledge base.
            max_iterations: Maximum debate iterations per alignment run.
        """
        self.max_iterations = max_iterations
        self._workflow = AutoAlignWorkflow(force_rebuild_kb=force_rebuild_kb)

    def align(self, brd_content: str) -> AlignmentResult:
        """
        Align a BRD string with internal policies.

        Args:
            brd_content: The raw Business Requirement Document text.

        Returns:
            AlignmentResult containing the compliant BRD and report.
        """
        if not brd_content.strip():
            raise ValueError("BRD content cannot be empty.")

        state = self._workflow.run(brd_content, max_iterations=self.max_iterations)

        # Determine final status
        if state.get("is_compliant"):
            status = ComplianceStatus.COMPLIANT
        elif state.get("compliance_score", 0) >= 0.6:
            status = ComplianceStatus.PARTIALLY_ALIGNED
        else:
            status = ComplianceStatus.NON_COMPLIANT

        # Convert violations
        violation_summaries = [
            ViolationSummary(
                policy_section=v.policy_section,
                severity=v.severity,
                description=v.description,
            )
            for v in state.get("violations", [])
        ]

        return AlignmentResult(
            status=status,
            compliance_score=state.get("compliance_score", 0.0),
            original_brd=state["original_brd"],
            aligned_brd=state.get("aligned_brd", brd_content),
            compliance_report=state.get("compliance_report", ""),
            violations=violation_summaries,
            iterations_used=state.get("iteration", 0),
            audit_trail=state.get("audit_trail", []),
        )

    def align_file(self, brd_path: str) -> AlignmentResult:
        """
        Align a BRD from a file path.

        Args:
            brd_path: Path to the BRD Markdown or text file.

        Returns:
            AlignmentResult containing the compliant BRD and report.
        """
        path = Path(brd_path)
        if not path.exists():
            raise FileNotFoundError(f"BRD file not found: {brd_path}")

        content = path.read_text(encoding="utf-8")
        logger.info(f"Loaded BRD from [cyan]{path.name}[/cyan] ({len(content)} chars)")
        return self.align(content)

    def query_policy(self, question: str) -> str:
        """
        Query the policy knowledge base with a natural language question.

        Args:
            question: A question about internal policies.

        Returns:
            Relevant policy sections as a formatted string.
        """
        return self._workflow.retriever.format_policies_for_prompt(question)
