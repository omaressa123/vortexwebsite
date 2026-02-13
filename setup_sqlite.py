import sqlite3
from werkzeug.security import generate_password_hash
import os

def setup_sqlite_database():
    """Setup SQLite database as fallback"""
    try:
        # Create database directory
        os.makedirs('database', exist_ok=True)
        db_path = 'database/vortex_agent.db'
        
        # Connect to SQLite
        connection = sqlite3.connect(db_path)
        cursor = connection.cursor()
        print("✅ Connected to SQLite database")
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fullname TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active',
                last_login TIMESTAMP NULL
            )
        """)
        
        # Create admins table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                adminname TEXT NOT NULL,
                adminusername TEXT UNIQUE NOT NULL,
                adminemail TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'admin',
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active'
            )
        """)
        
        # Create analytics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                action TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        # Create default admin user
        admin_password = generate_password_hash('omressa123')
        print(f"DEBUG: Generated hash: {admin_password}")
        
        # Delete existing admin user and insert new one
        cursor.execute("DELETE FROM admins WHERE adminusername = ?", ('omaressa',))
        cursor.execute("""
            INSERT INTO admins (adminname, adminusername, adminemail, password, role)
            VALUES (?, ?, ?, ?, ?)
        """, ('Admin User', 'omaressa', 'admin@vortexagent.com', admin_password, 'super_admin'))
        
        connection.commit()
        connection.close()
        
        print("✅ SQLite database setup completed successfully!")
        print("📋 Default admin credentials:")
        print("   Username: omaressa")
        print("   Password: omressa123")
        print("   Role: super_admin")
        print("💾 Database saved to: database/vortex_agent.db")
        print("🌐 You can now login at: http://localhost:5000/backendoverviewpage")
        
        # Update .env for SQLite
        with open('.env', 'w') as f:
            f.write(f"""SECRET_KEY=vortex-agent-production-secret-key-change-this-in-production
DATABASE_TYPE=sqlite
SQLITE_DATABASE_PATH={os.path.abspath(db_path)}
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=jockeroika1234
MYSQL_DB=vortex_agent_db
""")
        
        print("📝 Updated .env for SQLite database")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    setup_sqlite_database()
