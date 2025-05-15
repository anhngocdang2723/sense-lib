from typing import Optional, List, Dict, Any
import time
from datetime import datetime
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient, models
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
import logging
import numpy as np

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

class VectorStore:
    """
    Handles document storage and vector database operations using Qdrant Cloud DB.
    Uses a single collection 'senselib' for all documents.
    """
    
    COLLECTION_NAME = "senselib"
    
    def __init__(
        self,
        qdrant_url: str,
        qdrant_api_key: str,
        verbose: bool = False
    ):
        if not qdrant_url or not qdrant_api_key:
            raise ValueError("Qdrant URL and API key are required")
            
        self.verbose = verbose
        
        # Initialize document embedding model
        logger.info("Loading document embedding model: dangvantuan/vietnamese-embedding")
        self.doc_encoder = SentenceTransformer('dangvantuan/vietnamese-embedding')
        self.doc_embedding_dim = self.doc_encoder.get_sentence_embedding_dimension()
        
        # Initialize Qdrant client
        try:
            logger.info(f"Connecting to Qdrant Cloud at {qdrant_url}")
            self.client = QdrantClient(
                url=qdrant_url,
                api_key=qdrant_api_key,
                timeout=60.0
            )
            logger.info("Connected to Qdrant Cloud successfully")
            
            # Ensure senselib collection exists
            self._ensure_collection_exists()
            
        except Exception as e:
            logger.error(f"Failed to connect to Qdrant Cloud: {str(e)}")
            raise

    def _ensure_collection_exists(self) -> bool:
        """Ensure the senselib collection exists in Qdrant Cloud."""
        try:
            collections = self.client.get_collections().collections
            collection_exists = any(c.name == self.COLLECTION_NAME for c in collections)
            
            if not collection_exists:
                logger.info(f"Creating collection: {self.COLLECTION_NAME}")
                self.client.create_collection(
                    collection_name=self.COLLECTION_NAME,
                    vectors_config={
                        "size": self.doc_embedding_dim,
                        "distance": "Cosine"
                    }
                )
                logger.info(f"Created collection: {self.COLLECTION_NAME}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to ensure collection exists: {str(e)}")
            return False

    def store_documents(
        self,
        texts: List[str],
        metadata_list: Optional[List[Dict[str, Any]]] = None,
        batch_size: int = 4
    ) -> bool:
        """
        Store text documents in the Qdrant Cloud collection.
        Args:
            texts: List of text documents
            metadata_list: Optional metadata for each document
            batch_size: Batch size for processing
        """
        try:
            if not texts:
                logger.warning("No documents to store")
                return False
            
            total_docs = len(texts)
            if self.verbose:
                logger.info(f"Generating embeddings for {total_docs} documents...")
            
            # Ensure metadata list
            if metadata_list is None:
                metadata_list = [{"id": f"doc_{i}", "timestamp": datetime.now().isoformat()}
                               for i in range(total_docs)]
            elif len(metadata_list) != total_docs:
                logger.warning(f"Metadata list length ({len(metadata_list)}) doesn't match texts length ({total_docs})")
                return False
            
            # Process in batches
            start_time = time.time()
            
            for i in range(0, total_docs, batch_size):
                batch_end = min(i + batch_size, total_docs)
                batch_texts = texts[i:batch_end]
                batch_metadata = metadata_list[i:batch_end]
                
                # Debug: print each chunk before encoding
                print(f"[DEBUG] Batch {i//batch_size}: {len(batch_texts)} chunks")
                for idx, text in enumerate(batch_texts):
                    print(f"[DEBUG] Chunk {i+idx}: {repr(text)} (len={len(text)})")

                # Try encoding each chunk individually to catch errors
                batch_embeddings = []
                for idx, text in enumerate(batch_texts):
                    try:
                        emb = self.doc_encoder.encode([text], batch_size=1, convert_to_numpy=True, normalize_embeddings=True)
                        batch_embeddings.append(emb[0])
                        print(f"[DEBUG] Chunk {i+idx} encode OK")
                    except Exception as e:
                        print(f"[ERROR] Chunk {i+idx} encode FAIL: {e}")
                        raise

                # Prepare points
                points = []
                for j, (text, embedding, metadata) in enumerate(
                    zip(batch_texts, batch_embeddings, batch_metadata)
                ):
                    # Ensure metadata is a dictionary
                    if not isinstance(metadata, dict):
                        metadata = {"id": f"doc_{i+j}", "timestamp": datetime.now().isoformat()}
                    
                    # Ensure id exists
                    if "id" not in metadata:
                        metadata["id"] = f"doc_{i+j}"
                    
                    point = models.PointStruct(
                        id=i+j,
                        vector=embedding.tolist(),
                        payload={
                            "text": text,
                            "metadata": metadata
                        }
                    )
                    points.append(point)
                
                # Store vectors in Qdrant Cloud
                try:
                    self.client.upsert(
                        collection_name=self.COLLECTION_NAME,
                        points=points
                    )
                except Exception as e:
                    logger.error(f"Failed to upsert points to Qdrant Cloud: {str(e)}")
                    logger.error(f"Points data: {points}")
                    raise Exception(f"Failed to store vectors in Qdrant Cloud: {str(e)}")
                
                if self.verbose:
                    progress = batch_end / total_docs * 100
                    logger.info(f"Progress: {progress:.1f}% ({batch_end}/{total_docs})")
            
            elapsed = time.time() - start_time
            logger.info(f"Successfully stored all {total_docs} documents in Qdrant Cloud in {elapsed:.2f} seconds")
            return True
            
        except Exception as e:
            logger.error(f"Failed to store documents in Qdrant Cloud: {str(e)}")
            raise Exception(f"Failed to store documents in Qdrant Cloud: {str(e)}")

    def search_documents(
        self,
        query_vector: np.ndarray,
        limit: int = 10,
        score_threshold: float = 0.0,
        search_filter: Optional[Filter] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents in the Qdrant Cloud collection.
        Args:
            query_vector: Query vector for similarity search
            limit: Maximum number of results to return
            score_threshold: Minimum score threshold
            search_filter: Optional metadata filter
        """
        try:
            results = self.client.search(
                collection_name=self.COLLECTION_NAME,
                query_vector=query_vector.tolist(),
                limit=limit,
                score_threshold=score_threshold,
                query_filter=search_filter
            )
            return [result.payload for result in results]
        except Exception as e:
            logger.error(f"Failed to search documents in Qdrant Cloud: {str(e)}")
            return []

    def get_collection_size(self) -> int:
        """Get the number of vectors in the Qdrant Cloud collection."""
        try:
            collection_info = self.client.get_collection(self.COLLECTION_NAME)
            return collection_info.vectors_count
        except Exception as e:
            logger.error(f"Failed to get collection size from Qdrant Cloud: {str(e)}")
            return 0 