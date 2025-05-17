import logging
import aiohttp
import asyncio
import ssl
import certifi
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type, retry_if_exception_message
from app.core.config import settings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from contextlib import asynccontextmanager
from typing import List, Tuple, Union
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

class SummaryService:
    def __init__(self):
        logger.info("Initializing SummaryService with Grok API")
        self.api_key = settings.GROK_API_KEY
        self.api_url = settings.GROK_API_URL
        self.api_model = settings.GROK_API_MODEL
        
        # Optimize text splitter for larger chunks and less overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.SUMMARY_CHUNK_SIZE * 1.5,  # Increase chunk size by 50%
            chunk_overlap=settings.SUMMARY_CHUNK_OVERLAP // 2,  # Reduce overlap by 50%
            length_function=len,
            is_separator_regex=False,
            separators=["\n\n", "\n", ".", "!", "?"]
        )
        
        # Create SSL context
        self.ssl_context = ssl.create_default_context(cafile=certifi.where())
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE
        
        # Optimize connector settings for better performance
        self.connector = aiohttp.TCPConnector(
            ssl=self.ssl_context,
            limit=20,  # Increased from 10 to 20 concurrent connections
            ttl_dns_cache=600,  # Cache DNS for 10 minutes (increased from 5)
            force_close=False,
            keepalive_timeout=1800,  # Keep connections alive for 30 minutes (increased from 20)
            enable_cleanup_closed=True
        )
        
        # Increase concurrent API calls limit
        self.semaphore = asyncio.Semaphore(8)  # Increased from 5 to 8 concurrent API calls
        
        # Progress tracking
        self.processed_chunks = 0
        self.total_chunks = 0
        self.start_time = None
    
    @asynccontextmanager
    async def get_session(self):
        """Context manager for creating and managing aiohttp sessions"""
        session = aiohttp.ClientSession(connector=self.connector)
        try:
            yield session
        finally:
            await session.close()
    
    async def _summarize_chunk_safe(self, session: aiohttp.ClientSession, chunk: str, index: int) -> Union[Tuple[int, str], Exception]:
        """Safe wrapper for chunk summarization that doesn't throw exceptions"""
        async with self.semaphore:  # Limit concurrent API calls
            try:
                logger.info(f"Processing chunk {index + 1}/{self.total_chunks}")
                result = await self._summarize_chunk(session, chunk, index)
                self.processed_chunks += 1
                elapsed = (datetime.now() - self.start_time).total_seconds()
                logger.info(f"Progress: {self.processed_chunks}/{self.total_chunks} chunks processed in {elapsed:.2f}s")
                return result
            except Exception as e:
                logger.error(f"Error in _summarize_chunk_safe for chunk {index}: {str(e)}")
                return e
    
    async def _summarize_chunk_fallback_safe(self, session: aiohttp.ClientSession, chunk: str, index: int) -> Union[Tuple[int, str], Exception]:
        """Safe wrapper for fallback chunk summarization that doesn't throw exceptions"""
        async with self.semaphore:  # Limit concurrent API calls
            try:
                logger.info(f"Processing failed chunk {index + 1}/{self.total_chunks} with fallback method")
                result = await self._summarize_chunk_fallback(session, chunk, index)
                self.processed_chunks += 1
                elapsed = (datetime.now() - self.start_time).total_seconds()
                logger.info(f"Progress: {self.processed_chunks}/{self.total_chunks} chunks processed in {elapsed:.2f}s")
                return result
            except Exception as e:
                logger.error(f"Error in _summarize_chunk_fallback_safe for chunk {index}: {str(e)}")
                return e
    
    async def _create_final_summary(self, combined_summaries: str) -> str:
        try:
            # Optimize final connector settings
            final_connector = aiohttp.TCPConnector(
                ssl=self.ssl_context,
                limit=2,  # Increased from 1 to 2
                ttl_dns_cache=600,
                force_close=False,
                keepalive_timeout=1800
            )
            
            # Optimize timeout settings
            timeout = aiohttp.ClientTimeout(total=900)  # Reduced from 1200 to 900 seconds
            
            async with aiohttp.ClientSession(
                connector=final_connector,
                timeout=timeout,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "SenseLib/1.0",
                    "Connection": "keep-alive"
                }
            ) as session:
                # Optimized prompt for faster final summary
                prompt = f"""Tạo bài tóm tắt mạch lạc ({settings.SUMMARY_MAX_LENGTH} từ) từ các đoạn sau:
                {combined_summaries}"""
                
                data = {
                    "model": self.api_model,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.5,  # Reduced from 0.7
                    "max_tokens": settings.SUMMARY_MAX_LENGTH
                }
                
                logger.info("Sending request for final summary generation...")
                async with session.post(
                    self.api_url,
                    json=data,
                    timeout=300,  # Reduced from 600 to 300 seconds
                    raise_for_status=True
                ) as response:
                    result = await response.json()
                    logger.info("Received response for final summary")
                    return result["choices"][0]["message"]["content"].strip()
                    
        except Exception as e:
            logger.error(f"Error in final summary generation: {str(e)}")
            raise
        finally:
            if 'final_connector' in locals():
                await final_connector.close()

    async def generate_summary(self, text: str) -> str:
        """
        Generate summary for Vietnamese text using Grok API
        
        Args:
            text: Input text to summarize
            
        Returns:
            Generated summary text
        """
        try:
            logger.info(f"Generating summary for text of length {len(text)}")
            
            # Split text into chunks
            chunks = self.text_splitter.split_text(text)
            self.total_chunks = len(chunks)
            self.processed_chunks = 0
            self.start_time = datetime.now()
            
            logger.info(f"Split text into {self.total_chunks} chunks for summarization")
            
            # Initialize combined summaries text
            combined_summaries = []
            
            # Create tasks for all chunks
            chunk_tasks = []
            async with self.get_session() as session:
                for i, chunk in enumerate(chunks):
                    logger.info(f"Queueing chunk {i+1} of {self.total_chunks} for summarization")
                    task = self._summarize_chunk_safe(session, chunk, i)
                    chunk_tasks.append(task)
                
                # Run all tasks concurrently
                logger.info("Starting concurrent processing of chunks...")
                results = await asyncio.gather(*chunk_tasks, return_exceptions=True)
                logger.info("Finished processing all chunks")
            
            # Process results and build combined summaries
            failed_chunks = []
            
            for idx, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Chunk {idx + 1} failed: {str(result)}")
                    failed_chunks.append((idx, chunks[idx]))
                else:
                    # Add successful summary to combined text
                    combined_summaries.append((idx, result[1]))
                    logger.info(f"Successfully summarized chunk {idx + 1}")
            
            # Retry failed chunks with fallback method
            if failed_chunks:
                logger.info(f"Retrying {len(failed_chunks)} failed chunks with fallback")
                async with self.get_session() as session:
                    retry_tasks = [
                        self._summarize_chunk_fallback_safe(session, chunk, idx)
                        for idx, chunk in failed_chunks
                    ]
                    retry_results = await asyncio.gather(*retry_tasks, return_exceptions=True)
                    
                    for i, result in enumerate(retry_results):
                        idx, _ = failed_chunks[i]
                        if isinstance(result, Exception):
                            logger.error(f"Fallback failed for chunk {idx + 1}: {str(result)}")
                        else:
                            # Add fallback summary to combined text
                            combined_summaries.append((idx, result[1]))
                            logger.info(f"Fallback success for chunk {idx + 1}")
            
            if not combined_summaries:
                raise Exception("Failed to generate any valid summaries")
            
            # Sort by original index and join summaries
            combined_summaries.sort(key=lambda x: x[0])
            final_text = "\n\n".join(summary for _, summary in combined_summaries)
            
            logger.info(f"Combined {len(combined_summaries)} chunk summaries into final text of length {len(final_text)}")
            
            # Generate final summary with new session
            logger.info("Generating final coherent summary")
            final_summary = await self._create_final_summary(final_text)
            
            total_time = (datetime.now() - self.start_time).total_seconds()
            logger.info(f"Final summary generated with length {len(final_summary)} in {total_time:.2f}s")
            return final_summary
            
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            raise
    
    @retry(
        stop=stop_after_attempt(3),  # Reduced from 5 to 3 attempts
        wait=wait_exponential(multiplier=1, min=2, max=10),  # Reduced wait times
        retry=(
            retry_if_exception_type((aiohttp.ClientError, asyncio.TimeoutError)) |
            retry_if_exception_message(match="502 Bad Gateway") |
            retry_if_exception_message(match="503 Service Unavailable")
        )  # Removed some retry conditions
    )
    async def _summarize_chunk(self, session: aiohttp.ClientSession, chunk: str, chunk_index: int) -> tuple[int, str]:
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "SenseLib/1.0"
            }
            
            # Optimized prompt for faster processing
            prompt = f"""Tóm tắt ngắn gọn (100-150 từ) đoạn văn sau, tập trung vào thông tin chính:
            {chunk}"""
            
            data = {
                "model": self.api_model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,  # Reduced for faster, more focused summaries
                "max_tokens": 200  # Reduced from 300
            }
            
            async with session.post(
                self.api_url,
                json=data,
                headers=headers,
                timeout=45,  # Reduced from 60 to 45 seconds
                raise_for_status=True
            ) as response:
                result = await response.json()
                summary = result["choices"][0]["message"]["content"]
                return (chunk_index, summary.strip())
                
        except Exception as e:
            logger.error(f"Error summarizing chunk {chunk_index}: {str(e)}")
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=(
            retry_if_exception_type((aiohttp.ClientError, asyncio.TimeoutError)) |
            retry_if_exception_message(match="502 Bad Gateway") |
            retry_if_exception_message(match="503 Service Unavailable") |
            retry_if_exception_message(match="504 Gateway Timeout") |
            retry_if_exception_message(match="Session is closed")
        )
    )
    async def _summarize_chunk_fallback(self, session: aiohttp.ClientSession, chunk: str, chunk_index: int) -> tuple[int, str]:
        """Fallback method for summarizing chunks that failed with the main method"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "SenseLib/1.0"  # Add user agent
            }
            
            # Simpler prompt for fallback
            prompt = f"""Tóm tắt ngắn gọn đoạn văn bản sau (khoảng 100 từ):
            {chunk}"""
            
            data = {
                "model": self.api_model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,  # Lower temperature for more conservative summary
                "max_tokens": 200
            }
            
            async with session.post(
                self.api_url,
                json=data,
                headers=headers,
                timeout=60,  # Increased timeout
                raise_for_status=True  # Raise exception for non-200 status codes
            ) as response:
                result = await response.json()
                summary = result["choices"][0]["message"]["content"]
                return (chunk_index, summary.strip())
                
        except Exception as e:
            logger.error(f"Error in fallback summarization for chunk {chunk_index}: {str(e)}")
            raise 