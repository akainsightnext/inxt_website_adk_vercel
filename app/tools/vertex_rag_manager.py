"""
Vertex AI RAG Corpus Manager for InsightNext Website Agent

This module manages a Vertex AI RAG corpus that stores scraped website content
and provides vector-based retrieval capabilities.
"""

import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

import vertexai
from vertexai import rag
from dotenv import load_dotenv, set_key

logger = logging.getLogger(__name__)

class VertexRAGManager:
    """Manages Vertex AI RAG corpus for website content."""
    
    def __init__(self, project_id: str = None, location: str = "us-central1"):
        self.project_id = project_id or os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = location
        self.corpus_name = None
        self.display_name = "insightnext-website-corpus"
        
        # Initialize Vertex AI
        vertexai.init(project=self.project_id, location=self.location)
        
        # Load existing corpus name from environment
        self.corpus_name = os.getenv("RAG_CORPUS_NAME")
        
    def create_corpus(self) -> str:
        """Create a new Vertex AI RAG corpus."""
        try:
            logger.info(f"Creating Vertex AI RAG corpus: {self.display_name}")
            
            # Configure embedding model
            embedding_model_config = rag.RagEmbeddingModelConfig(
                vertex_prediction_endpoint=rag.VertexPredictionEndpoint(
                    publisher_model="publishers/google/models/text-embedding-005"
                )
            )
            
            # Configure backend
            backend_config = rag.RagVectorDbConfig(
                rag_embedding_model_config=embedding_model_config
            )
            
            # Create corpus
            corpus = rag.create_corpus(
                display_name=self.display_name,
                backend_config=backend_config,
            )
            
            self.corpus_name = corpus.name
            self._write_corpus_name_to_env(corpus.name)
            
            logger.info(f"✅ Created Vertex AI RAG corpus: {corpus.name}")
            return corpus.name
            
        except Exception as e:
            logger.error(f"❌ Error creating RAG corpus: {e}")
            raise
    
    def list_corpora(self) -> List[Dict[str, Any]]:
        """List all available RAG corpora."""
        try:
            corpora = rag.list_corpora()
            return [
                {
                    "name": corpus.name,
                    "display_name": corpus.display_name,
                    "create_time": corpus.create_time,
                    "update_time": corpus.update_time
                }
                for corpus in corpora
            ]
        except Exception as e:
            logger.error(f"❌ Error listing corpora: {e}")
            return []
    
    def get_corpus_info(self) -> Dict[str, Any]:
        """Get information about the current corpus."""
        if not self.corpus_name:
            return {"error": "No corpus found"}
        
        try:
            # Get corpus details
            corpus = rag.get_corpus(self.corpus_name)
            
            # List files in corpus
            files = rag.list_files(self.corpus_name)
            file_count = 0
            if files:
                # Convert pager to list to get count
                file_list = list(files)
                file_count = len(file_list)
            
            return {
                "corpus_name": self.corpus_name,
                "display_name": corpus.display_name,
                "create_time": getattr(corpus, 'create_time', 'Unknown'),
                "update_time": getattr(corpus, 'update_time', 'Unknown'),
                "file_count": file_count,
                "storage_type": "vertex_ai_rag",
                "location": self.location,
                "project_id": self.project_id
            }
        except Exception as e:
            logger.error(f"❌ Error getting corpus info: {e}")
            return {"error": str(e)}
    
    def ingest_files(self, file_paths: List[str]) -> bool:
        """Ingest files into the RAG corpus."""
        if not self.corpus_name:
            logger.error("❌ No corpus available. Create corpus first.")
            return False
        
        try:
            logger.info(f"🔄 Ingesting {len(file_paths)} files into corpus: {self.corpus_name}")
            
            # Configure transformation
            transformation_config = rag.TransformationConfig(
                chunking_config=rag.ChunkingConfig(
                    chunk_size=512,
                    chunk_overlap=100,
                ),
            )
            
            # If we have more than 25 files, use folder path instead
            if len(file_paths) > 25:
                # Extract the folder path from the first file
                folder_path = "/".join(file_paths[0].split("/")[:-1]) + "/"
                logger.info(f"📁 Using folder path for ingestion: {folder_path}")
                
                # Import using folder path
                rag.import_files(
                    self.corpus_name,
                    [folder_path],
                    transformation_config=transformation_config,
                    max_embedding_requests_per_min=1000,
                )
            else:
                # Import individual files
                rag.import_files(
                    self.corpus_name,
                    file_paths,
                    transformation_config=transformation_config,
                    max_embedding_requests_per_min=1000,
                )
            
            # List files to verify
            files = rag.list_files(self.corpus_name)
            file_count = 0
            if files:
                file_list = list(files)
                file_count = len(file_list)
            logger.info(f"✅ Successfully ingested files. Corpus now contains {file_count} files.")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error ingesting files: {e}")
            return False
    
    def query_corpus(self, query: str, top_k: int = 5) -> str:
        """Query the RAG corpus for relevant information."""
        if not self.corpus_name:
            return "❌ No RAG corpus available. Please create a corpus first."
        
        if not query or not query.strip():
            return "❌ Query cannot be empty."
        
        try:
            logger.info(f"🔍 Querying RAG corpus: '{query}'")
            
            # Configure retrieval
            rag_retrieval_config = rag.RagRetrievalConfig(
                top_k=top_k,
                filter=rag.Filter(vector_distance_threshold=0.5),
            )
            
            # Query corpus
            response = rag.retrieval_query(
                rag_resources=[
                    rag.RagResource(
                        rag_corpus=self.corpus_name,
                    )
                ],
                text=query,
                rag_retrieval_config=rag_retrieval_config,
            )
            
            return str(response)
            
        except Exception as e:
            logger.error(f"❌ Error querying corpus: {e}")
            return f"❌ Error querying RAG corpus: {str(e)}"
    
    def delete_corpus(self) -> bool:
        """Delete the RAG corpus."""
        if not self.corpus_name:
            logger.warning("No corpus to delete.")
            return True
        
        try:
            logger.info(f"🗑️ Deleting RAG corpus: {self.corpus_name}")
            rag.delete_corpus(self.corpus_name)
            self.corpus_name = None
            self._write_corpus_name_to_env("")
            logger.info("✅ Corpus deleted successfully.")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error deleting corpus: {e}")
            return False
    
    def _write_corpus_name_to_env(self, corpus_name: str):
        """Write corpus name to .env file."""
        try:
            env_file_path = Path(__file__).parent.parent / ".env"
            load_dotenv(env_file_path)
            set_key(env_file_path, "RAG_CORPUS_NAME", corpus_name)
            logger.info(f"📝 RAG_CORPUS_NAME '{corpus_name}' written to {env_file_path}")
        except Exception as e:
            logger.error(f"❌ Error writing to .env file: {e}")


# Global Vertex RAG manager instance
_vertex_rag_manager: Optional[VertexRAGManager] = None

def get_vertex_rag_manager() -> VertexRAGManager:
    """Get the global Vertex RAG manager instance."""
    global _vertex_rag_manager
    
    if _vertex_rag_manager is None:
        _vertex_rag_manager = VertexRAGManager()
    
    return _vertex_rag_manager
