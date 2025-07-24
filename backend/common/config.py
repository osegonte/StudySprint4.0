import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://osegonte@localhost:5432/studysprint4_local")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev_secret")
    # Add more settings as needed

settings = Settings()
