import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PG_USER = os.getenv("PG_USER", "postgres")
    PG_PASSWORD = os.getenv("PG_PASSWORD", "abi123")
    PG_HOST = os.getenv("PG_HOST", "localhost")
    PG_PORT = os.getenv("PG_PORT", "5432")
    PG_DB = os.getenv("PG_DB", "billing_db")
    
    DATABASE_URL = f"postgresql://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DB}"
    
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", "8000"))
    
    PAGE_SIZE = int(os.getenv("PAGE_SIZE", "100"))

settings = Settings()