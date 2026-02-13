import subprocess
import sys

def reset_mysql_password():
    """Reset MySQL root password to jockeroika1234"""
    print("🔄 Attempting to reset MySQL root password...")
    
    try:
        # Stop MySQL service
        print("⏹️ Stopping MySQL service...")
        subprocess.run(['net', 'stop', 'mysql80'], check=False, capture_output=True)
        
        # Start MySQL in safe mode
        print("🔓 Starting MySQL in safe mode...")
        safe_mode_cmd = [
            'mysqld', 
            '--skip-grant-tables', 
            '--skip-networking',
            '--console'
        ]
        
        # This is complex and may not work on all systems
        print("⚠️ Manual reset required:")
        print("1. Stop MySQL service")
        print("2. Start MySQL with: mysqld --skip-grant-tables --skip-networking")
        print("3. Connect with: mysql -u root")
        print("4. Run: ALTER USER 'root'@'localhost' IDENTIFIED BY 'jockeroika1234';")
        print("5. FLUSH PRIVILEGES;")
        print("6. Stop and restart MySQL normally")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    reset_mysql_password()
