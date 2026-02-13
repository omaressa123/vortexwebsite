import mysql.connector
from werkzeug.security import generate_password_hash
import os

def setup_database():
    # Get database credentials
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'vortex_agent_db')
    
    try:
        # Connect to MySQL server
        connection = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        cursor = connection.cursor()
        print("✅ Connected to MySQL server")
        
        # Create database if not exists
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DB}")
        cursor.execute(f"USE {MYSQL_DB}")
        print(f"✅ Database '{MYSQL_DB}' ready")
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullname VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
                last_login TIMESTAMP NULL
            )
        """)
        
        # Create admins table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                adminname VARCHAR(100) NOT NULL,
                adminusername VARCHAR(50) UNIQUE NOT NULL,
                adminemail VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status ENUM('active', 'inactive') DEFAULT 'active'
            )
        """)
        
        # Create analytics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analytics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action VARCHAR(100),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address VARCHAR(45),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        # Create default admin user
        admin_password = generate_password_hash('omressa123')
        cursor.execute("""
            INSERT IGNORE INTO admins (adminname, adminusername, adminemail, password, role)
            VALUES (%s, %s, %s, %s, %s)
        """, ('Admin User', 'omaressa', 'admin@vortexagent.com', admin_password, 'super_admin'))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        print("✅ Database setup completed successfully!")
        print("📋 Default admin credentials:")
        print("   Username: omaressa")
        print("   Password: omressa123")
        print("   Role: super_admin")
        print("🌐 You can now login at: http://localhost:5000/backendoverviewpage")
        
    except mysql.connector.Error as err:
        print(f"❌ MySQL Error: {err}")
        print("Please check:")
        print("1. MySQL server is running")
        print("2. Credentials in .env are correct")
        print("3. MySQL user has proper privileges")
        print(f"   Using: {MYSQL_USER}@{MYSQL_HOST}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    setup_database()
