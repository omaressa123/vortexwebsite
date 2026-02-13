import os
from dotenv import load_dotenv

load_dotenv()

# Validate required environment variables
SECRET_KEY = os.environ.get('SECRET_KEY')
DATABASE_TYPE = os.environ.get('DATABASE_TYPE', 'mysql')
SQLITE_DATABASE_PATH = os.environ.get('SQLITE_DATABASE_PATH')
MYSQL_HOST = os.environ.get('MYSQL_HOST')
MYSQL_USER = os.environ.get('MYSQL_USER')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD')
MYSQL_DB = os.environ.get('MYSQL_DB')
MYSQL_CURSORCLASS = 'DictCursor'

# Security validation for production
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required for Flask application")

if DATABASE_TYPE == 'mysql' and not MYSQL_PASSWORD:
    raise ValueError("MYSQL_PASSWORD environment variable is required for database connection")

class Config:
    SECRET_KEY = SECRET_KEY
    DATABASE_TYPE = DATABASE_TYPE
    SQLITE_DATABASE_PATH = SQLITE_DATABASE_PATH
    MYSQL_HOST = MYSQL_HOST or 'localhost'
    MYSQL_USER = MYSQL_USER or 'root'
    MYSQL_PASSWORD = MYSQL_PASSWORD
    MYSQL_DB = MYSQL_DB or 'vortex_agent_db'
    MYSQL_CURSORCLASS = MYSQL_CURSORCLASS

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False