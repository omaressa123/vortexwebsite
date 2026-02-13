# Vortex Agent - API Documentation

## 🔌 API Overview

Complete REST API documentation for Vortex Agent backend integration.

**Base URL**: `https://api.vortex-agent.autocoder.cc/api`
**Version**: `v1`
**Authentication**: Bearer Token (JWT)

---

## 📋 Authentication

### Login Endpoint
**POST** `/api/login`

```json
Request {
  "username": "string",
  "password": "string"
}

Response {
  "status": "success",
  "user_id": "string",
  "username": "string",
  "token": "jwt_token_here",
  "expires_in": 3600,
  "type": "admin|user"
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials
- `429` - Too many login attempts

---

### Logout Endpoint
**POST** `/api/logout`

**Headers:**
```
Authorization: Bearer <token>
```

```json
Response {
  "status": "success",
  "message": "Logged out successfully"
}
```

**Status Codes:**
- `200` - Logout successful
- `401` - Unauthorized

---

## 👤 User Management

### Register User
**POST** `/api/register-user`

```json
Request {
  "fullname": "string",
  "email": "string",
  "password": "string",
  "confirm_password": "string"
}

Response {
  "status": "success",
  "user_id": "string",
  "email": "string",
  "message": "Registration successful. Please verify your email."
}
```

**Validation Rules:**
- Email must be unique
- Password minimum 6 characters
- Confirm password must match

**Status Codes:**
- `201` - User created
- `400` - Validation failed
- `409` - Email already exists

---

### Get User Profile
**GET** `/api/users/{user_id}`

**Headers:**
```
Authorization: Bearer <token>
```

```json
Response {
  "user_id": "string",
  "fullname": "string",
  "email": "string",
  "registration_date": "2026-02-12",
  "last_login": "2026-02-12T10:30:00Z",
  "status": "active|inactive",
  "profile_complete": boolean
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - User not found

---

### Update User Profile
**PUT** `/api/users/{user_id}`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

```json
Request {
  "fullname": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "country": "string"
}

Response {
  "status": "success",
  "message": "Profile updated successfully",
  "user": { ... }
}
```

**Status Codes:**
- `200` - Updated
- `400` - Validation failed
- `401` - Unauthorized

---

### Delete User Account
**DELETE** `/api/users/{user_id}`

**Headers:**
```
Authorization: Bearer <token>
```

```json
Response {
  "status": "success",
  "message": "Account deleted successfully"
}
```

**Status Codes:**
- `200` - Deleted
- `401` - Unauthorized
- `404` - User not found

---

## 👨‍💼 Administrator Management

### Register Administrator
**POST** `/api/register-admin`

```json
Request {
  "adminname": "string",
  "adminusername": "string",
  "adminemail": "string",
  "password": "string",
  "confirm_password": "string",
  "role": "super_admin|admin|moderator"
}

Response {
  "status": "success",
  "admin_id": "string",
  "adminusername": "string",
  "message": "Administrator registered successfully"
}
```

**Validation Rules:**
- Username must be unique
- Email must be unique
- Password minimum 8 characters
- Role must be valid

**Status Codes:**
- `201` - Admin created
- `400` - Validation failed
- `409` - Username or email already exists

---

### Admin Login
**POST** `/api/admin/login`

```json
Request {
  "username": "string",
  "password": "string",
  "mfa_code": "string" // optional
}

Response {
  "status": "success",
  "admin_id": "string",
  "username": "string",
  "role": "string",
  "token": "jwt_token",
  "expires_in": 3600,
  "permissions": ["string"]
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials
- `403` - MFA required

---

### List All Users (Admin Only)
**GET** `/api/admin/users`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status (active|inactive|pending)
- `sort` - Sort by field (registration_date|last_login)

```json
Response {
  "status": "success",
  "total": 10000,
  "page": 1,
  "limit": 20,
  "users": [
    {
      "user_id": "string",
      "fullname": "string",
      "email": "string",
      "registration_date": "2026-02-12",
      "last_login": "2026-02-12T10:30:00Z",
      "status": "active"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Insufficient permissions

---

### Get User by ID (Admin Only)
**GET** `/api/admin/users/{user_id}`

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - User not found

---

### Suspend User (Admin Only)
**POST** `/api/admin/users/{user_id}/suspend`

```json
Request {
  "reason": "string",
  "duration": "number" // in days, 0 = permanent
}

Response {
  "status": "success",
  "message": "User suspended successfully",
  "suspend_until": "2026-02-15T00:00:00Z"
}
```

---

## 📊 Analytics & Dashboard

### Get Dashboard Stats (Admin Only)
**GET** `/api/admin/dashboard/stats`

**Headers:**
```
Authorization: Bearer <admin_token>
```

```json
Response {
  "status": "success",
  "stats": {
    "total_users": 10000,
    "active_users": 8500,
    "total_visits": 150000,
    "unique_visitors": 45000,
    "new_signups_today": 250,
    "active_sessions": 3500,
    "bounce_rate": "32.5%",
    "avg_session_duration": "5m 30s"
  }
}
```

---

### Get Traffic Analytics
**GET** `/api/admin/analytics/traffic`

**Query Parameters:**
- `period` - day|week|month|year
- `start_date` - ISO 8601 date
- `end_date` - ISO 8601 date

```json
Response {
  "status": "success",
  "period": "month",
  "data": {
    "page_views": 150000,
    "unique_visitors": 45000,
    "bounce_rate": "32.5%",
    "avg_time_on_site": "5m 30s",
    "conversion_rate": "8.5%",
    "traffic_sources": [
      {
        "source": "organic",
        "percentage": 45,
        "visits": 67500
      }
    ]
  }
}
```

---

### Get User Activity
**GET** `/api/admin/analytics/user-activity`

```json
Response {
  "status": "success",
  "activity": [
    {
      "user_id": "string",
      "action": "login|logout|update_profile|delete_account",
      "timestamp": "2026-02-12T10:30:00Z",
      "ip_address": "string"
    }
  ]
}
```

---

## 🔐 Password Management

### Request Password Reset
**POST** `/api/password/reset-request`

```json
Request {
  "email": "string"
}

Response {
  "status": "success",
  "message": "Password reset email sent"
}
```

---

### Reset Password with Token
**POST** `/api/password/reset`

```json
Request {
  "token": "string",
  "new_password": "string",
  "confirm_password": "string"
}

Response {
  "status": "success",
  "message": "Password reset successfully"
}
```

---

### Change Password (Authenticated)
**POST** `/api/users/{user_id}/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

```json
Request {
  "current_password": "string",
  "new_password": "string",
  "confirm_password": "string"
}

Response {
  "status": "success",
  "message": "Password changed successfully"
}
```

---

## ✉️ Email Verification

### Send Verification Email
**POST** `/api/email/send-verification`

**Headers:**
```
Authorization: Bearer <token>
```

```json
Response {
  "status": "success",
  "message": "Verification email sent"
}
```

---

### Verify Email
**POST** `/api/email/verify`

```json
Request {
  "token": "string"
}

Response {
  "status": "success",
  "message": "Email verified successfully"
}
```

---

## 🎯 Error Handling

### Error Response Format

```json
{
  "status": "error",
  "error_code": "001",
  "message": "Invalid credentials",
  "details": "The username or password is incorrect"
}
```

### Common Error Codes

| Code | Message | HTTP Status |
|------|---------|-------------|
| 001 | Invalid credentials | 401 |
| 002 | User not found | 404 |
| 003 | Email already registered | 409 |
| 004 | Username already taken | 409 |
| 005 | Password too weak | 400 |
| 006 | Email verification failed | 400 |
| 007 | Session expired | 401 |
| 008 | Unauthorized access | 403 |
| 009 | Rate limit exceeded | 429 |
| 010 | Server error | 500 |

---

## 🔄 Rate Limiting

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1644594000
```

### Rate Limits by Endpoint

- Login: 5 attempts per 15 minutes
- Registration: 10 per hour per IP
- Password Reset: 3 per 24 hours
- General API: 1000 per hour per user

---

## 📎 Request/Response Examples

### Complete Login Flow Example

**Request:**
```bash
curl -X POST https://api.vortex-agent.autocoder.cc/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePassword123"
  }'
```

**Response:**
```json
{
  "status": "success",
  "user_id": "usr_12345",
  "username": "john_doe",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "type": "admin"
}
```

---

### Complete Registration Flow Example

**Request:**
```bash
curl -X POST https://api.vortex-agent.autocoder.cc/api/register-user \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "confirm_password": "SecurePassword123"
  }'
```

**Response:**
```json
{
  "status": "success",
  "user_id": "usr_12345",
  "email": "john@example.com",
  "message": "Registration successful. Please verify your email."
}
```

---

## 🔐 Authentication Details

### JWT Token Structure

```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "user_id": "string",
  "username": "string",
  "email": "string",
  "role": "user|admin",
  "permissions": ["array"],
  "iat": 1644590400,
  "exp": 1644594000
}
```

### Token Usage

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📞 Support

For API support, contact: support@website.com

---

**Last Updated**: February 12, 2026
**API Version**: v1.0.0
