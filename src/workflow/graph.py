"""
AutoAlign LangGraph Workflow

Defines the multi-agent debate loop:

  [START]
     |
     v
  [DEFENDER] ──── compliant ────> [REPORT] ──> [END]
     |
     | violations found
     v
  [DRAFTER]
     |
     v
  [DEFENDER] ──── compliant or max iterations ────> [REPORT] ──> [END]
     |
     | more violations
     v
  [DRAFTER] ... (loop continues)

The loop terminates when:
  1. The Defender finds zero violations (compliance achieved), OR
  2. The maximum number of iterations is reached.
"""
import time
from typing import Literal

from langgraph.graph import StateGraph, END

from config import MAX_DEBATE_ITERATIONS, COMPLIANCE_THRESHOLD
from src.agents import DefenderAgent, DrafterAgent
from src.knowledge_base import PolicyDocumentLoader, PolicyRetriever
from src.workflow.state import AutoAlignState
from src.utils import get_logger

logger = get_logger(__name__)


def _build_compliance_report(state: AutoAlignState) -> str:
    """Generate a human-readable compliance report from the final state."""
    lines = [
        "=" * 70,
        "  AUTOALIGN COMPLIANCE REPORT",
        "=" * 70,
        "",
        f"Final Status:       {'✅ COMPLIANT' if state['is_compliant'] else '⚠️  PARTIALLY ALIGNED'}",
        f"Compliance Score:   {state['compliance_score']:.0%}",
        f"Debate Iterations:  {state['iteration']}",
        f"Final Violations:   {len(state['violations'])}",
        "",
    ]

    if state["violations"]:
        lines.append("Remaining Violations:")
        for v in state["violations"]:
            lines.append(f"  [{v.severity}] {v.policy_section}: {v.description}")
        lines.append("")

    # Iteration summary
    lines.append("Debate History:")
    for msg in state.get("messages", []):
        prefix = "  🛡️  Defender" if msg.agent == "defender" else "  ✍️  Drafter"
        lines.append(f"  Iter {msg.iteration + 1} — {prefix}: {msg.content}")

    lines.append("")
    lines.append("=" * 70)
    return "\n".join(lines)


class AutoAlignWorkflow:
    """
    Orchestrates the AutoAlign multi-agent workflow using LangGraph.

    The workflow creates a dynamic debate loop between:
    - DefenderAgent: Policy enforcer that finds violations
    - DrafterAgent:  Compliance architect that rewrites the BRD
    """

    def __init__(self, force_rebuild_kb: bool = False):
        """
        Initialize the workflow, building or loading the knowledge base.

        Args:
            force_rebuild_kb: Force rebuild of the vector store from docs.
        """
        logger.info("[bold green]Initializing AutoAlign...[/bold green]")

        # Build knowledge base
        loader = PolicyDocumentLoader()
        vector_store = loader.build_vector_store(force_rebuild=force_rebuild_kb)
        self.retriever = PolicyRetriever(vector_store)

        # Initialize agents
        self.defender = DefenderAgent(self.retriever)
        self.drafter = DrafterAgent(self.retriever)

        # Build the graph
        self.graph = self._build_graph()
        logger.info("[bold green]AutoAlign ready.[/bold green]")

    def _defender_node(self, state: AutoAlignState) -> dict:
        """LangGraph node: Run the Defender agent."""
        return self.defender.analyze(state)

    def _drafter_node(self, state: AutoAlignState) -> dict:
        """LangGraph node: Run the Drafter agent."""
        return self.drafter.revise(state)

    def _report_node(self, state: AutoAlignState) -> dict:
        """LangGraph node: Generate the final compliance report."""
        logger.info("Generating compliance report...")
        report = _build_compliance_report(state)
        return {
            "compliance_report": report,
            "aligned_brd": state.get("aligned_brd", state["brd_content"]),
        }

    def _should_continue(
        self, state: AutoAlignState
    ) -> Literal["drafter", "report"]:
        """
        Conditional edge: Decide whether to loop (Drafter) or finish (Report).
        """
        violations = state.get("violations", [])
        iteration = state.get("iteration", 0)
        max_iter = state.get("max_iterations", MAX_DEBATE_ITERATIONS)
        is_compliant = state.get("is_compliant", False)

        if is_compliant:
            logger.info(
                f"[green]Compliance achieved after {iteration} iteration(s).[/green] "
                "Generating report..."
            )
            return "report"

        if iteration >= max_iter:
            logger.warning(
                f"[yellow]Max iterations ({max_iter}) reached.[/yellow] "
                f"Remaining violations: {len(violations)}. Generating report..."
            )
            return "report"

        logger.info(
            f"[yellow]{len(violations)} violation(s) remain.[/yellow] "
            f"Sending to Drafter (iteration {iteration + 1}/{max_iter})..."
        )
        return "drafter"

    def _build_graph(self) -> StateGraph:
        """Build and compile the LangGraph state machine."""
        workflow = StateGraph(AutoAlignState)

        # Add nodes
        workflow.add_node("defender", self._defender_node)
        workflow.add_node("drafter", self._drafter_node)
        workflow.add_node("report", self._report_node)

        # Define the flow
        workflow.set_entry_point("defender")

        # After Defender: either loop to Drafter or finish
        workflow.add_conditional_edges(
            "defender",
            self._should_continue,
            {
                "drafter": "drafter",
                "report": "report",
            },
        )

        # After Drafter: always go back to Defender
        workflow.add_edge("drafter", "defender")

        # Report is the terminal node
        workflow.add_edge("report", END)

        return workflow.compile()

    def run(self, brd_content: str, max_iterations: int = MAX_DEBATE_ITERATIONS) -> dict:
        """
        Run the AutoAlign workflow on a BRD.

        Args:
            brd_content: The raw Business Requirement Document text.
            max_iterations: Maximum number of Defender/Drafter debate cycles.

        Returns:
            Final state containing aligned_brd, compliance_report, violations, etc.
        """
        logger.info(
            f"[bold]Starting AutoAlign workflow[/bold] "
            f"(max iterations: {max_iterations})"
        )
        start_time = time.time()

        initial_state: AutoAlignState = {
            "original_brd": brd_content,
            "brd_content": brd_content,
            "violations": [],
            "all_violations_history": [],
            "aligned_brd": brd_content,
            "compliance_score": 0.0,
            "is_compliant": False,
            "iteration": 0,
            "max_iterations": max_iterations,
            "messages": [],
            "compliance_report": "",
            "audit_trail": [],
        }

        final_state = self.graph.invoke(initial_state)

        elapsed = time.time() - start_time
        logger.info(f"AutoAlign completed in [cyan]{elapsed:.1f}s[/cyan]")

        return final_state
