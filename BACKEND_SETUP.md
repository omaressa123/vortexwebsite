# Vortex Agent - Flask Backend with MySQL

This project implements a Flask backend with MySQL database for the Vortex Agent website.

## Setup Instructions

### Prerequisites
- Python 3.7+
- MySQL Server
- pip (Python package manager)

### Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up MySQL database:**
   - Install and start MySQL server
   - Update the `.env` file with your MySQL credentials:
     ```
     MYSQL_HOST=localhost
     MYSQL_USER=your_mysql_username
     MYSQL_PASSWORD=your_mysql_password
     MYSQL_DB=vortex_agent_db
     ```

3. **Initialize the database:**
   ```bash
   python init_db.py
   ```

4. **Run the application:**
   ```bash
   python run_server.py
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:
```
SECRET_KEY=your-secret-key-here
MYSQL_HOST=localhost
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB=vortex_agent_db
```

### API Endpoints

The backend provides the following API endpoints:

- `POST /api/login` - User/admin login
- `POST /api/register-user` - Register new user
- `POST /api/register-admin` - Register new admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/dashboard/stats` - Get dashboard statistics (admin only)
- `POST /api/logout` - User logout

### Database Schema

The application creates three tables:
- `users` - Stores user information
- `admins` - Stores administrator information
- `analytics` - Stores user activity analytics

## Deployment

For production deployment:
1. Change `debug=False` in run_server.py
2. Use a production WSGI server like Gunicorn
3. Set up a reverse proxy with Nginx
4. Use environment variables for configuration
5. Implement proper logging

## Security Notes

- Change the default SECRET_KEY in production
- Use strong passwords for MySQL
- Implement rate limiting
- Add input validation
- Use HTTPS in production