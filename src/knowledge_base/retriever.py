"""
Policy Retriever — Provides semantic search over the policy knowledge base.
"""
from typing import List, Tuple

from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

from config import TOP_K_RESULTS
from src.utils import get_logger

logger = get_logger(__name__)


class PolicyRetriever:
    """
    Wraps a Chroma vector store and provides targeted policy retrieval
    for use by the Defender and Drafter agents.
    """

    def __init__(self, vector_store: Chroma, top_k: int = TOP_K_RESULTS):
        self.vector_store = vector_store
        self.top_k = top_k
        self.retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": top_k},
        )

    def retrieve_relevant_policies(self, query: str) -> List[Document]:
        """
        Retrieve the most relevant policy chunks for a given query.

        Args:
            query: Natural language query describing the concept to look up.

        Returns:
            List of relevant Document chunks from the policy knowledge base.
        """
        logger.debug(f"Retrieving policies for: {query[:80]}...")
        docs = self.retriever.invoke(query)
        logger.debug(f"Retrieved {len(docs)} policy chunks")
        return docs

    def retrieve_with_scores(self, query: str) -> List[Tuple[Document, float]]:
        """
        Retrieve relevant policy chunks along with similarity scores.

        Args:
            query: Natural language query.

        Returns:
            List of (Document, score) tuples, sorted by relevance.
        """
        results = self.vector_store.similarity_search_with_score(query, k=self.top_k)
        return results

    def format_policies_for_prompt(self, query: str) -> str:
        """
        Retrieve and format relevant policy chunks into a clean string
        suitable for inclusion in an LLM prompt.

        Args:
            query: The query to find relevant policies for.

        Returns:
            Formatted string of relevant policy sections.
        """
        docs = self.retrieve_relevant_policies(query)
        if not docs:
            return "No relevant policy sections found."

        sections = []
        for i, doc in enumerate(docs, 1):
            source = doc.metadata.get("source", "Unknown")
            header = doc.metadata.get("header_2", doc.metadata.get("header_1", "Policy Section"))
            sections.append(
                f"[Policy {i} — Source: {source}, Section: {header}]\n{doc.page_content}"
            )

        return "\n\n---\n\n".join(sections)
