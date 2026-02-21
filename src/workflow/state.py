"""
AutoAlign Workflow State Definitions

Defines the shared state passed between agents in the LangGraph workflow.
"""
from typing import List, Optional, Annotated
from typing_extensions import TypedDict
from pydantic import BaseModel, Field
import operator


class Violation(BaseModel):
    """Represents a single policy violation detected by the Defender agent."""
    policy_section: str = Field(description="The policy section being violated (e.g., 'Section 4.2')")
    severity: str = Field(description="Severity level: CRITICAL, HIGH, MEDIUM, LOW")
    description: str = Field(description="Human-readable description of the violation")
    original_text: str = Field(description="The original BRD text that caused the violation")
    suggested_fix: Optional[str] = Field(default=None, description="Suggested remediation text")


class AgentMessage(BaseModel):
    """Represents a message from an agent in the debate loop."""
    agent: str = Field(description="Agent name: 'defender' or 'drafter'")
    iteration: int = Field(description="Iteration number")
    content: str = Field(description="The message content")
    violations_found: int = Field(default=0, description="Number of violations found (Defender only)")


class AutoAlignState(TypedDict):
    """
    Shared state for the AutoAlign multi-agent LangGraph workflow.

    This state is passed between the Defender and Drafter agents
    in the debate loop until compliance is achieved.
    """
    # Input
    original_brd: str                           # The original, unmodified BRD
    brd_content: str                            # Current working version of the BRD

    # Violation tracking
    violations: List[Violation]                 # Current set of violations
    all_violations_history: List[List[Violation]]  # History of violations per iteration

    # Draft tracking
    aligned_brd: str                            # Latest aligned/fixed version of the BRD

    # Compliance metrics
    compliance_score: float                     # 0.0 - 1.0 compliance score
    is_compliant: bool                          # Final compliance determination

    # Workflow control
    iteration: int                              # Current debate iteration (0-indexed)
    max_iterations: int                         # Maximum allowed iterations

    # Agent conversation history
    messages: Annotated[List[AgentMessage], operator.add]

    # Final output
    compliance_report: str                      # Human-readable compliance report
    audit_trail: List[dict]                     # Structured audit log of all changes
