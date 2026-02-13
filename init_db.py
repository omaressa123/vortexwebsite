from app import create_app
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash
import os

app = create_app()
mysql = MySQL(app)

def init_database():
    with app.app_context():
        cur = mysql.connection.cursor()
        
        # Create users table
        cur.execute("""
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
        cur.execute("""
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
        cur.execute("""
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
        cur.execute("""
            INSERT IGNORE INTO admins (adminname, adminusername, adminemail, password, role)
            VALUES (%s, %s, %s, %s, %s)
        """, ('Admin User', 'omaressa', 'admin@vortexagent.com', admin_password, 'super_admin'))
        
        mysql.connection.commit()
        cur.close()
        print("Database tables created successfully!")
        print("Default admin user created:")
        print("  Username: omaressa")
        print("  Password: omressa123")
        print("  Role: super_admin")

if __name__ == '__main__':
    init_database()