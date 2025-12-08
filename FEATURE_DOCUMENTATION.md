# API Sharing App - Feature Documentation

## Overview
This document provides comprehensive documentation for the API Sharing Application, a modern web-based platform for secure file and text sharing with advanced features including password protection, real-time analytics, and user authentication.

---

## Table of Contents
1. [Core Features](#core-features)
2. [Security Features](#security-features)
3. [User Interface Components](#user-interface-components)
4. [Backend Architecture](#backend-architecture)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Usage Guide](#usage-guide)

---

## Core Features

### 1. Multi-Format Content Sharing

The application supports three types of content sharing:

#### **Text Sharing**
- Plain text content sharing
- Syntax-highlighted code snippets
- Markdown support
- Character and line count tracking

#### **File Sharing**
- Support for files up to 10MB
- Automatic file type detection
- Preview support for images, PDFs, and text files
- Secure file storage in AWS S3/Supabase Storage

#### **Code Sharing**
- Integrated Monaco Editor with 14+ language support
- Syntax highlighting
- File naming and language selection
- Code preview and download capabilities

**Supported Languages:**
- JavaScript, TypeScript
- Python, Java, C++, C#
- Go, Rust, Ruby, PHP
- HTML, CSS, JSON, Markdown

---

## Security Features

### 1. Password Protection 🔐

**Overview:**
Shares can be protected with a custom password, ensuring only authorized users can access the content.

**Implementation:**
- **Frontend Components:**
  - `Share.tsx`: Password input with visibility toggle
  - `ShareView.tsx`: Password unlock interface
  
- **Backend Security:**
  - Passwords are hashed using `werkzeug.security.generate_password_hash`
  - Hash verification with `check_password_hash`
  - Stored in `password_hash` column in database
  
- **User Experience:**
  - Password visibility toggle (Eye/EyeOff icon)
  - Enter key support for quick unlock
  - Clear error messages for incorrect passwords
  - Locked state indicator

**Database Fields:**
```sql
is_protected BOOLEAN DEFAULT FALSE
password_hash TEXT
```

**API Flow:**
1. User creates share with password
2. Backend hashes password and stores hash
3. Share is marked as `is_protected = true`
4. On access, user provides password
5. Backend verifies hash match
6. Content is revealed on successful authentication

**Code Example:**
```python
# Creating a protected share
from werkzeug.security import generate_password_hash

password_hash = generate_password_hash(raw_password)
payload = {
    "is_protected": True,
    "password_hash": password_hash,
    # ... other fields
}
```

```python
# Verifying password on access
from werkzeug.security import check_password_hash

if is_protected:
    if not check_password_hash(stored_hash, requested_password):
        return jsonify({"error": "Incorrect password", "locked": True}), 403
```

### 2. User Authentication

**Features:**
- Email/password signup and login
- JWT-based session management
- Supabase Auth integration
- Automatic token refresh
- Secure logout

**User Benefits:**
- Track all created shares
- View analytics and statistics
- Manage share history
- Access dashboard features

### 3. Automatic Expiration

**Default Expiration:**
- Shares expire after 24 hours by default
- Configurable expiration times
- Automatic cleanup of expired content

---

## User Interface Components

### 1. Share Creation Interface

**Location:** `frontend/src/components/Share.tsx`

**Features:**
- Tabbed interface (Text, Code, File)
- Drag-and-drop file upload
- Password protection checkbox
- Password visibility toggle
- Real-time file size validation
- Upload progress indication

**UI Elements:**
```tsx
<Tabs>
  <TabsList>
    <TabsTrigger value="text">Text</TabsTrigger>
    <TabsTrigger value="code">Code</TabsTrigger>
    <TabsTrigger value="file">File</TabsTrigger>
  </TabsList>
</Tabs>

{/* Password Protection */}
<div className="relative">
  <Input 
    type={showPassword ? "text" : "password"}
    placeholder="Enter a password"
  />
  <button onClick={() => setShowPassword(!showPassword)}>
    {showPassword ? <EyeOff /> : <Eye />}
  </button>
</div>
```

### 2. Share View Interface

**Location:** `frontend/src/pages/ShareView.tsx`

**Features:**
- Password unlock screen for protected shares
- File preview (images, PDFs, text)
- Download functionality
- QR code generation
- Share statistics display
- Copy share link button

**Layout:**
- Main content area (left)
- Sidebar with actions (right)
- Statistics cards
- Security information

### 3. Dashboard

**Location:** `frontend/src/pages/Dashboard.tsx`

**Features:**
- User statistics overview
- Recent shares list
- Analytics charts
- Activity feed
- Theme toggle
- Notification center

**Statistics Displayed:**
- Total shares created
- Total views across all shares
- Average views per share
- Recent activity timeline

---

## Backend Architecture

### Technology Stack

**Framework:** Flask (Python)
**Database:** Supabase (PostgreSQL)
**Storage:** Supabase Storage / AWS S3
**Authentication:** Supabase Auth

### Key Components

#### 1. Application Setup
```python
from flask import Flask
from flask_cors import CORS

application = Flask(__name__)
CORS(application, supports_credentials=True)
```

#### 2. Supabase Client
```python
from supabase_client import create_client

client, err = create_client()
```

#### 3. File Upload Handler
```python
@application.route("/api/shares", methods=["POST"])
def create_share():
    # Handle multipart/form-data or JSON
    # Upload file to storage
    # Create database record
    # Return share code
```

---

## Database Schema

### Shares Table

```sql
CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(6) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    content_type VARCHAR(10) NOT NULL, -- 'text' or 'file'
    text_content TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    file_url TEXT,
    is_protected BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    language VARCHAR(50),
    metadata JSONB,
    view_count INTEGER DEFAULT 0,
    max_views INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
    CONSTRAINT check_content CHECK (
        (content_type = 'text' AND text_content IS NOT NULL) OR
        (content_type = 'file' AND file_name IS NOT NULL)
    )
);
```

### Indexes
```sql
CREATE INDEX idx_shares_code ON shares(code);
CREATE INDEX idx_shares_user_id ON shares(user_id);
CREATE INDEX idx_shares_created_at ON shares(created_at DESC);
CREATE INDEX idx_shares_expires_at ON shares(expires_at);
```

---

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

#### POST `/api/auth/login`
Login with existing credentials.

#### POST `/api/auth/logout`
Invalidate current session.

#### GET `/api/auth/user`
Get current authenticated user details.

### Shares

#### POST `/api/shares`
Create a new share.

**Request (multipart/form-data):**
```
file: [File]
text: "Optional text content"
password: "optional_password"
metadata: '{"language": "javascript", "fileName": "script.js"}'
```

**Response:**
```json
{
  "code": "ABC123",
  "content_type": "file",
  "file_url": "https://...",
  "file_name": "document.pdf",
  "file_size": 1024000,
  "is_protected": true
}
```

#### GET `/api/shares/:code`
Retrieve a share by code.

**Query Parameters:**
- `password` (optional): Password for protected shares

**Response (Success):**
```json
{
  "id": "uuid",
  "code": "ABC123",
  "content_type": "text",
  "text_content": "Hello World",
  "created_at": "2025-12-08T10:00:00Z",
  "expires_at": "2025-12-09T10:00:00Z",
  "view_count": 5,
  "locked": false
}
```

**Response (Password Required):**
```json
{
  "error": "Password required or incorrect",
  "locked": true
}
```

### User Data

#### GET `/api/me/stats`
Get user statistics.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "total_shares": 15,
  "total_views": 234
}
```

#### GET `/api/me/shares`
Get all shares created by authenticated user.

**Response:**
```json
{
  "shares": [
    {
      "code": "ABC123",
      "content_type": "file",
      "file_name": "document.pdf",
      "file_size": 1024000,
      "created_at": "2025-12-08T10:00:00Z",
      "view_count": 5
    }
  ]
}
```

### File Operations

#### GET `/api/files/fetch`
Fetch a file via backend proxy.

**Query Parameters:**
- `url`: File URL or proxy path

**Response:** Binary file data

---

## Usage Guide

### Creating a Password-Protected Share

1. **Navigate to Share Page**
2. **Select Content Type:**
   - Text: Enter text in textarea
   - Code: Use Monaco editor
   - File: Drag-and-drop or browse

3. **Enable Password Protection:**
   - Check "Password Protect" checkbox
   - Enter a secure password
   - Use eye icon to verify password

4. **Generate Share:**
   - Click "Generate Share Link"
   - Copy the generated code
   - Share with intended recipients

### Accessing a Protected Share

1. **Open Share Link**
2. **Enter Password:**
   - Type password in input field
   - Use eye icon to view password
   - Press Enter or click "Unlock"

3. **View Content:**
   - Download files
   - Copy text
   - View statistics

### Managing Shares (Authenticated Users)

1. **Login to Dashboard**
2. **View Statistics:**
   - Total shares
   - Total views
   - Recent activity

3. **Manage Shares:**
   - View all created shares
   - Check view counts
   - Monitor expiration times

---

## Real-Time Analytics & Activity

### Overview
The application provides real-time tracking of share views and user activity.

### Features

#### 1. View Count Tracking
- Automatic increment on each share access
- Displayed on ShareView page
- Aggregated in user dashboard

#### 2. Activity Feed
- Recent share creations
- View notifications
- Download events
- Time-stamped activities

#### 3. Analytics Dashboard
- Views over time (line chart)
- Content type distribution (pie chart)
- Top performing shares (bar chart)
- Weekly/monthly trends

### Implementation

**View Count Increment:**
```sql
-- Triggered on share access
UPDATE shares 
SET view_count = view_count + 1 
WHERE code = 'ABC123';
```

**Real-Time Updates:**
- WebSocket connections for live updates
- Polling for dashboard statistics
- Event-driven notifications

---

## Best Practices

### Security
1. Always use HTTPS in production
2. Implement rate limiting on API endpoints
3. Validate file types and sizes
4. Sanitize user inputs
5. Use strong password hashing (bcrypt/argon2)

### Performance
1. Enable CDN for static assets
2. Implement caching strategies
3. Optimize database queries with indexes
4. Use lazy loading for large files
5. Compress responses (gzip)

### User Experience
1. Provide clear error messages
2. Show loading states
3. Enable keyboard shortcuts
4. Implement responsive design
5. Add accessibility features (ARIA labels)

---

## Future Enhancements

### Planned Features
1. **Share Collections:** Group related shares
2. **Collaborative Editing:** Real-time code collaboration
3. **Version History:** Track share modifications
4. **Custom Expiration:** User-defined expiry times
5. **Share Templates:** Pre-configured share settings
6. **Advanced Analytics:** Geographic tracking, device stats
7. **Mobile App:** Native iOS/Android applications
8. **API Webhooks:** Notify external services on events

---

## Troubleshooting

### Common Issues

**Issue:** Password-protected share won't unlock
- **Solution:** Verify password is correct, check for typos, ensure caps lock is off

**Issue:** File upload fails
- **Solution:** Check file size (<10MB), verify file type, check network connection

**Issue:** Share not found (404)
- **Solution:** Verify share code, check if share has expired

**Issue:** Dashboard not loading
- **Solution:** Ensure user is logged in, check authentication token validity

---

## Support & Documentation

For additional help:
- Check the README.md file
- Review HOW_SHARING_WORKS.md
- See NEW_FEATURES.md for latest updates
- Contact support team

---

**Last Updated:** December 8, 2025
**Version:** 2.0.0
**Author:** API Sharing App Team
