"""
Turgon SDK — AutoAlign Integration Layer

Turgon provides a clean, high-level interface for the AutoAlign
autonomous governance system. It wraps the LangGraph workflow and
exposes simple primitives for BRD alignment, policy querying, and
compliance reporting.

Named after the hidden city of Gondolin — a fortress of hidden wisdom,
just as Turgon keeps your architecture aligned and protected.
"""
from .client import TurgonClient
from .models import AlignmentResult, ComplianceStatus

__version__ = "1.0.0"
__all__ = ["TurgonClient", "AlignmentResult", "ComplianceStatus"]
