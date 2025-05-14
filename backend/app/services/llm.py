from typing import Optional, Dict, List, Any
import logging
import json
import requests
import os
import base64
from openai import OpenAI
from requests.exceptions import RequestException

# Configure logger
logger = logging.getLogger(__name__)

def create_llm_provider(provider_name: str, api_key: str):
    """Create a provider configuration dictionary"""
    if provider_name.lower() != "grok":
        raise ValueError("Only Grok provider is supported")
    return {"provider": "grok", "api_key": api_key}

class RAGPromptManager:
    """
    Manages prompt generation and LLM interactions for RAG.
    Uses Grok API for text generation.
    """
    
    def __init__(self, provider: dict):
        """
        Initialize with Grok provider configuration.
        
        Args:
            provider: Dictionary with provider details (provider name and API key)
        """
        if provider["provider"].lower() != "grok":
            raise ValueError("Only Grok provider is supported")
            
        self.provider = provider
        self.client = OpenAI(api_key=provider["api_key"], base_url="https://api.x.ai/v1")
        self.api_url = None

    def _create_prompt(self, query: str, documents: List[Dict[str, Any]], context: Optional[Dict[str, Any]] = None) -> str:
        """
        Create a prompt for the LLM using the query and retrieved documents.
        
        Args:
            query: User's question
            documents: List of retrieved documents with text and metadata
            context: Optional dictionary containing additional context
        """
        # Maximum number of chat history messages to include in prompt
        MAX_HISTORY_IN_PROMPT = 3

        # System Role and Core Instruction
        prompt = "You are a specialized AI assistant for SenseLib Digital Library. Your primary role is to provide accurate and concise answers to questions about documents in the library. You can answer questions about:"
        prompt += "\n- Document content and summaries"
        prompt += "\n- Document metadata and organization"
        prompt += "\n- Library services and features"
        prompt += "\n- Search and retrieval functionality"
        prompt += "\n- Document analysis and interpretation"
        prompt += "\n\nYour final answer must be in Vietnamese."

        # Add context if available
        if context:
            prompt += "\n\n<context>"
            if "chat_history" in context:
                chat_history = context["chat_history"]
                if len(chat_history) > 0:
                    prompt += "\nRecent conversation context:"
                    recent_history = chat_history[-MAX_HISTORY_IN_PROMPT:]
                    for msg in recent_history:
                        role = "User" if msg["role"] == "user" else "Assistant"
                        prompt += f"\n{role}: {msg['content']}"
            prompt += "\n</context>"

        # Document Section
        prompt += "\n\n<documents>"
        if not documents:
            prompt += "\nNo documents provided."
        else:
            for i, doc in enumerate(documents, 1):
                metadata = doc.get("metadata", {})
                source_info = metadata.get("source_id", metadata.get("source_collection", "unknown"))
                doc_type = metadata.get("document_type", "unknown")

                prompt += f"\n\nDocument {i} (Source: {source_info}, Type: {doc_type}):"
                prompt += f"\n```\n{doc['text']}\n```"

        prompt += "\n</documents>"

        # Query Section
        prompt += "\n\n<query>"
        prompt += f"\nUser Question: {query}"
        prompt += "\n</query>"

        # Final Instructions
        prompt += "\n\n<instructions>"
        prompt += "\n1. Analyze the provided documents and context carefully."
        prompt += "\n2. If the information is missing or ambiguous, say so clearly in Vietnamese."
        prompt += "\n3. If relevant documents are provided, prioritize using information from those documents."
        prompt += "\n4. Keep answers concise and focused on the specific question."
        prompt += "\n5. Ensure the final output is only the answer in Vietnamese."
        prompt += "\n6. If the answer includes multiple points, present them as a bullet list."
        prompt += "\n7. Use bold formatting for important terms."
        prompt += "\n</instructions>"

        return prompt

    def generate_answer(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        temperature: float = 0.1,
        max_tokens: int = 500,
        model: str = "grok-1",
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate an answer using Grok API.
        
        Args:
            query: User's question
            documents: List of retrieved documents
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens in response
            model: Model name (default: grok-1)
            context: Optional context dictionary
            
        Returns:
            Dictionary containing the generated answer and metadata
        """
        try:
            prompt = self._create_prompt(query, documents, context)
            
            response = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            answer = response.choices[0].message.content.strip()
            
            return {
                "answer": answer,
                "model": model,
                "provider": "grok",
                "metadata": {
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            return {
                "error": str(e),
                "answer": "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn.",
                "provider": "grok"
            } 