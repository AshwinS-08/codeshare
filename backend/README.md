# Backend API for Code Sharing Application

A secure, scalable Flask API backend for the code-sharing application with Supabase integration.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── config.py            # Configuration settings
│   ├── models/
│   │   ├── __init__.py
│   │   └── share.py         # Share data models
│   ├── api/
│   │   ├── __init__.py
│   │   ├── shares.py        # Share endpoints
│   │   └── files.py         # File upload endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── supabase_service.py  # Supabase integration
│   │   └── share_service.py     # Business logic
│   └── utils/
│       ├── __init__.py
│       ├── validators.py    # Input validation
│       └── helpers.py       # Utility functions
├── application.py           # Entry point for Elastic Beanstalk
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
└── README.md               # This file
```

## Features

- ✅ Text and file sharing with generated codes
- ✅ Secure Supabase integration
- ✅ File upload to Supabase Storage
- ✅ Expiry and view limit management
- ✅ RESTful API design
- ✅ Input validation and error handling
- ✅ CORS support for frontend integration

## API Endpoints

### Shares
- `POST /api/shares` - Create new share (text or file)
- `GET /api/shares/{code}` - Retrieve share by code
- `GET /api/shares/{id}/stats` - Get share statistics

### Files
- `POST /api/files/upload` - Upload file to storage
- `GET /api/files/{filename}` - Get file download URL

### Health
- `GET /ping` - Health check
- `GET /health` - Detailed health status
- `GET /version` - API version info

## Environment Variables

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
FLASK_ENV=production
SECRET_KEY=your_secret_key
```

## Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env

# Run development server
python application.py
```

## Deployment

This backend is configured for AWS Elastic Beanstalk deployment with the existing GitHub Actions workflow.