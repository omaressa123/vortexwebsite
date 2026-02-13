import sqlite3
import os

# Check database status
db_path = 'database/vortex_agent.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print('📊 Database tables:', [table[0] for table in tables])
    
    # Check admin user
    cursor.execute('SELECT adminusername, role FROM admins')
    admins = cursor.fetchall()
    print('👤 Admin users:', admins)
    
    # Check users count
    cursor.execute('SELECT COUNT(*) FROM users')
    user_count = cursor.fetchone()[0]
    print('👥 Total users:', user_count)
    
    conn.close()
    print('✅ Database is ready and functional')
else:
    print('❌ Database not found')
