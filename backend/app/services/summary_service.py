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
        
        # Initialize text splitter for summarization
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.SUMMARY_CHUNK_SIZE,
            chunk_overlap=settings.SUMMARY_CHUNK_OVERLAP,
            length_function=len,
            is_separator_regex=False,
            separators=["\n\n", "\n", ".", "!", "?"]  # Split by paragraphs and sentences
        )
        
        # Create SSL context
        self.ssl_context = ssl.create_default_context(cafile=certifi.where())
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE
        
        # Create connector with SSL context and keep-alive settings
        self.connector = aiohttp.TCPConnector(
            ssl=self.ssl_context,
            limit=10,  # Allow up to 10 concurrent connections
            ttl_dns_cache=300,  # Cache DNS for 5 minutes
            force_close=False,  # Don't force close connections
            keepalive_timeout=1200,  # Keep connections alive for 20 minutes
            enable_cleanup_closed=True  # Clean up closed connections
        )
        
        # Create semaphore to limit concurrent API calls
        self.semaphore = asyncio.Semaphore(5)  # Maximum 5 concurrent API calls
        
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
        """Create final summary with a completely new session"""
        try:
            # Create a new connector specifically for final summary
            final_connector = aiohttp.TCPConnector(
                ssl=self.ssl_context,
                limit=1,  # Only one connection for final summary
                ttl_dns_cache=300,
                force_close=False,  # Changed to False to allow keep-alive
                keepalive_timeout=1200
            )
            
            # Create new session with dedicated timeout
            timeout = aiohttp.ClientTimeout(total=1200)  # 20 minutes timeout
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
                prompt = f"""Hãy tạo một bài tóm tắt mạch lạc và trôi chảy từ các đoạn tóm tắt sau đây.
                Yêu cầu:
                1. Tập trung vào nội dung chính của văn bản, bỏ qua các thông tin không liên quan
                2. Không thêm tiêu đề hoặc các phần mở đầu không cần thiết
                3. Bắt đầu trực tiếp với nội dung tóm tắt
                4. Sử dụng từ ngữ chuyển tiếp phù hợp để kết nối các ý
                5. Viết theo văn phong học thuật, rõ ràng và dễ hiểu
                6. Đảm bảo tính mạch lạc và liên kết giữa các phần
                7. Độ dài khoảng {settings.SUMMARY_MAX_LENGTH} từ
                
                Các đoạn tóm tắt:
                {combined_summaries}
                
                Bài tóm tắt cuối cùng:"""
                
                data = {
                    "model": self.api_model,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": settings.SUMMARY_MAX_LENGTH
                }
                
                logger.info("Sending request for final summary generation...")
                async with session.post(
                    self.api_url,
                    json=data,
                    timeout=600,  # 10 minutes timeout for the request
                    raise_for_status=True
                ) as response:
                    result = await response.json()
                    logger.info("Received response for final summary")
                    return result["choices"][0]["message"]["content"].strip()
                    
        except Exception as e:
            logger.error(f"Error in final summary generation: {str(e)}")
            raise
        finally:
            # Ensure connector is closed
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
        stop=stop_after_attempt(5),  # Increased retry attempts
        wait=wait_exponential(multiplier=1, min=4, max=20),  # Increased max wait time
        retry=(
            retry_if_exception_type((aiohttp.ClientError, asyncio.TimeoutError)) |
            retry_if_exception_message(match="502 Bad Gateway") |
            retry_if_exception_message(match="503 Service Unavailable") |
            retry_if_exception_message(match="504 Gateway Timeout") |
            retry_if_exception_message(match="Session is closed")
        )
    )
    async def _summarize_chunk(self, session: aiohttp.ClientSession, chunk: str, chunk_index: int) -> tuple[int, str]:
        """Summarize a single chunk with retry mechanism"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "SenseLib/1.0"  # Add user agent
            }
            
            prompt = f"""Hãy tóm tắt đoạn văn bản sau đây một cách ngắn gọn, tập trung vào thông tin quan trọng nhất.
            Tóm tắt nên có độ dài khoảng 100-200 từ để giữ được ngữ cảnh và ý nghĩa của đoạn văn.
            
            Đoạn văn bản:
            {chunk}
            
            Tóm tắt:"""
            
            data = {
                "model": self.api_model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.5,  # Lower temperature for more focused summaries
                "max_tokens": 300  # Cho phép tóm tắt dài hơn cho mỗi chunk
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