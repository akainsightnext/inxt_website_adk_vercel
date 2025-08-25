"""
RAG Corpus Tools for ADK Tutorial

This module provides RAG corpus tools that store and retrieve information
using Vertex AI RAG corpus functionality.
"""

import os
from typing import List, Dict, Any
from google.adk.tools import FunctionTool
from .vertex_rag_manager import get_vertex_rag_manager

# Global Vertex RAG manager
_vertex_rag_manager = None
_corpus_initialized = False

def _get_vertex_rag_manager():
    """Get the Vertex RAG manager, initializing if needed."""
    global _vertex_rag_manager, _corpus_initialized
    
    if _vertex_rag_manager is None:
        _vertex_rag_manager = get_vertex_rag_manager()
    
    if not _corpus_initialized:
        try:
            # Check if corpus exists
            if not _vertex_rag_manager.corpus_name:
                print("❌ No Vertex AI RAG corpus found in environment variables")
                print("Please set RAG_CORPUS_NAME in your .env file")
            else:
                print(f"✅ Using existing Vertex AI RAG corpus: {_vertex_rag_manager.corpus_name}")
            
            _corpus_initialized = True
            
        except Exception as e:
            print(f"Warning: Could not initialize Vertex AI RAG corpus: {e}")
    
    return _vertex_rag_manager

def query_rag_corpus(query: str) -> str:
    """Retrieves contextually relevant information from the Vertex AI RAG corpus.

    Args:
        query (str): The query string to search within the corpus.

    Returns:
        str: The response containing retrieved information from the corpus.
    """
    try:
        # Get Vertex RAG manager
        vertex_rag_manager = _get_vertex_rag_manager()
        
        if not vertex_rag_manager.corpus_name:
            return "❌ No Vertex AI RAG corpus available. Please create a corpus first."
        
        # Query the corpus
        response = vertex_rag_manager.query_corpus(query, top_k=5)
        
        return response
        
    except Exception as e:
        return f"❌ Error querying Vertex AI RAG corpus: {str(e)}"

def refresh_rag_corpus() -> str:
    """Refreshes the Vertex AI RAG corpus connection and validates it's working.

    Returns:
        str: Status message indicating success or failure of the refresh operation.
    """
    try:
        # Get Vertex RAG manager
        vertex_rag_manager = _get_vertex_rag_manager()
        
        if not vertex_rag_manager.corpus_name:
            return "❌ No Vertex AI RAG corpus available. Please set RAG_CORPUS_NAME in your .env file."
        
        # Test the corpus connection
        print(f"🔄 Testing connection to existing corpus: {vertex_rag_manager.corpus_name}")
        
        # Get corpus info to validate connection
        corpus_info = vertex_rag_manager.get_corpus_info()
        
        if "error" in corpus_info:
            return f"❌ Error connecting to Vertex AI RAG corpus: {corpus_info['error']}"
        
        return f"✅ Vertex AI RAG corpus connection refreshed successfully! Corpus: {vertex_rag_manager.corpus_name}, Files: {corpus_info.get('file_count', 0)}"
        
    except Exception as e:
        return f"❌ Error refreshing Vertex AI RAG corpus connection: {str(e)}"

def get_rag_corpus_info() -> str:
    """Gets information about the current Vertex AI RAG corpus including file count and metadata.

    Returns:
        str: Information about the Vertex AI RAG corpus including file count, corpus details, and last update time.
    """
    try:
        vertex_rag_manager = _get_vertex_rag_manager()
        corpus_info = vertex_rag_manager.get_corpus_info()
        
        if "error" in corpus_info:
            return f"❌ {corpus_info['error']}"
        
        result_parts = []
        result_parts.append("📚 **Vertex AI RAG Corpus Information**")
        result_parts.append(f"📖 Corpus Name: {corpus_info.get('corpus_name', 'N/A')}")
        result_parts.append(f"📄 Files: {corpus_info.get('file_count', 0)}")
        result_parts.append(f"💾 Storage Type: {corpus_info.get('storage_type', 'Vertex AI RAG')}")
        result_parts.append(f"🌍 Location: {corpus_info.get('location', 'us-central1')}")
        result_parts.append(f"🏢 Project: {corpus_info.get('project_id', 'N/A')}")
        result_parts.append(f"📅 Created: {corpus_info.get('create_time', 'N/A')}")
        result_parts.append(f"🔄 Updated: {corpus_info.get('update_time', 'N/A')}")
        
        return "\n".join(result_parts)
        
    except Exception as e:
        return f"❌ Error getting Vertex AI RAG corpus information: {str(e)}"

# Create the RAG corpus tools
rag_corpus_tool = FunctionTool(query_rag_corpus)

# Create refresh tool
refresh_corpus_tool = FunctionTool(refresh_rag_corpus)

# Create info tool
corpus_info_tool = FunctionTool(get_rag_corpus_info)

# List of all available tools (RAG corpus tools)
rag_corpus_tools = [
    rag_corpus_tool,
    refresh_corpus_tool,
    corpus_info_tool
]