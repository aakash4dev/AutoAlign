"""
Structured logging utility for AutoAlign.
"""
import logging
import sys
from rich.logging import RichHandler
from rich.console import Console

console = Console()


def get_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """
    Returns a named logger with rich formatting.
    """
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    logger.setLevel(level)
    handler = RichHandler(
        console=console,
        show_time=True,
        show_level=True,
        show_path=False,
        markup=True,
        rich_tracebacks=True,
    )
    handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(handler)
    logger.propagate = False
    return logger
