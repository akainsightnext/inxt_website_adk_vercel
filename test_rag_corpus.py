#!/usr/bin/env python3
"""
Test script for RAG corpus functionality
"""

import os
import sys
from pathlib import Path

# Add the app directory to the path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

# Load environment variables from .env file
from dotenv import load_dotenv
env_file = app_dir / ".env"
if env_file.exists():
    load_dotenv(env_file)
    print(f"✅ Loaded environment variables from {env_file}")
else:
    print(f"❌ No .env file found at {env_file}")

from tools import query_rag_corpus, get_rag_corpus_info, refresh_rag_corpus

def test_rag_corpus():
    """Test the RAG corpus functionality."""
    print("🧪 Testing RAG Corpus Functionality")
    print("=" * 50)
    
    # Test 1: Get corpus info
    print("\n1️⃣ Testing get_rag_corpus_info()...")
    info = get_rag_corpus_info()
    print(info)
    
    # Test 2: Test a simple query
    print("\n2️⃣ Testing query_rag_corpus() with 'services'...")
    query_result = query_rag_corpus("services")
    print(query_result)
    
    # Test 3: Test another query
    print("\n3️⃣ Testing query_rag_corpus() with 'AI insights'...")
    query_result2 = query_rag_corpus("AI insights")
    print(query_result2)
    
    # Test 4: Test refresh
    print("\n4️⃣ Testing refresh_rag_corpus()...")
    refresh_result = refresh_rag_corpus()
    print(refresh_result)
    
    print("\n✅ RAG Corpus testing completed!")

if __name__ == "__main__":
    test_rag_corpus()
