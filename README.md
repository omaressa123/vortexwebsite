# Vortex Agent - Complete Website Clone

This is a complete reproduction of the Vortex Agent website including frontend, backend, and data structure.

## � Quick Start

### Prerequisites
- Python 3.8+
- MySQL 8.0+
- Flask and required packages (see requirements.txt)

### Database Setup

1. **Install MySQL Server**
   ```bash
   # On Windows with MySQL Installer
   # Download from https://dev.mysql.com/downloads/mysql/
   # Install and note your root password
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE vortex_agent_db;
   ```

3. **Configure Environment**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Edit .env with your credentials
   SECRET_KEY=your-secure-secret-key
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your-mysql-password
   MYSQL_DB=vortex_agent_db
   ```

4. **Initialize Database Tables**
   ```bash
   python init_db.py
   ```

5. **Run Application**
   ```bash
   python run_server.py
   ```

## �📁 File Structure

```
├── index.html                 # Main homepage
├── registrationpage.html      # User registration page (disabled)
├── backendoverviewpage.html   # Admin login portal
├── backendregisterpage.html   # Admin registration page (disabled)
├── style.css                  # Main stylesheet with responsive design
├── script.js                  # JavaScript functionality and form handlers
├── data.json                  # Complete site data and configuration
└── README.md                  # This file
```

## 🌐 Pages

### 1. Homepage (index.html)
- **URL**: `/`
- **Content**: 
  - Hero section with main CTA
  - Features showcase
  - Navigation and footer
  - 10,000+ users trust statement

### 2. User Registration (registrationpage.html)
- **URL**: `/registrationpage/` (currently disabled)
- **Fields**: Full Name, Email, Password, Confirm Password
- **Functionality**: User account creation with validation

### 3. Admin Portal (backendoverviewpage.html)
- **URL**: `/backendoverviewpage/`
- **Content**: Secure gateway for system management
- **Fields**: Username, Password
- **Functionality**: Admin login with validation

### 4. Admin Registration (backendregisterpage.html)
- **URL**: `/backendregisterpage/` (currently disabled)
- **Fields**: Admin Name, Email, Username, Password, Confirm Password
- **Functionality**: Administrator account creation

## 🎨 Design Features

- **Color Scheme**: 
  - Primary: #6366f1 (Indigo)
  - Secondary: #4f46e5 (Indigo Dark)
  - Accent: #818cf8 (Light Indigo)

- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional interface
- **Smooth Animations**: CSS animations and transitions
- **Interactive Forms**: Real-time validation

## ✨ Features

### Frontend
- Responsive navigation bar
- Hero section with gradient background
- Features grid layout
- Professional forms with validation
- Sticky navigation
- Smooth scrolling
- Mobile-optimized design

### Backend (JavaScript)
- Form validation (email, password strength)
- localStorage integration for data persistence
- Notification system
- Event delegation
- User authentication simulation

### Data (JSON)
- Complete site configuration
- Page structure and content
- Navigation menu items
- Form field definitions
- Branding guidelines
- Social media links
- Color palette

## 🚀 Getting Started

### Frontend Only (Static Files)
1. **Start a local server** (Python):
   ```bash
   python -m http.server 8000
   ```

2. **Or use Node.js (http-server)**:
   ```bash
   npx http-server
   ```

3. **Access the site**:
   - Homepage: `http://localhost:8000`
   - Admin Portal: `http://localhost:8000/backendoverviewpage.html`
   - User Registration: `http://localhost:8000/registrationpage.html` (currently disabled)

### Full Backend Setup (Flask + MySQL)
1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up MySQL database**:
   - Install and start MySQL server
   - Update `.env` file with your MySQL credentials

3. **Initialize the database**:
   ```bash
   python init_db.py
   ```

4. **Run the Flask application**:
   ```bash
   python run_server.py
   ```

5. **Access the site**:
   - Homepage: `http://localhost:5000`
   - API endpoints available at `http://localhost:5000/api/...`

## 📋 Form Validation

### User Registration
- Full Name: Required
- Email: Valid email format required
- Password: Minimum 6 characters
- Confirm Password: Must match password

### Admin Login
- Username: Required
- Password: Minimum 6 characters

### Admin Registration
- Admin Name: Required
- Email: Valid email format required
- Username: Minimum 4 characters
- Password: Minimum 8 characters (admin strength)
- Confirm Password: Must match password

## 💾 Local Storage

The website uses browser localStorage to persist user data:

- `adminUser`: Stores logged-in admin information
- `userAccount`: Stores registered user information
- `adminAccount`: Stores admin account information

## 🎯 Functionality

### Notifications
- Success notifications (green)
- Error notifications (red)
- Info notifications (blue)
- Auto-dismiss after 3 seconds

### Form Submissions
- Email validation using regex
- Password strength checking
- Matching password verification
- Simulated processing delays

### Navigation
- Smooth scrolling to sections
- Sticky header navigation
- Responsive mobile menu
- Active link indicators

## 🔒 Security

- Client-side form validation
- Password strength requirements for admin (8+ chars)
- Email format validation
- Secure password fields
- No sensitive data in localStorage (demo purposes only)

## 📱 Responsive Breakpoints

- Desktop: 1200px+
- Tablet: 769px - 1199px
- Mobile: Below 768px
- Small Mobile: Below 480px

## 🎨 CSS Features

- CSS Variables for theming
- Flexbox and Grid layouts
- Smooth transitions and animations
- Box shadows for depth
- Gradient backgrounds
- Hover effects and interactions

## 📝 Data Structure (data.json)

The JSON file contains:
- Site metadata
- Page definitions with content
- Navigation menus
- Form field definitions
- Color scheme
- Branding information
- Social media links

## 🔗 Links

- GitHub: https://github.com/
- LinkedIn: https://linkedin.com/
- Twitter: https://twitter.com/
- Support: support@website.com

## © Copyright

© 2026 Vortex Agent. All rights reserved.

---

## 📞 Support

For support, contact: support@website.com

## 🚀 Deployment

To deploy this website:

1. **Static Hosting** (Netlify, Vercel, GitHub Pages):
   - Upload all HTML, CSS, and JS files
   - No server-side processing needed

2. **Traditional Server** (Apache, Nginx):
   - Configure URL rewriting for clean URLs
   - Serve index.html for directory requests

3. **Backend Integration**:
   - Update form handlers in script.js
   - Connect to your API endpoint
   - Implement server-side validation
   - Add database integration

## 🎓 Customization

To customize:

1. **Colors**: Edit `:root` variables in style.css
2. **Content**: Update text in HTML files or data.json
3. **Branding**: Change logo text in navigation
4. **Features**: Add new sections by copying feature-card divs

---

Created: February 2026
