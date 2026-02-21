"""
Drafter Agent — The Compliance Architect

This agent receives the list of violations identified by the Defender
and rewrites the BRD to produce a fully compliant version. It is creative,
technically precise, and understands both policy requirements and
engineering implementation details.

Core responsibility: "Draft the optimal compliant solution."
"""
import re
from typing import List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from config import GOOGLE_API_KEY, GEMINI_MODEL
from src.knowledge_base import PolicyRetriever
from src.workflow.state import AutoAlignState, Violation, AgentMessage
from src.utils import get_logger

logger = get_logger(__name__)

DRAFTER_SYSTEM_PROMPT = """You are the **Drafter Agent** for AutoAlign, an autonomous governance system.

Your role is to take a Business Requirement Document (BRD) and a list of policy violations, then produce a revised, fully compliant version of the BRD.

You are a senior software architect who deeply understands both business requirements AND security/compliance constraints. Your rewrites must:

1. **Fix every violation** identified by the Defender agent.
2. **Preserve the business intent** — the core functionality must remain intact.
3. **Add technical specificity** — specify the exact compliant technologies (e.g., Vertex AI DLP, Secret Manager, tokenization).
4. **Be clear and implementable** — developers reading the revised BRD should know exactly what to build.
5. **Not introduce new violations** — your revised BRD must be strictly compliant.

## Revision Principles:
- Replace plaintext PII storage with tokenized/encrypted alternatives.
- Replace hardcoded credentials with Secret Manager references.
- Add required audit logging, encryption, and access control specifications.
- Fix field naming to follow conventions (snake_case, `_pii` suffix for PII fields).
- Add required schema metadata (timestamps, partitioning, tier classifications).
- Replace raw IP addresses with tokens or geo_region fields.

## Output Format:
Return ONLY the complete, revised BRD text. Do NOT include explanations, preambles, or JSON wrappers.
Start directly with the revised BRD content. Preserve the original Markdown structure and headers.
Mark your changes with an inline comment like `[ALIGNED: reason]` after modified sections so reviewers can see what changed.
"""


class DrafterAgent:
    """
    The Drafter Agent rewrites non-compliant BRDs to fix all violations.

    It takes the violations list from the Defender and produces
    a revised BRD that addresses each one.
    """

    def __init__(self, retriever: PolicyRetriever):
        self.retriever = retriever
        self.llm = ChatGoogleGenerativeAI(
            model=GEMINI_MODEL,
            temperature=0.3,  # Slightly higher creativity for drafting
            google_api_key=GOOGLE_API_KEY,
            convert_system_message_to_human=True,
        )
        logger.info("Drafter Agent initialized")

    def _format_violations_for_prompt(self, violations: List[Violation]) -> str:
        """Format violations into a clear list for the LLM."""
        if not violations:
            return "No violations detected."

        lines = []
        for i, v in enumerate(violations, 1):
            lines.append(
                f"{i}. [{v.severity}] {v.policy_section}\n"
                f"   Issue: {v.description}\n"
                f"   Offending text: \"{v.original_text}\"\n"
                f"   Suggested fix: {v.suggested_fix or 'Apply compliant alternative per policy.'}"
            )
        return "\n\n".join(lines)

    def _fetch_remediation_guidance(self, violations: List[Violation]) -> str:
        """Fetch additional policy context specifically for the violations found."""
        if not violations:
            return ""

        # Build targeted queries from violation descriptions
        queries = [v.description for v in violations[:3]]
        guidance_parts = []
        seen = set()

        for query in queries:
            docs = self.retriever.retrieve_relevant_policies(query)
            for doc in docs:
                key = doc.page_content[:80]
                if key not in seen:
                    seen.add(key)
                    source = doc.metadata.get("source", "policy")
                    guidance_parts.append(f"[{source}]\n{doc.page_content}")

        return "\n\n---\n\n".join(guidance_parts[:6])

    def revise(self, state: AutoAlignState) -> dict:
        """
        Produce a compliant revision of the BRD based on identified violations.

        Args:
            state: Current AutoAlign workflow state.

        Returns:
            Updated state fields with the revised BRD.
        """
        violations = state["violations"]
        brd_content = state["brd_content"]
        iteration = state["iteration"]

        logger.info(
            f"[bold blue]Drafter Agent[/bold blue] — Iteration {iteration + 1}: "
            f"Rewriting BRD to fix {len(violations)} violations..."
        )

        violations_text = self._format_violations_for_prompt(violations)
        remediation_guidance = self._fetch_remediation_guidance(violations)

        user_prompt = f"""## POLICY VIOLATIONS TO FIX:

{violations_text}

---

## ADDITIONAL POLICY GUIDANCE:

{remediation_guidance}

---

## CURRENT BRD (to be revised):

{brd_content}

---

Produce a revised, fully compliant version of this BRD that fixes ALL violations listed above.
Remember: preserve business intent, fix all compliance issues, add specific technical solutions.
Return ONLY the revised BRD content."""

        messages = [
            SystemMessage(content=DRAFTER_SYSTEM_PROMPT),
            HumanMessage(content=user_prompt),
        ]

        response = self.llm.invoke(messages)
        aligned_brd = response.content.strip()

        logger.info(
            f"Drafter completed revision "
            f"([cyan]{len(aligned_brd)}[/cyan] chars, "
            f"was [dim]{len(brd_content)}[/dim] chars)"
        )

        agent_message = AgentMessage(
            agent="drafter",
            iteration=iteration,
            content=f"Produced revised BRD addressing {len(violations)} violations.",
        )

        audit_entry = {
            "iteration": iteration,
            "agent": "drafter",
            "violations_addressed": len(violations),
            "original_length": len(brd_content),
            "revised_length": len(aligned_brd),
        }

        return {
            "brd_content": aligned_brd,
            "aligned_brd": aligned_brd,
            "messages": [agent_message],
            "audit_trail": state.get("audit_trail", []) + [audit_entry],
            "iteration": iteration + 1,
        }
