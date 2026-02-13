import os
import sys
from app import create_app

def main():
    print("Initializing Vortex Agent Flask Application...")
    
    # Check database type
    db_type = os.environ.get('DATABASE_TYPE', 'mysql')
    
    if db_type == 'sqlite':
        print("Using SQLite database...")
        sqlite_path = os.environ.get('SQLITE_DATABASE_PATH', 'database/vortex_agent.db')
        if os.path.exists(sqlite_path):
            print("✅ SQLite database found and ready")
        else:
            print("❌ SQLite database not found. Please run: python setup_sqlite.py")
            return
    else:
        print("Using MySQL database...")
        print("Make sure MySQL server is running and database is initialized.")
        
        # Initialize database if not already done
        try:
            from init_db import init_database
            init_database()
            print("Database initialized successfully!")
        except Exception as e:
            print(f"Error initializing database: {e}")
            print("Make sure MySQL server is running and credentials are correct.")
            print("Or switch to SQLite by running: python setup_sqlite.py")
            return
    
    # Create and run Flask app
    app = create_app()
    
    print("\nStarting Flask server...")
    print("Application is running at: http://localhost:5000")
    print("Admin login: http://localhost:5000/backendoverviewpage")
    print("Press Ctrl+C to stop the server\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False)

if __name__ == '__main__':
    main()