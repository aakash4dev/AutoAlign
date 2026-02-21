"""
AutoAlign — CLI Entry Point

Usage:
    python main.py align examples/sample_brd.md
    python main.py align examples/sample_brd.md --output aligned_brd.md
    python main.py align examples/sample_brd.md --max-iterations 3
    python main.py query "What are the PII logging rules?"
    python main.py rebuild-kb
"""
import sys
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown
from rich.table import Table
from rich import print as rprint

app = typer.Typer(
    name="autoalign",
    help="AutoAlign — Autonomous Governance: Converting Static Docs into Living Policy",
    add_completion=False,
)
console = Console()


def _print_banner():
    console.print(
        Panel.fit(
            "[bold cyan]AutoAlign[/bold cyan] [dim]v1.0.0[/dim]\n"
            "[dim]Autonomous Governance · HackFest 2.0 · Team Ninja Turtles[/dim]",
            border_style="cyan",
        )
    )


@app.command()
def align(
    brd_path: str = typer.Argument(..., help="Path to the BRD Markdown file"),
    output: Optional[str] = typer.Option(
        None, "--output", "-o", help="Save aligned BRD to this file"
    ),
    max_iterations: int = typer.Option(
        5, "--max-iterations", "-n", help="Maximum debate iterations"
    ),
    rebuild_kb: bool = typer.Option(
        False, "--rebuild-kb", help="Force rebuild the policy knowledge base"
    ),
    show_diff: bool = typer.Option(
        False, "--diff", help="Show a side-by-side diff (original vs aligned)"
    ),
):
    """
    Align a Business Requirement Document with internal governance policies.
    """
    _print_banner()

    from turgon import TurgonClient

    brd_file = Path(brd_path)
    if not brd_file.exists():
        console.print(f"[red]Error:[/red] BRD file not found: {brd_path}")
        raise typer.Exit(1)

    console.print(f"\nAligning [cyan]{brd_file.name}[/cyan] with internal policies...\n")

    client = TurgonClient(force_rebuild_kb=rebuild_kb, max_iterations=max_iterations)
    result = client.align_file(str(brd_file))

    # Print the compliance report
    console.print("\n")
    console.print(Panel(result.compliance_report, title="Compliance Report", border_style="green" if result.is_compliant else "yellow"))

    # Violations table
    if result.violations:
        table = Table(title="Remaining Violations", show_lines=True)
        table.add_column("Severity", style="bold", width=10)
        table.add_column("Policy Section", width=18)
        table.add_column("Description")

        for v in result.violations:
            color = {
                "CRITICAL": "red",
                "HIGH": "yellow",
                "MEDIUM": "blue",
                "LOW": "dim",
            }.get(v.severity, "white")
            table.add_row(
                f"[{color}]{v.severity}[/{color}]",
                v.policy_section,
                v.description[:100] + ("..." if len(v.description) > 100 else ""),
            )
        console.print(table)

    # Show aligned BRD preview
    console.print("\n[bold]Aligned BRD Preview (first 60 lines):[/bold]")
    preview_lines = result.aligned_brd.splitlines()[:60]
    console.print(
        Panel(
            Markdown("\n".join(preview_lines)),
            title="Aligned BRD",
            border_style="cyan",
        )
    )

    # Save output if requested
    if output:
        out_path = Path(output)
        out_path.write_text(result.aligned_brd, encoding="utf-8")
        console.print(f"\n[green]Aligned BRD saved to:[/green] {out_path}")

    # Summary
    console.print(
        f"\n[bold]Summary:[/bold] {result.summary()}"
    )

    raise typer.Exit(0 if result.is_compliant else 1)


@app.command()
def query(
    question: str = typer.Argument(..., help="A natural language policy question"),
    rebuild_kb: bool = typer.Option(
        False, "--rebuild-kb", help="Force rebuild the policy knowledge base"
    ),
):
    """
    Query the policy knowledge base with a natural language question.
    """
    _print_banner()
    from turgon import TurgonClient

    console.print(f"\nQuerying knowledge base: [italic cyan]{question}[/italic cyan]\n")
    client = TurgonClient(force_rebuild_kb=rebuild_kb)
    answer = client.query_policy(question)
    console.print(Panel(answer, title="Relevant Policy Sections", border_style="blue"))


@app.command(name="rebuild-kb")
def rebuild_kb():
    """
    Force rebuild the policy knowledge base from the docs/ directory.
    """
    _print_banner()
    from src.knowledge_base import PolicyDocumentLoader

    console.print("\nRebuilding policy knowledge base from [cyan]docs/[/cyan]...\n")
    loader = PolicyDocumentLoader()
    loader.build_vector_store(force_rebuild=True)
    console.print("[green]Knowledge base rebuilt successfully.[/green]")


if __name__ == "__main__":
    app()
