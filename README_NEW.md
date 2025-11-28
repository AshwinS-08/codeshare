# CodeShare Application

## Overview
CodeShare is a secure, easy-to-use file and text sharing web application. It allows users to quickly share content via unique short codes without requiring signup. Shares auto-expire after 24 hours for security and cleanup.

## Features

### General
- End-to-end encrypted sharing of files and text snippets.
- No account or signup required for sharing content.
- Auto-expiration of shares after 24 hours.
- Responsive and modern UI.

### Pages and User Flows

#### Home / Index
- Entry point of the app at `/`.
- Provides a hero section with key benefits.
- Core sharing interface with two tabs:
  - **Share Content:** Upload files or paste text to create a share.
  - **Get Content:** Retrieve shared content by entering a code.
- Highlights features: Easy Sharing, Quick Access, Secure & Private.

#### ShareView
- Detail view for a specific share at `/share/:code`.
- Displays share metadata: code, views, expiry countdown.
- For text shares: shows content with copy-to-clipboard action.
- For file shares: shows file info, download button, and inline preview if supported.
- QR code generation for easy sharing.

#### HowItWorks
- Explains the app's three-step flow:
  1. Create a share (upload file or paste text).
  2. Share the code.
  3. Auto-expire securely after 24 hours.

#### Dashboard
- Private area for authenticated users at `/dashboard`.
- Displays user stats: total shares, total views.
- Lists active shares with options to preview, copy link, or download.
- Theme toggle (light/dark mode).
- Real-time notifications and analytics.

#### Login
- User authentication page.
- Supports login and signup with email and password.
- Redirects authenticated users to the dashboard.

#### NotFound
- Fallback page for unknown routes.
- Displays a 404 message and a button to return home.

#### Docs
- Documentation page explaining frontend pages, user flows, and backend API endpoints.
- Tabs for Pages, API, and Infrastructure documentation.

## Backend API Highlights (from Docs)
- Base & health endpoints: `/`, `/ping`, `/health`, `/storage/health`.
- Share endpoints:
  - `POST /api/shares`: Create a new share.
  - `GET /api/shares/<code>`: Retrieve share by code.
- User endpoints:
  - `GET /api/me/stats`: Get user stats.
  - `GET /api/me/shares`: List user shares.
- File fetch endpoint:
  - `GET /api/files/fetch?url=...`: Proxy download for files.

## Additional Notes
- Shares can include optional password protection.
- Files are uploaded to AWS S3 storage.
- The app uses Supabase for authentication and session management.
- Real-time updates and analytics are provided on the dashboard.

---

This README provides a detailed overview of the CodeShare app's features, pages, and backend API as referenced from the frontend source code.
