"""
Policy Document Loader — Ingests Markdown and PDF policy documents
into a ChromaDB vector store for RAG retrieval.
"""
import os
from pathlib import Path
from typing import List, Optional

from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document

from config import (
    GOOGLE_API_KEY,
    VECTOR_STORE_PATH,
    CHROMA_COLLECTION_NAME,
    POLICY_DOCS_DIR,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
)
from src.utils import get_logger

logger = get_logger(__name__)


class PolicyDocumentLoader:
    """
    Loads policy documents (Markdown) from the docs directory,
    splits them into semantically meaningful chunks, embeds them,
    and persists the vector store to disk.
    """

    def __init__(
        self,
        docs_dir: str = POLICY_DOCS_DIR,
        vector_store_path: str = VECTOR_STORE_PATH,
        collection_name: str = CHROMA_COLLECTION_NAME,
    ):
        self.docs_dir = Path(docs_dir)
        self.vector_store_path = vector_store_path
        self.collection_name = collection_name
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=GOOGLE_API_KEY,
        )

    def _load_markdown_documents(self) -> List[Document]:
        """Load and split Markdown documents with header-aware splitting."""
        docs: List[Document] = []

        md_files = list(self.docs_dir.glob("**/*.md"))
        if not md_files:
            logger.warning(f"No Markdown files found in {self.docs_dir}")
            return docs

        headers_to_split_on = [
            ("#", "header_1"),
            ("##", "header_2"),
            ("###", "header_3"),
        ]
        md_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=headers_to_split_on,
            strip_headers=False,
        )
        char_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
        )

        for md_file in md_files:
            logger.info(f"Loading document: [bold]{md_file.name}[/bold]")
            content = md_file.read_text(encoding="utf-8")
            md_chunks = md_splitter.split_text(content)
            final_chunks = char_splitter.split_documents(md_chunks)
            for chunk in final_chunks:
                chunk.metadata["source"] = md_file.name
                chunk.metadata["file_path"] = str(md_file)
            docs.extend(final_chunks)
            logger.info(f"  -> {len(final_chunks)} chunks from {md_file.name}")

        return docs

    def build_vector_store(self, force_rebuild: bool = False) -> Chroma:
        """
        Build or load the vector store.

        Args:
            force_rebuild: If True, rebuild even if store already exists.

        Returns:
            Initialized Chroma vector store.
        """
        store_exists = (
            Path(self.vector_store_path).exists()
            and any(Path(self.vector_store_path).iterdir())
        )

        if store_exists and not force_rebuild:
            logger.info("Loading existing vector store...")
            vector_store = Chroma(
                collection_name=self.collection_name,
                embedding_function=self.embeddings,
                persist_directory=self.vector_store_path,
            )
            count = vector_store._collection.count()
            logger.info(f"Vector store loaded: [green]{count}[/green] chunks indexed")
            return vector_store

        logger.info("Building vector store from policy documents...")
        documents = self._load_markdown_documents()
        if not documents:
            raise ValueError(
                f"No documents found in {self.docs_dir}. "
                "Please ensure policy documents are present."
            )

        os.makedirs(self.vector_store_path, exist_ok=True)
        vector_store = Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings,
            collection_name=self.collection_name,
            persist_directory=self.vector_store_path,
        )
        logger.info(
            f"Vector store built: [green]{len(documents)}[/green] chunks indexed and persisted."
        )
        return vector_store
