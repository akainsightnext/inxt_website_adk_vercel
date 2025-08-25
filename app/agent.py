"""
InsightNext AI Assistant Agent

An intelligent agent that helps potential customers discover how InsightNext 
can transform their business through AI and data analytics solutions.
"""

import os
from datetime import datetime, timezone
from google.genai import types
from google.adk.agents import LlmAgent

from app.config import config
from app.tools import rag_corpus_tools
from app.prompts import get_agent_instructions, get_agent_global_instructions

# Disable telemetry to prevent serialization issues
os.environ["ADK_DISABLE_TELEMETRY"] = "true"
os.environ["GOOGLE_CLOUD_DISABLE_TELEMETRY"] = "true"
os.environ["VERTEX_AI_DISABLE_TELEMETRY"] = "true"

# Create the InsightNext AI Assistant Agent
root_agent = LlmAgent(
    model=config.model,
    name=config.internal_agent_name,
    description="AI Assistant specialized in helping customers discover InsightNext's AI and data analytics solutions",
    instruction=get_agent_instructions(),
    tools=rag_corpus_tools,
    generate_content_config=types.GenerateContentConfig(
        temperature=0.1,  # Low temperature for more focused, professional responses
        max_output_tokens=8192,  # Allow comprehensive responses about services
    ),
)

# Agent metadata for reference
AGENT_METADATA = {
    "name": "InsightNext AI Assistant",
    "description": "AI Agent specialized in helping customers discover InsightNext's AI and data analytics solutions",
    "website": "https://www.insightnext.tech",
    "version": "1.0.0",
    "capabilities": [
        "Service information and consultation",
        "Business solution recommendations",
        "Technical capability explanations",
        "Implementation methodology guidance",
        "Customer engagement and lead qualification"
    ],
    "tools": [tool.name for tool in rag_corpus_tools],
    "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d")
}

def get_agent_info():
    """Get information about the agent."""
    return AGENT_METADATA

def get_agent():
    """Get the configured agent instance."""
    return root_agent

# For direct execution
if __name__ == "__main__":
    print("🌟 InsightNext AI Assistant")
    print(f"📅 Last Updated: {AGENT_METADATA['last_updated']}")
    print(f"🌐 Website: {AGENT_METADATA['website']}")
    print(f"🔧 Model: {config.model}")
    print(f"🛠️  Tools available: {len(AGENT_METADATA['tools'])}")
    print(f"📋 Capabilities: {', '.join(AGENT_METADATA['capabilities'])}")
    print("\n🚀 Agent is ready to help customers discover InsightNext solutions!")
