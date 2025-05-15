from typing import List, Optional
from pydantic_settings import BaseSettings
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # Project info - required from env
    PROJECT_NAME: str = "SenseLib"
    API_V1_STR: str = "/api"
    if not PROJECT_NAME:
        raise ValueError("PROJECT_NAME environment variable is not set")
    
    # API settings - required from env
    API_HOST: str = os.getenv("API_HOST")
    if not API_HOST:
        raise ValueError("API_HOST environment variable is not set")
    
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # CORS settings - required from env
    BACKEND_CORS_ORIGINS_STR: str = os.getenv("BACKEND_CORS_ORIGINS", "")
    if not BACKEND_CORS_ORIGINS_STR:
        raise ValueError("BACKEND_CORS_ORIGINS environment variable is not set")
    
    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS_STR.split(",") if origin.strip()]
    
    # File upload settings - required from env
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR")
    if not UPLOAD_DIR:
        raise ValueError("UPLOAD_DIR environment variable is not set")
    
    # Database settings - required from env
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is not set")
    
    # Database connection settings - required from env
    DB_HOST: str = os.getenv("DB_HOST")
    if not DB_HOST:
        raise ValueError("DB_HOST environment variable is not set")
    
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME")
    if not DB_NAME:
        raise ValueError("DB_NAME environment variable is not set")
    
    DB_USER: str = os.getenv("DB_USER")
    if not DB_USER:
        raise ValueError("DB_USER environment variable is not set")
    
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")
    if not DB_PASSWORD:
        raise ValueError("DB_PASSWORD environment variable is not set")
    
    DB_SCHEMA: str = os.getenv("DB_SCHEMA", "public")
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # Database pool settings - required from env
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    DB_POOL_RECYCLE: int = int(os.getenv("DB_POOL_RECYCLE", "1800"))
    DB_ECHO: bool = os.getenv("DB_ECHO", "False").lower() == "true"
    
    # JWT settings - required from env
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY environment variable is not set")
    
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Grok API settings - required from env
    GROK_API_KEY: str = os.getenv("GROK_API_KEY")
    if not GROK_API_KEY:
        raise ValueError("GROK_API_KEY environment variable is not set")
    
    # Qdrant Vector Database settings - required from env
    QDRANT_URL: str = os.getenv("QDRANT_URL")
    if not QDRANT_URL:
        raise ValueError("QDRANT_URL environment variable is not set")
    
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY")
    if not QDRANT_API_KEY:
        raise ValueError("QDRANT_API_KEY environment variable is not set")
    
    # SMTP settings - required from env
    SMTP_HOST: str = os.getenv("SMTP_HOST")
    if not SMTP_HOST:
        raise ValueError("SMTP_HOST environment variable is not set")
    
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME")
    if not SMTP_USERNAME:
        raise ValueError("SMTP_USERNAME environment variable is not set")
    
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD")
    if not SMTP_PASSWORD:
        raise ValueError("SMTP_PASSWORD environment variable is not set")
    
    # Email settings (using SMTP settings)
    MAIL_USERNAME: str = SMTP_USERNAME
    MAIL_PASSWORD: str = SMTP_PASSWORD
    MAIL_FROM: str = SMTP_USERNAME
    MAIL_PORT: int = SMTP_PORT
    MAIL_SERVER: str = SMTP_HOST
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"
        
    # Allowed file types for document upload
    ALLOWED_FILE_TYPES: list[str] = [
        "txt", "pdf", "docx", "doc", "rtf", "odt", "html", "xml", "json", "csv", "xls", "xlsx", "ppt", "pptx"
    ]
    
    # Max file size for upload (bytes), ví dụ: 20MB
    MAX_FILE_SIZE: int = 20 * 1024 * 1024  # 20MB

# Create settings instance
settings = Settings() 