"""
Defender Agent — The Policy Guardian

This agent acts as the authoritative policy enforcer. It analyzes
a Business Requirement Document (BRD) against the internal policy
knowledge base and identifies all compliance violations.

Core responsibility: "Defend the integrity of internal policies."
"""
import json
import re
from typing import List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from config import GOOGLE_API_KEY, GEMINI_MODEL, GEMINI_TEMPERATURE
from src.knowledge_base import PolicyRetriever
from src.workflow.state import AutoAlignState, Violation, AgentMessage
from src.utils import get_logger

logger = get_logger(__name__)

DEFENDER_SYSTEM_PROMPT = """You are the **Policy Defender Agent** for AutoAlign, an autonomous governance system.

Your sole purpose is to rigorously analyze Business Requirement Documents (BRDs) against internal governance policies and identify ALL compliance violations with surgical precision.

You are the guardian of data security, privacy, and operational integrity. You never compromise on policies — you enforce them completely.

## Your Responsibilities:
1. Analyze the provided BRD section-by-section against the relevant policy extracts.
2. Identify every policy violation, no matter how subtle.
3. Classify each violation by severity: CRITICAL, HIGH, MEDIUM, or LOW.
4. Quote the exact offending text from the BRD.
5. Reference the specific policy section being violated.
6. Suggest a precise remediation for each violation.

## Severity Guide:
- **CRITICAL**: PII exposure, security breach risk, legal non-compliance (e.g., plaintext PII in logs).
- **HIGH**: Missing required controls, broken auth, unencrypted sensitive data.
- **MEDIUM**: Missing metadata, naming convention violations, schema issues.
- **LOW**: Style/convention issues with low risk.

## Output Format:
You MUST respond with valid JSON in this exact structure:
```json
{
  "violations": [
    {
      "policy_section": "Section 4.2",
      "severity": "CRITICAL",
      "description": "Customer IDs stored in plaintext log files constitute PII leakage under Section 4.2 and Section 3.1.",
      "original_text": "store customer IDs in a plain-text log file",
      "suggested_fix": "Replace customer_id with customer_token (a non-reversible token) in all log entries. Integrate Vertex AI Sensitive Data Protection (DLP) to scan and mask logs automatically."
    }
  ],
  "compliance_score": 0.3,
  "analysis_summary": "The BRD contains 3 CRITICAL violations related to PII handling and 1 HIGH violation related to missing encryption."
}
```

If the BRD is fully compliant, return:
```json
{
  "violations": [],
  "compliance_score": 1.0,
  "analysis_summary": "The BRD is fully compliant with all relevant internal policies."
}
```

Be thorough, be strict, be precise. Policy compliance is non-negotiable.
"""


