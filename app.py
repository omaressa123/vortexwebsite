from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from config import Config
import json
import os
import sqlite3
import uuid
from datetime import datetime

# Conditional imports based on database type
db_type = os.environ.get('DATABASE_TYPE', 'mysql')
if db_type == 'mysql':
    import pymysql
    pymysql.install_as_MySQLdb()
else:
    MySQL = None  # Placeholder for SQLite mode

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.config.setdefault('UPLOAD_FOLDER', os.path.join(os.path.dirname(__file__), 'uploads'))
    app.config.setdefault('MAX_CONTENT_LENGTH', 10 * 1024 * 1024)  # 10MB
    
    # Database setup
    db_type = os.environ.get('DATABASE_TYPE', 'mysql')
    
    # Make database accessible to routes
    app.mysql = None
    app.sqlite_db = None
    
    if db_type == 'sqlite':
        sqlite_path = os.environ.get('SQLITE_DATABASE_PATH', 'database/vortex_agent.db')
        try:
            app.sqlite_db = sqlite3.connect(sqlite_path, check_same_thread=False)
            app.sqlite_db.row_factory = sqlite3.Row
            print("SQLite database connected successfully")
        except Exception as e:
            print(f"SQLite connection error: {e}")
            app.sqlite_db = None
    else:
        # Initialize MySQL after app configuration
        try:
            app.mysql = MySQL(app)
            # Test database connection
            with app.app_context():
                cursor = app.mysql.connection.cursor()
                cursor.close()
            print("MySQL connection successful")
        except Exception as e:
            print(f"MySQL connection error: {e}")
            print("Running in development mode without database")
            app.mysql = None

    def init_service_tables():
        if app.mysql is None and app.sqlite_db is None:
            return

        service_orders_sqlite = """
            CREATE TABLE IF NOT EXISTS service_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT,
                user_fullname TEXT,
                service_key TEXT NOT NULL,
                service_name TEXT NOT NULL,
                deposit_amount REAL,
                status TEXT NOT NULL DEFAULT 'pending_quote',
                created_at TEXT,
                updated_at TEXT
            )
        """

        payment_receipts_sqlite = """
            CREATE TABLE IF NOT EXISTS payment_receipts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                filename TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                uploaded_at TEXT,
                reviewed_at TEXT,
                admin_note TEXT,
                FOREIGN KEY(order_id) REFERENCES service_orders(id)
            )
        """

        service_orders_mysql = """
            CREATE TABLE IF NOT EXISTS service_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_email VARCHAR(255),
                user_fullname VARCHAR(255),
                service_key VARCHAR(100) NOT NULL,
                service_name VARCHAR(255) NOT NULL,
                deposit_amount DECIMAL(10,2) NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'pending_quote',
                created_at VARCHAR(50),
                updated_at VARCHAR(50)
            )
        """

        payment_receipts_mysql = """
            CREATE TABLE IF NOT EXISTS payment_receipts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                filename VARCHAR(255) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                uploaded_at VARCHAR(50),
                reviewed_at VARCHAR(50),
                admin_note TEXT
            )
        """

        try:
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute(service_orders_sqlite)
                cur.execute(payment_receipts_sqlite)
                app.sqlite_db.commit()
            else:
                with app.app_context():
                    cur = app.mysql.connection.cursor()
                    cur.execute(service_orders_mysql)
                    cur.execute(payment_receipts_mysql)
                    app.mysql.connection.commit()
        except Exception as e:
            print(f"Service tables init error: {e}")

    init_service_tables()
    
    @app.route('/')
    def index():
        return render_template('index.html')
    
    @app.route('/index.html')
    def index_html():
        return render_template('index.html')
    
    @app.route('/register')
    def register():
        return render_template('registrationpage.html')
    
    @app.route('/backendoverviewpage')
    def backend_overview():
        return render_template('backendoverviewpage.html')

    @app.route('/services')
    def services_page():
        return app.send_static_file('services.html')

    @app.route('/service-checkout')
    def service_checkout_page():
        return app.send_static_file('service-checkout.html')

    @app.route('/backend-service-orders')
    def backend_service_orders_page():
        return app.send_static_file('backend-service-orders.html')
    
    @app.route('/backend-dashboard')
    def backend_dashboard():
        return app.send_static_file('backend-dashboard.html')
    
    @app.route('/backend-analytics')
    def backend_analytics():
        return app.send_static_file('backend-analytics.html')
    
    @app.route('/backend-kpi')
    def backend_kpi():
        return app.send_static_file('backend-kpi.html')
    
    @app.route('/backend-registrations')
    def backend_registrations():
        return app.send_static_file('backend-registrations.html')
    
    @app.route('/backend-users')
    def backend_users():
        return app.send_static_file('backend-users.html')
    
    @app.route('/backend-reports')
    def backend_reports():
        return app.send_static_file('backend-reports.html')
    
    @app.route('/backend-script.js')
    def backend_script():
        return app.send_static_file('backend-script.js')
    
    @app.route('/backend-style.css')
    def backend_style():
        return app.send_static_file('backend-style.css')
    
    @app.route('/favicon.ico')
    def favicon():
        return '', 204  # No content response for favicon

    @app.route('/uploads/receipts/<path:filename>')
    def uploaded_receipt(filename):
        receipts_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'receipts')
        return send_from_directory(receipts_dir, filename)
    
    # API Routes
    
    @app.route('/api/admin/login', methods=['POST'])
    def admin_login():
        data = request.get_json()
        username = data.get('username', '')
        password = data.get('password', '')
        
        print(f"DEBUG: app.mysql is None: {app.mysql is None}")
        print(f"DEBUG: app.sqlite_db is None: {app.sqlite_db is None}")
        print(f"DEBUG: username: {username}, password: {password}")
        
        if app.mysql is None and app.sqlite_db is None:
            print("DEBUG: Entering development mode")
            # Development mode - mock admin login
            if username == 'omaressa' and password == 'omressa123':
                print("DEBUG: Development mode login successful")
                return jsonify({
                    'status': 'success',
                    'user_id': 1,
                    'username': 'omaressa',
                    'adminname': 'Admin User',
                    'token': 'admin-development-token',
                    'expires_in': 3600,
                    'type': 'admin',
                    'role': 'super_admin',
                    'note': 'Development mode - no database'
                })
            else:
                print("DEBUG: Development mode login failed")
                return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
        
        try:
            if app.sqlite_db:
                # SQLite query
                cursor = app.sqlite_db.cursor()
                cursor.execute("SELECT * FROM admins WHERE adminusername = ? OR adminemail = ?", (username, username))
                user = cursor.fetchone()
                
                if user and check_password_hash(user['password'], password):
                    return jsonify({
                        'status': 'success',
                        'user_id': user['id'],
                        'username': user['adminusername'],
                        'adminname': user['adminname'],
                        'token': 'sqlite-admin-token',
                        'expires_in': 3600,
                        'type': 'admin',
                        'role': user['role']
                    })
                else:
                    return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
            else:
                # MySQL query
                with app.app_context():
                    cur = app.mysql.connection.cursor()
                    cur.execute("SELECT * FROM admins WHERE adminusername = %s OR adminemail = %s", (username, username))
                    user = cur.fetchone()
                    
                    if user and check_password_hash(user['password'], password):
                        return jsonify({
                            'status': 'success',
                            'user_id': user['id'],
                            'username': user['adminusername'],
                            'adminname': user['adminname'],
                            'token': 'mysql-admin-token',
                            'expires_in': 3600,
                            'type': 'admin',
                            'role': user['role']
                        })
                    else:
                        return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    
    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username', '')
        password = data.get('password', '')
        
        if app.mysql is None and app.sqlite_db is None:
            # Development mode - mock login
            if username and password:
                return jsonify({
                    'status': 'success',
                    'user_id': 1,
                    'username': username,
                    'token': 'development-token',
                    'expires_in': 3600,
                    'type': 'user',
                    'note': 'Development mode - no database'
                })
            else:
                return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
        
        try:
            if app.sqlite_db:
                # SQLite query
                cursor = app.sqlite_db.cursor()
                cursor.execute("SELECT * FROM admins WHERE adminusername = ? OR adminemail = ?", (username, username))
                user = cursor.fetchone()
                
                if user and check_password_hash(user['password'], password):
                    return jsonify({
                        'status': 'success',
                        'user_id': user['id'],
                        'username': user['adminusername'],
                        'token': 'sqlite-jwt-token',
                        'expires_in': 3600,
                        'type': 'admin'
                    })
                else:
                    return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
            else:
                # MySQL query
                with app.app_context():
                    cur = app.mysql.connection.cursor()
                    cur.execute("SELECT * FROM admins WHERE adminusername = %s OR adminemail = %s", (username, username))
                    user = cur.fetchone()
                    
                    if user and check_password_hash(user['password'], password):
                        return jsonify({
                            'status': 'success',
                            'user_id': user['id'],
                            'username': user['adminusername'],
                            'token': 'mysql-jwt-token',
                            'expires_in': 3600,
                            'type': 'admin'
                        })
                    else:
                        return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    
    @app.route('/api/register-user', methods=['POST'])
    def register_user():
        if app.mysql is None and app.sqlite_db is None:
            # Development mode - return mock success
            return jsonify({
                'status': 'success',
                'message': 'User registered successfully (development mode)',
                'note': 'Database not connected - running in development mode'
            })
            
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'Invalid JSON data'}), 400
            
        fullname = data.get('fullname')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        
        if not all([fullname, email, password, confirm_password]):
            return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400
        
        if password != confirm_password:
            return jsonify({'status': 'error', 'message': 'Passwords do not match'}), 400
        
        hashed_password = generate_password_hash(password)
        
        try:
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute(
                    "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)",
                    (fullname, email, hashed_password)
                )
                app.sqlite_db.commit()
                return jsonify({
                    'status': 'success',
                    'message': 'User registered successfully'
                })

            with app.app_context():
                cur = app.mysql.connection.cursor()
                cur.execute(
                    "INSERT INTO users (fullname, email, password) VALUES (%s, %s, %s)",
                    (fullname, email, hashed_password)
                )
                app.mysql.connection.commit()
                return jsonify({
                    'status': 'success',
                    'message': 'User registered successfully'
                })
        except Exception as e:
            if app.mysql:
                app.mysql.connection.rollback()
            return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500

    # ========================================
    # Services + Payments APIs
    # ========================================

    SERVICES = {
        'data_analysis': 'Data Analysis & Insights',
        'custom_ai': 'Custom AI Solutions',
        'automation': 'Automation'
    }

    INSTAPAY_PHONE = '01021484537'
    INSTAPAY_NAME = 'omar mohamed mahmoud'

    @app.route('/api/services/orders', methods=['POST'])
    def create_service_order():
        data = request.get_json() or {}
        service_key = data.get('service_key')
        user_email = data.get('user_email')
        user_fullname = data.get('user_fullname')

        if service_key not in SERVICES:
            return jsonify({'status': 'error', 'message': 'Invalid service'}), 400

        service_name = SERVICES[service_key]
        now = datetime.utcnow().isoformat()

        if app.mysql is None and app.sqlite_db is None:
            # Dev mode mock
            return jsonify({
                'status': 'success',
                'order': {
                    'id': 1,
                    'user_email': user_email,
                    'user_fullname': user_fullname,
                    'service_key': service_key,
                    'service_name': service_name,
                    'deposit_amount': None,
                    'status': 'pending_quote',
                    'created_at': now,
                    'updated_at': now
                },
                'note': 'Development mode - mock order'
            })

        try:
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute(
                    "INSERT INTO service_orders (user_email, user_fullname, service_key, service_name, deposit_amount, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (user_email, user_fullname, service_key, service_name, None, 'pending_quote', now, now)
                )
                app.sqlite_db.commit()
                order_id = cur.lastrowid
            else:
                with app.app_context():
                    cur = app.mysql.connection.cursor()
                    cur.execute(
                        "INSERT INTO service_orders (user_email, user_fullname, service_key, service_name, deposit_amount, status, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                        (user_email, user_fullname, service_key, service_name, None, 'pending_quote', now, now)
                    )
                    app.mysql.connection.commit()
                    order_id = cur.lastrowid

            return jsonify({'status': 'success', 'order': {'id': order_id, 'status': 'pending_quote'}})
        except Exception as e:
            if app.mysql:
                app.mysql.connection.rollback()
            return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500

    @app.route('/api/services/orders/<int:order_id>', methods=['GET'])
    def get_service_order(order_id):
        if app.mysql is None and app.sqlite_db is None:
            now = datetime.utcnow().isoformat()
            return jsonify({
                'status': 'success',
                'order': {
                    'id': order_id,
                    'service_key': 'automation',
                    'service_name': SERVICES['automation'],
                    'deposit_amount': 500,
                    'status': 'quoted',
                    'created_at': now,
                    'updated_at': now
                },
                'payment': {
                    'instapay_phone': INSTAPAY_PHONE,
                    'instapay_name': INSTAPAY_NAME,
                    'qr_url': f"/api/services/orders/{order_id}/qr"
                },
                'note': 'Development mode - mock order'
            })

        try:
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute("SELECT * FROM service_orders WHERE id = ?", (order_id,))
                order = cur.fetchone()
                if not order:
                    return jsonify({'status': 'error', 'message': 'Order not found'}), 404
                order_dict = dict(order)
            else:
                with app.app_context():
                    cur = app.mysql.connection.cursor()
                    cur.execute("SELECT * FROM service_orders WHERE id = %s", (order_id,))
                    order = cur.fetchone()
                    if not order:
                        return jsonify({'status': 'error', 'message': 'Order not found'}), 404
                    order_dict = dict(order)

            return jsonify({
                'status': 'success',
                'order': order_dict,
                'payment': {
                    'instapay_phone': INSTAPAY_PHONE,
                    'instapay_name': INSTAPAY_NAME,
                    'qr_url': f"/api/services/orders/{order_id}/qr"
                }
            })
        except Exception as e:
            return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500

    @app.route('/api/admin/service-orders', methods=['GET'])
    def admin_list_service_orders():
        if app.mysql is None and app.sqlite_db is None:
            now = datetime.utcnow().isoformat()
            return jsonify({
                'status': 'success',
                'orders': [
                    {
                        'id': 1,
                        'user_email': 'test@example.com',
                        'user_fullname': 'Test User',
                        'service_key': 'automation',
                        'service_name': SERVICES['automation'],
                        'deposit_amount': None,
                        'status': 'pending_quote',
                        'created_at': now,
                        'updated_at': now
                    }
                ],
                'note': 'Development mode - mock data'
            })

        try:
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute("SELECT * FROM service_orders ORDER BY id DESC")
                orders = [dict(r) for r in cur.fetchall()]
            else:
                with app.app_context():
                    cur = app.mysql.connection.cursor()
                    cur.execute("SELECT * FROM service_orders ORDER BY id DESC")
                    orders = [dict(r) for r in cur.fetchall()]
            return jsonify({'status': 'success', 'orders': orders})
        except Exception as e:
            return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500

    @app.route('/api/admin/service-orders/<int:order_id>/quote', methods=['POST'])
    def admin_quote_service_order(order_id):
        data = request.get_json() or {}
        deposit_amount = data.get('deposit_amount')

        try:
            deposit_amount = float(deposit_amount)
        except Exception:
            return jsonify({'status': 'error', 'message': 'Invalid deposit_amount'}), 400

        now = datetime.utcnow().isoformat()

        if app.mysql is None and app.sqlite_db is None:
            return jsonify({'status': 'success', 'order': {'id': order_id, 'deposit_amount': deposit_amount, 'status': 'quoted'}})

        try:
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute(
                    "UPDATE service_orders SET deposit_amount = ?, status = ?, updated_at = ? WHERE id = ?",
                    (deposit_amount, 'quoted', now, order_id)
                )
                app.sqlite_db.commit()
            else:
                with app.app_context():
                    cur = app.mysql.connection.cursor()
                    cur.execute(
                        "UPDATE service_orders SET deposit_amount = %s, status = %s, updated_at = %s WHERE id = %s",
                        (deposit_amount, 'quoted', now, order_id)
                    )
                    app.mysql.connection.commit()

            return jsonify({'status': 'success', 'order': {'id': order_id, 'deposit_amount': deposit_amount, 'status': 'quoted'}})
        except Exception as e:
            if app.mysql:
                app.mysql.connection.rollback()
            return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500

    @app.route('/api/services/orders/<int:order_id>/qr', methods=['GET'])
    def service_order_qr(order_id):
        try:
            import qrcode
        except Exception:
            return jsonify({'status': 'error', 'message': 'QR library not installed. Run: pip install qrcode'}), 500

        # Get deposit amount + service name
        if app.mysql is None and app.sqlite_db is None:
            deposit_amount = 500
            service_name = SERVICES['automation']
        else:
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute("SELECT service_name, deposit_amount FROM service_orders WHERE id = ?", (order_id,))
                row = cur.fetchone()
                if not row:
                    return jsonify({'status': 'error', 'message': 'Order not found'}), 404
                service_name = row['service_name']
                deposit_amount = row['deposit_amount']
            else:
                with app.app_context():
                    cur = app.mysql.connection.cursor()
                    cur.execute("SELECT service_name, deposit_amount FROM service_orders WHERE id = %s", (order_id,))
                    row = cur.fetchone()
                    if not row:
                        return jsonify({'status': 'error', 'message': 'Order not found'}), 404
                    service_name = row['service_name']
                    deposit_amount = row['deposit_amount']

        if deposit_amount is None:
            return jsonify({'status': 'error', 'message': 'Deposit not set by admin yet'}), 400

        payload = "\n".join([
            "InstaPay Transfer",
            f"To: {INSTAPAY_NAME}",
            f"Phone: {INSTAPAY_PHONE}",
            f"Amount: {deposit_amount} EGP",
            f"Service: {service_name}",
            f"OrderId: {order_id}"
        ])

        img = qrcode.make(payload)
        tmp_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'qr')
        os.makedirs(tmp_dir, exist_ok=True)
        filename = f"order_{order_id}.png"
        path = os.path.join(tmp_dir, filename)
        img.save(path)
        return send_from_directory(tmp_dir, filename)

    @app.route('/api/services/orders/<int:order_id>/receipt', methods=['POST'])
    def upload_service_receipt(order_id):
        if 'screenshot' not in request.files:
            return jsonify({'status': 'error', 'message': 'Missing file field: screenshot'}), 400

        file = request.files['screenshot']
        if not file or file.filename == '':
            return jsonify({'status': 'error', 'message': 'No file selected'}), 400

        # Ensure order exists
        if not (app.mysql is None and app.sqlite_db is None):
            try:
                if app.sqlite_db is not None:
                    cur = app.sqlite_db.cursor()
                    cur.execute("SELECT id FROM service_orders WHERE id = ?", (order_id,))
                    if not cur.fetchone():
                        return jsonify({'status': 'error', 'message': 'Order not found'}), 404
                else:
                    with app.app_context():
                        cur = app.mysql.connection.cursor()
                        cur.execute("SELECT id FROM service_orders WHERE id = %s", (order_id,))
                        if not cur.fetchone():
                            return jsonify({'status': 'error', 'message': 'Order not found'}), 404
            except Exception as e:
                return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500

        receipts_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'receipts')
        os.makedirs(receipts_dir, exist_ok=True)
        safe_name = secure_filename(file.filename)
        unique_name = f"{order_id}_{uuid.uuid4().hex}_{safe_name}"
        save_path = os.path.join(receipts_dir, unique_name)
        file.save(save_path)

        now = datetime.utcnow().isoformat()

        if app.mysql is None and app.sqlite_db is None:
            return jsonify({'status': 'success', 'filename': unique_name, 'note': 'Development mode - file saved'}), 200

        try:
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute(
                    "INSERT INTO payment_receipts (order_id, filename, status, uploaded_at) VALUES (?, ?, ?, ?)",
                    (order_id, unique_name, 'pending', now)
                )
                cur.execute(
                    "UPDATE service_orders SET status = ?, updated_at = ? WHERE id = ?",
                    ('receipt_uploaded', now, order_id)
                )
                app.sqlite_db.commit()
            else:
                with app.app_context():
                    cur = app.mysql.connection.cursor()
                    cur.execute(
                        "INSERT INTO payment_receipts (order_id, filename, status, uploaded_at) VALUES (%s, %s, %s, %s)",
                        (order_id, unique_name, 'pending', now)
                    )
                    cur.execute(
                        "UPDATE service_orders SET status = %s, updated_at = %s WHERE id = %s",
                        ('receipt_uploaded', now, order_id)
                    )
                    app.mysql.connection.commit()

            return jsonify({'status': 'success', 'filename': unique_name}), 200
        except Exception as e:
            if app.mysql:
                app.mysql.connection.rollback()
            return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500

    @app.route('/api/admin/service-orders/<int:order_id>/receipts', methods=['GET'])
    def admin_list_receipts(order_id):
        if app.mysql is None and app.sqlite_db is None:
            return jsonify({'status': 'success', 'receipts': []})

        try:
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute("SELECT * FROM payment_receipts WHERE order_id = ? ORDER BY id DESC", (order_id,))
                receipts = [dict(r) for r in cur.fetchall()]
            else:
                with app.app_context():
                    cur = app.mysql.connection.cursor()
                    cur.execute("SELECT * FROM payment_receipts WHERE order_id = %s ORDER BY id DESC", (order_id,))
                    receipts = [dict(r) for r in cur.fetchall()]
            return jsonify({'status': 'success', 'receipts': receipts})
        except Exception as e:
            return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500

    @app.route('/api/admin/service-orders/<int:order_id>/review', methods=['POST'])
    def admin_review_receipt(order_id):
        data = request.get_json() or {}
        decision = data.get('decision')  # approve / reject
        admin_note = data.get('admin_note')
        receipt_id = data.get('receipt_id')

        if decision not in ('approve', 'reject'):
            return jsonify({'status': 'error', 'message': 'Invalid decision'}), 400
        if receipt_id is None:
            return jsonify({'status': 'error', 'message': 'Missing receipt_id'}), 400

        now = datetime.utcnow().isoformat()

        if app.mysql is None and app.sqlite_db is None:
            return jsonify({'status': 'success'})

        try:
            new_status = 'approved' if decision == 'approve' else 'rejected'
            order_status = 'deposit_approved' if decision == 'approve' else 'deposit_rejected'

            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute(
                    "UPDATE payment_receipts SET status = ?, reviewed_at = ?, admin_note = ? WHERE id = ? AND order_id = ?",
                    (new_status, now, admin_note, receipt_id, order_id)
                )
                cur.execute(
                    "UPDATE service_orders SET status = ?, updated_at = ? WHERE id = ?",
                    (order_status, now, order_id)
                )
                app.sqlite_db.commit()
            else:
                with app.app_context():
                    cur = app.mysql.connection.cursor()
                    cur.execute(
                        "UPDATE payment_receipts SET status = %s, reviewed_at = %s, admin_note = %s WHERE id = %s AND order_id = %s",
                        (new_status, now, admin_note, receipt_id, order_id)
                    )
                    cur.execute(
                        "UPDATE service_orders SET status = %s, updated_at = %s WHERE id = %s",
                        (order_status, now, order_id)
                    )
                    app.mysql.connection.commit()

            return jsonify({'status': 'success'})
        except Exception as e:
            if app.mysql:
                app.mysql.connection.rollback()
            return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500
    
    @app.route('/api/register-admin', methods=['POST'])
    def register_admin():
        if app.mysql is None and app.sqlite_db is None:
            return jsonify({'status': 'error', 'message': 'Database not available - check MySQL connection'}), 500
            
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'Invalid JSON data'}), 400
            
        adminname = data.get('adminname')
        adminusername = data.get('adminusername')
        adminemail = data.get('adminemail')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        
        if not all([adminname, adminusername, adminemail, password, confirm_password]):
            return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400
        
        if password != confirm_password:
            return jsonify({'status': 'error', 'message': 'Passwords do not match'}), 400
        
        hashed_password = generate_password_hash(password)
        
        try:
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute(
                    "INSERT INTO admins (adminname, adminusername, adminemail, password) VALUES (?, ?, ?, ?)",
                    (adminname, adminusername, adminemail, hashed_password)
                )
                app.sqlite_db.commit()
                return jsonify({
                    'status': 'success',
                    'message': 'Administrator registered successfully'
                })

            with app.app_context():
                cur = app.mysql.connection.cursor()
                cur.execute(
                    "INSERT INTO admins (adminname, adminusername, adminemail, password) VALUES (%s, %s, %s, %s)",
                    (adminname, adminusername, adminemail, hashed_password)
                )
                app.mysql.connection.commit()
                return jsonify({
                    'status': 'success',
                    'message': 'Administrator registered successfully'
                })
        except Exception as e:
            if app.mysql:
                app.mysql.connection.rollback()
            return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500
    
    @app.route('/api/admin/users', methods=['GET'])
    def get_users():
        print(f"DEBUG: app.mysql is None: {app.mysql is None}")
        print(f"DEBUG: app.sqlite_db is None: {app.sqlite_db is None}")
        print(f"DEBUG: Should enter development mode: {app.mysql is None and app.sqlite_db is None}")
        
        if app.mysql is None and app.sqlite_db is None:
            # Development mode - return mock data
            return jsonify({
                'status': 'success',
                'users': [
                    {'id': 1, 'fullname': 'Test User 1', 'email': 'test1@example.com', 'registration_date': '2024-01-01', 'status': 'active'},
                    {'id': 2, 'fullname': 'Test User 2', 'email': 'test2@example.com', 'registration_date': '2024-01-02', 'status': 'active'},
                    {'id': 3, 'fullname': 'Test User 3', 'email': 'test3@example.com', 'registration_date': '2024-01-03', 'status': 'inactive'}
                ],
                'note': 'Development mode - mock data'
            })
            
        try:
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute("SELECT id, fullname, email, registration_date, status FROM users")
                rows = cur.fetchall()
                users = [dict(row) for row in rows]
                return jsonify({
                    'status': 'success',
                    'users': users
                })

            with app.app_context():
                cur = app.mysql.connection.cursor()
                cur.execute("SELECT id, fullname, email, registration_date, status FROM users")
                users = cur.fetchall()
                
                return jsonify({
                    'status': 'success',
                    'users': users
                })
        except Exception as e:
            return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500

    @app.route('/api/admin/admins', methods=['GET'])
    def get_admins():
        if app.mysql is None and app.sqlite_db is None:
            return jsonify({
                'status': 'success',
                'admins': [
                    {
                        'id': 1,
                        'adminname': 'System Admin',
                        'adminemail': 'admin@vortex-agent.com',
                        'adminusername': 'sysadmin',
                        'registration_date': '2026-02-10 02:30 PM',
                        'role': 'super_admin',
                        'status': 'active'
                    },
                    {
                        'id': 2,
                        'adminname': 'Content Manager',
                        'adminemail': 'content@vortex-agent.com',
                        'adminusername': 'content_mgr',
                        'registration_date': '2026-02-08 11:45 AM',
                        'role': 'admin',
                        'status': 'active'
                    },
                    {
                        'id': 3,
                        'adminname': 'Support Manager',
                        'adminemail': 'support.mgr@vortex-agent.com',
                        'adminusername': 'support_mgr',
                        'registration_date': '2026-02-05 03:15 PM',
                        'role': 'moderator',
                        'status': 'active'
                    }
                ],
                'note': 'Development mode - mock data'
            })

        try:
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute("SELECT id, adminname, adminusername, adminemail, role FROM admins")
                rows = cur.fetchall()
                admins = []
                for row in rows:
                    item = dict(row)
                    item['registration_date'] = item.get('registration_date') or '—'
                    item['status'] = item.get('status') or 'active'
                    admins.append(item)

                return jsonify({'status': 'success', 'admins': admins})

            with app.app_context():
                cur = app.mysql.connection.cursor()
                cur.execute("SELECT id, adminname, adminusername, adminemail, role FROM admins")
                rows = cur.fetchall()
                admins = []
                for row in rows:
                    item = dict(row)
                    item['registration_date'] = item.get('registration_date') or '—'
                    item['status'] = item.get('status') or 'active'
                    admins.append(item)

                return jsonify({'status': 'success', 'admins': admins})
        except Exception as e:
            return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500

    @app.route('/api/admin/activity', methods=['GET'])
    def get_admin_activity():
        # For now we do not persist activity, so we return a dynamic feed based on current stats.
        # Later, you can back this with an activity_log table.
        if app.mysql is None and app.sqlite_db is None:
            return jsonify({
                'status': 'success',
                'items': [
                    {'icon': '✓', 'title': 'New User Registration', 'time': 'Recently'},
                    {'icon': '✓', 'title': 'Admin Login', 'time': 'Recently'},
                    {'icon': '⚠', 'title': 'High Traffic Alert', 'time': 'Recently'},
                    {'icon': '✓', 'title': 'Backup Completed', 'time': 'Recently'}
                ],
                'note': 'Development mode - mock data'
            })

        try:
            # Try to compute a few human-friendly activity items.
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()
                cur.execute("SELECT COUNT(*) as count FROM users")
                total_users = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) as count FROM users WHERE status = 'active'")
                active_users = cur.fetchone()[0]
            else:
                with app.app_context():
                    cur = app.mysql.connection.cursor()
                    cur.execute("SELECT COUNT(*) as count FROM users")
                    total_users = cur.fetchone()['count']

                    cur.execute("SELECT COUNT(*) as count FROM users WHERE status = 'active'")
                    active_users = cur.fetchone()['count']

            items = [
                {'icon': '✓', 'title': f'Total Users: {total_users}', 'time': 'Just now'},
                {'icon': '✓', 'title': f'Active Users: {active_users}', 'time': 'Just now'}
            ]

            if active_users > 0 and total_users > 0 and (active_users / total_users) < 0.5:
                items.append({'icon': '⚠', 'title': 'Low Active User Ratio', 'time': 'Just now'})
            else:
                items.append({'icon': '✓', 'title': 'System Operating Normally', 'time': 'Just now'})

            items.append({'icon': '✓', 'title': 'Backup Status: OK', 'time': 'Today'})

            return jsonify({'status': 'success', 'items': items})
        except Exception as e:
            return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500
    
    @app.route('/api/admin/dashboard/stats', methods=['GET'])
    def get_dashboard_stats():
        print(f"DEBUG: app.mysql is None: {app.mysql is None}")
        print(f"DEBUG: app.sqlite_db is None: {app.sqlite_db is None}")
        print(f"DEBUG: Should enter development mode: {app.mysql is None and app.sqlite_db is None}")
        
        if app.mysql is None and app.sqlite_db is None:
            # Development mode - return mock stats
            return jsonify({
                'status': 'success',
                'stats': {
                    'total_users': 150,
                    'active_users': 120,
                    'total_visits': 1000,
                    'unique_visitors': 800,
                    'new_signups_today': 5,
                    'active_sessions': 25,
                    'bounce_rate': '25%',
                    'avg_session_duration': '3m 45s',
                    'server_health': 85,
                    'uptime': 92,
                    'api_response': 78,
                    'traffic_organic': 45,
                    'traffic_direct': 25,
                    'traffic_referral': 20,
                    'traffic_social': 10,
                    'top_pages': [
                        {'path': '/', 'views': 75000, 'bounce_rate': '28%'},
                        {'path': '/backendoverviewpage', 'views': 45000, 'bounce_rate': '15%'}
                    ],
                    'performance_percent': 85,
                    'response_time': 145,
                    'downtime': '0.1%',
                    'total_revenue': 125000,
                    'avg_revenue_per_user': 12.50,
                    'profit_margin': '42.18%'
                },
                'note': 'Development mode - mock statistics'
            })
            
        try:
            if app.sqlite_db is not None:
                cur = app.sqlite_db.cursor()

                cur.execute("SELECT COUNT(*) as count FROM users")
                total_users = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) as count FROM users WHERE status = 'active'")
                active_users = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) as count FROM users")
                total_users = cur.fetchone()[0]

                if total_users <= 0:
                    user_activity_ratio = 0
                else:
                    user_activity_ratio = active_users / total_users

                # These metrics are not currently stored in DB; compute stable values that
                # still move as your real user counts change.
                total_visits = max(0, int(active_users * 60 + total_users * 15))
                unique_visitors = max(0, int(total_users * 1.2))
                new_signups_today = max(0, int(total_users * 0.01))
                active_sessions = max(0, int(active_users * 0.04))

                server_health = int(round(70 + user_activity_ratio * 25))
                uptime = int(round(85 + user_activity_ratio * 14))
                api_response = int(round(60 + user_activity_ratio * 35))

                traffic_organic = 45
                traffic_direct = 25
                traffic_referral = 20
                traffic_social = 10

                home_views = int(round(total_visits * 0.75))
                admin_views = int(round(total_visits * 0.45))

                performance_percent = int(round((server_health * 0.5) + (uptime * 0.3) + (api_response * 0.2)))
                response_time = max(50, int(round(250 - (api_response * 1.2))))
                downtime = f"{max(0.0, round((100 - uptime) / 1000, 2))}%"

                # Revenue metrics (until you add a real revenue table)
                avg_revenue_per_user = 12.50
                total_revenue = float(active_users) * avg_revenue_per_user * 30
                profit_margin = f"{round(35 + user_activity_ratio * 20, 2)}%"

                stats = {
                    'total_users': total_users,
                    'active_users': active_users,
                    'total_visits': total_visits,
                    'unique_visitors': unique_visitors,
                    'new_signups_today': new_signups_today,
                    'active_sessions': active_sessions,
                    'bounce_rate': '10%',
                    'avg_session_duration': '10s',
                    'server_health': server_health,
                    'uptime': uptime,
                    'api_response': api_response,
                    'traffic_organic': traffic_organic,
                    'traffic_direct': traffic_direct,
                    'traffic_referral': traffic_referral,
                    'traffic_social': traffic_social,
                    'top_pages': [
                        {'path': '/', 'views': home_views, 'bounce_rate': '28%'},
                        {'path': '/backendoverviewpage', 'views': admin_views, 'bounce_rate': '15%'}
                    ],
                    'performance_percent': performance_percent,
                    'response_time': response_time,
                    'downtime': downtime,
                    'total_revenue': total_revenue,
                    'avg_revenue_per_user': avg_revenue_per_user,
                    'profit_margin': profit_margin
                }

                return jsonify({
                    'status': 'success',
                    'stats': stats
                })

            with app.app_context():
                cur = app.mysql.connection.cursor()
                
                # Get total users
                cur.execute("SELECT COUNT(*) as count FROM users")
                total_users = cur.fetchone()['count']
                
                # Get active users
                cur.execute("SELECT COUNT(*) as count FROM users WHERE status = 'active'")
                active_users = cur.fetchone()['count']
                
                # Sample stats - in a real app, you'd calculate these from your data
                if total_users <= 0:
                    user_activity_ratio = 0
                else:
                    user_activity_ratio = active_users / total_users

                total_visits = max(0, int(active_users * 60 + total_users * 15))
                unique_visitors = max(0, int(total_users * 1.2))
                new_signups_today = max(0, int(total_users * 0.01))
                active_sessions = max(0, int(active_users * 0.04))

                server_health = int(round(70 + user_activity_ratio * 25))
                uptime = int(round(85 + user_activity_ratio * 14))
                api_response = int(round(60 + user_activity_ratio * 35))

                traffic_organic = 45
                traffic_direct = 25
                traffic_referral = 20
                traffic_social = 10

                home_views = int(round(total_visits * 0.75))
                admin_views = int(round(total_visits * 0.45))

                performance_percent = int(round((server_health * 0.5) + (uptime * 0.3) + (api_response * 0.2)))
                response_time = max(50, int(round(250 - (api_response * 1.2))))
                downtime = f"{max(0.0, round((100 - uptime) / 1000, 2))}%"

                avg_revenue_per_user = 12.50
                total_revenue = float(active_users) * avg_revenue_per_user * 30
                profit_margin = f"{round(35 + user_activity_ratio * 20, 2)}%"

                stats = {
                    'total_users': total_users,
                    'active_users': active_users,
                    'total_visits': total_visits,
                    'unique_visitors': unique_visitors,
                    'new_signups_today': new_signups_today,
                    'active_sessions': active_sessions,
                    'bounce_rate': '10%',
                    'avg_session_duration': '10s',
                    'server_health': server_health,
                    'uptime': uptime,
                    'api_response': api_response,
                    'traffic_organic': traffic_organic,
                    'traffic_direct': traffic_direct,
                    'traffic_referral': traffic_referral,
                    'traffic_social': traffic_social,
                    'top_pages': [
                        {'path': '/', 'views': home_views, 'bounce_rate': '28%'},
                        {'path': '/backendoverviewpage', 'views': admin_views, 'bounce_rate': '15%'}
                    ],
                    'performance_percent': performance_percent,
                    'response_time': response_time,
                    'downtime': downtime,
                    'total_revenue': total_revenue,
                    'avg_revenue_per_user': avg_revenue_per_user,
                    'profit_margin': profit_margin
                }
                
                return jsonify({
                    'status': 'success',
                    'stats': stats
                })
        except Exception as e:
            return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500
    
    @app.route('/api/admin/init-db', methods=['POST'])
    def init_database():
        try:
            from init_db import init_database as run_init
            run_init()
            return jsonify({
                'status': 'success',
                'message': 'Database initialized successfully'
            })
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Failed to initialize database: {str(e)}'
            }), 500
    
    @app.route('/api/logout', methods=['POST'])
    def logout():
        return jsonify({
            'status': 'success',
            'message': 'Logged out successfully'
        })
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)