from app import create_app
import pymysql
from werkzeug.security import generate_password_hash
import os

app = create_app()

def init_database():
    # Connect to MySQL using PyMySQL with environment variables
    connection = pymysql.connect(
        host=os.environ.get('MYSQL_HOST'),
        user=os.environ.get('MYSQL_USER'),
        password=os.environ.get('MYSQL_PASSWORD'),
        database=os.environ.get('MYSQL_DB'),
        cursorclass=pymysql.cursors.DictCursor
    )
    cur = connection.cursor()
    
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
    
    # Create service_orders table
    cur.execute("""
            CREATE TABLE IF NOT EXISTS service_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                user_email VARCHAR(100),
                user_fullname VARCHAR(100),
                service_key VARCHAR(50),
                service_name VARCHAR(100),
                deposit_amount DECIMAL(10,2),
                status ENUM('pending_quote', 'awaiting_payment', 'payment_uploaded', 'payment_approved', 'payment_rejected', 'completed') DEFAULT 'pending_quote',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
    """)
    
    # Create payment_receipts table
    cur.execute("""
            CREATE TABLE IF NOT EXISTS payment_receipts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                filename VARCHAR(255),
                filepath VARCHAR(500),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                admin_decision ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                admin_notes TEXT,
                reviewed_at TIMESTAMP NULL,
                FOREIGN KEY (order_id) REFERENCES service_orders(id) ON DELETE CASCADE
            )
    """)
    
    # Create default admin user
    admin_password = generate_password_hash('omressa123')
    cur.execute("""
            INSERT IGNORE INTO admins (adminname, adminusername, adminemail, password, role)
            VALUES (%s, %s, %s, %s, %s)
        """, ('Admin User', 'omaressa', 'admin@vortexagent.com', admin_password, 'super_admin'))
    
    connection.commit()
    cur.close()
    connection.close()
    print("Database tables created successfully!")
    print("Default admin user created:")
    print("  Username: omaressa")
    print("  Password: omressa123")
    print("  Role: super_admin")

if __name__ == '__main__':
    init_database()