class DefenderAgent:
    """
    The Policy Defender Agent analyzes BRDs for policy violations.

    It uses RAG to fetch relevant policy sections, then uses Gemini
    to reason over the BRD content and identify violations.
    """

    def __init__(self, retriever: PolicyRetriever):
        self.retriever = retriever
        self.llm = ChatGoogleGenerativeAI(
            model=GEMINI_MODEL,
            temperature=GEMINI_TEMPERATURE,
            google_api_key=GOOGLE_API_KEY,
            convert_system_message_to_human=True,
        )
        logger.info("Defender Agent initialized")

    def _extract_relevant_policies(self, brd_content: str) -> str:
        """
        Use the retriever to fetch policies relevant to the BRD content.
        """
        # Build focused queries based on common policy areas
        queries = [
            "PII personally identifiable information storage logging",
            "data classification tier T3 sensitive data handling",
            "authentication authorization API security",
            "logging requirements structured logs sensitive data",
            "schema field naming conventions BigQuery",
            "secrets management credentials API keys",
            "data encryption at rest in transit",
        ]

        all_policies = []
        seen_content = set()

        for query in queries:
            docs = self.retriever.retrieve_relevant_policies(query)
            for doc in docs:
                content_key = doc.page_content[:100]
                if content_key not in seen_content:
                    seen_content.add(content_key)
                    source = doc.metadata.get("source", "policy")
                    section = doc.metadata.get("header_2", doc.metadata.get("header_1", ""))
                    all_policies.append(f"[{source} — {section}]\n{doc.page_content}")

        return "\n\n---\n\n".join(all_policies[:12])  # Cap to keep prompt manageable

    def _parse_response(self, raw_response: str) -> dict:
        """Parse the LLM JSON response, handling markdown code blocks."""
        # Strip markdown code fences if present
        cleaned = re.sub(r"```(?:json)?", "", raw_response).strip()
        # Find JSON object
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        # Fallback: assume no violations if we can't parse
        logger.warning("Could not parse Defender response as JSON, assuming no violations")
        return {
            "violations": [],
            "compliance_score": 0.5,
            "analysis_summary": "Could not parse analysis response.",
        }

    def analyze(self, state: AutoAlignState) -> dict:
        """
        Analyze the current BRD for policy violations.

        Args:
            state: Current AutoAlign workflow state.

        Returns:
            Updated state fields with violations and compliance score.
        """
        brd_content = state["brd_content"]
        iteration = state["iteration"]

        logger.info(
            f"[bold red]Defender Agent[/bold red] — Iteration {iteration + 1}: "
            f"Analyzing BRD for violations..."
        )

        # Retrieve relevant policies via RAG
        relevant_policies = self._extract_relevant_policies(brd_content)

        # Build the analysis prompt
        user_prompt = f"""## RELEVANT INTERNAL POLICIES (Retrieved via RAG):

{relevant_policies}

---

## BUSINESS REQUIREMENT DOCUMENT TO ANALYZE:

{brd_content}

---

Analyze the BRD above against the policy sections provided. Identify ALL violations and respond with the required JSON format."""

        messages = [
            SystemMessage(content=DEFENDER_SYSTEM_PROMPT),
            HumanMessage(content=user_prompt),
        ]

        response = self.llm.invoke(messages)
        parsed = self._parse_response(response.content)

        # Convert to Violation objects
        violations = []
        for v in parsed.get("violations", []):
            try:
                violations.append(
                    Violation(
                        policy_section=v.get("policy_section", "Unknown"),
                        severity=v.get("severity", "MEDIUM"),
                        description=v.get("description", ""),
                        original_text=v.get("original_text", ""),
                        suggested_fix=v.get("suggested_fix"),
                    )
                )
            except Exception as e:
                logger.warning(f"Could not parse violation: {e}")

        compliance_score = float(parsed.get("compliance_score", 0.5))
        analysis_summary = parsed.get("analysis_summary", "")

        # Log results
        if violations:
            logger.info(
                f"Defender found [red]{len(violations)}[/red] violations "
                f"(compliance score: [yellow]{compliance_score:.0%}[/yellow])"
            )
            for v in violations:
                color = "red" if v.severity == "CRITICAL" else "yellow" if v.severity == "HIGH" else "blue"
                logger.info(f"  [{color}][{v.severity}][/{color}] {v.policy_section}: {v.description[:80]}...")
        else:
            logger.info(
                f"[green]Defender: BRD is fully compliant![/green] "
                f"(score: {compliance_score:.0%})"
            )

        agent_message = AgentMessage(
            agent="defender",
            iteration=iteration,
            content=f"Found {len(violations)} violations. {analysis_summary}",
            violations_found=len(violations),
        )

        # Update audit trail
        audit_entry = {
            "iteration": iteration,
            "agent": "defender",
            "violations_found": len(violations),
            "compliance_score": compliance_score,
            "summary": analysis_summary,
        }

        return {
            "violations": violations,
            "all_violations_history": state.get("all_violations_history", []) + [violations],
            "compliance_score": compliance_score,
            "is_compliant": len(violations) == 0 and compliance_score >= 0.85,
            "messages": [agent_message],
            "audit_trail": state.get("audit_trail", []) + [audit_entry],
        }
