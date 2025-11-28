# 🔧 Backend Enhancement Plan

## Overview
This document outlines the backend changes needed to fully support the new premium features.

---

## 📋 Database Schema Updates

### 1. **Shares Table Enhancements**

Add new columns to the `shares` table:

```sql
-- Password protection
ALTER TABLE shares ADD COLUMN password_hash TEXT;
ALTER TABLE shares ADD COLUMN is_password_protected BOOLEAN DEFAULT FALSE;

-- Advanced expiry options
ALTER TABLE shares ADD COLUMN custom_expiry_hours INTEGER;
ALTER TABLE shares ADD COLUMN one_time_view BOOLEAN DEFAULT FALSE;
ALTER TABLE shares ADD COLUMN is_expired BOOLEAN DEFAULT FALSE;

-- Authentication requirement
ALTER TABLE shares ADD COLUMN require_auth BOOLEAN DEFAULT FALSE;

-- Analytics
ALTER TABLE shares ADD COLUMN last_viewed_at TIMESTAMP;
ALTER TABLE shares ADD COLUMN unique_viewers INTEGER DEFAULT 0;
ALTER TABLE shares ADD COLUMN download_count INTEGER DEFAULT 0;
```

### 2. **New Analytics Table**

Create a table to track detailed analytics:

```sql
CREATE TABLE share_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    share_id UUID REFERENCES shares(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW(),
    viewer_ip TEXT,
    viewer_country TEXT,
    viewer_city TEXT,
    user_agent TEXT,
    referrer TEXT,
    device_type TEXT, -- mobile, tablet, desktop
    browser TEXT,
    os TEXT
);

CREATE INDEX idx_share_analytics_share_id ON share_analytics(share_id);
CREATE INDEX idx_share_analytics_viewed_at ON share_analytics(viewed_at);
```

### 3. **Notifications Table**

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    share_id UUID REFERENCES shares(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'view', 'download', 'upload', 'share'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

---

## 🔌 New API Endpoints

### 1. **Password Protection**

```python
@application.route("/api/shares", methods=["POST"])
def create_share():
    # ... existing code ...
    
    # Add password hashing
    password = body.get("password")
    if password:
        from werkzeug.security import generate_password_hash
        payload["password_hash"] = generate_password_hash(password)
        payload["is_password_protected"] = True
    
    # Add advanced options
    payload["one_time_view"] = body.get("oneTimeView", False)
    payload["require_auth"] = body.get("requireAuth", False)
    payload["custom_expiry_hours"] = body.get("expiryHours")
    
    # ... rest of code ...
```

```python
@application.route("/api/shares/<code>/verify", methods=["POST"])
def verify_share_password(code: str):
    """Verify password for protected share."""
    body = request.get_json() or {}
    password = body.get("password")
    
    if not password:
        return jsonify({"error": "Password required"}), 400
    
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": "Server error"}), 500
    
    try:
        resp = client.table("shares").select("*").eq("code", code.upper()).limit(1).execute()
        data = getattr(resp, "data", [])
        
        if not data:
            return jsonify({"error": "Share not found"}), 404
        
        share = data[0]
        
        from werkzeug.security import check_password_hash
        if not check_password_hash(share["password_hash"], password):
            return jsonify({"error": "Invalid password"}), 401
        
        return jsonify({"verified": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

### 2. **Analytics Endpoints**

```python
@application.route("/api/shares/<code>/track-view", methods=["POST"])
def track_share_view(code: str):
    """Track detailed analytics for share view."""
    body = request.get_json() or {}
    
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": "Server error"}), 500
    
    try:
        # Get share ID
        resp = client.table("shares").select("id").eq("code", code.upper()).limit(1).execute()
        data = getattr(resp, "data", [])
        
        if not data:
            return jsonify({"error": "Share not found"}), 404
        
        share_id = data[0]["id"]
        
        # Extract analytics data
        import user_agents
        ua_string = request.headers.get("User-Agent", "")
        ua = user_agents.parse(ua_string)
        
        analytics_data = {
            "share_id": share_id,
            "viewer_ip": request.remote_addr,
            "user_agent": ua_string,
            "device_type": "mobile" if ua.is_mobile else "tablet" if ua.is_tablet else "desktop",
            "browser": ua.browser.family,
            "os": ua.os.family,
            "referrer": request.headers.get("Referer", "direct")
        }
        
        # Insert analytics record
        client.table("share_analytics").insert(analytics_data).execute()
        
        # Update share view count and last viewed
        client.table("shares").update({
            "view_count": client.table("shares").select("view_count").eq("id", share_id).execute().data[0]["view_count"] + 1,
            "last_viewed_at": "NOW()"
        }).eq("id", share_id).execute()
        
        return jsonify({"tracked": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

```python
@application.route("/api/analytics/overview", methods=["GET"])
def get_analytics_overview():
    """Get analytics overview for authenticated user."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401
    
    token = auth_header.split(" ", 1)[1].strip()
    
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": "Server error"}), 500
    
    try:
        # Get user ID
        uresp = client.auth.get_user(token)
        user_obj = getattr(uresp, "user", None) or getattr(uresp, "data", None)
        user_id = getattr(user_obj, "id", None) or user_obj.get("id")
        
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401
        
        # Get user's shares
        shares_resp = client.table("shares").select("id, view_count, created_at, content_type").eq("user_id", user_id).execute()
        shares = getattr(shares_resp, "data", [])
        
        # Calculate statistics
        total_shares = len(shares)
        total_views = sum(s.get("view_count", 0) for s in shares)
        avg_views = total_views / total_shares if total_shares > 0 else 0
        
        # Get views over time (last 7 days)
        from datetime import datetime, timedelta
        views_over_time = []
        for i in range(7):
            date = datetime.now() - timedelta(days=6-i)
            # Query analytics for that day
            # ... implementation ...
            views_over_time.append({
                "date": date.strftime("%a"),
                "views": 0  # Calculate from analytics table
            })
        
        # Get content type distribution
        content_types = {}
        for share in shares:
            ct = share.get("content_type", "other")
            content_types[ct] = content_types.get(ct, 0) + 1
        
        content_distribution = [
            {"name": k.capitalize(), "value": v}
            for k, v in content_types.items()
        ]
        
        # Get top shares
        top_shares = sorted(shares, key=lambda s: s.get("view_count", 0), reverse=True)[:5]
        
        return jsonify({
            "totalViews": total_views,
            "totalShares": total_shares,
            "avgViewsPerShare": round(avg_views, 1),
            "viewsOverTime": views_over_time,
            "contentTypeDistribution": content_distribution,
            "topShares": [
                {
                    "name": s.get("file_name", "Text Share"),
                    "views": s.get("view_count", 0),
                    "code": s.get("code")
                }
                for s in top_shares
            ]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

### 3. **Notifications Endpoints**

```python
@application.route("/api/notifications", methods=["GET"])
def get_notifications():
    """Get notifications for authenticated user."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401
    
    token = auth_header.split(" ", 1)[1].strip()
    
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": "Server error"}), 500
    
    try:
        # Get user ID
        uresp = client.auth.get_user(token)
        user_obj = getattr(uresp, "user", None) or getattr(uresp, "data", None)
        user_id = getattr(user_obj, "id", None) or user_obj.get("id")
        
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401
        
        # Get notifications
        resp = client.table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(50).execute()
        notifications = getattr(resp, "data", [])
        
        return jsonify({"notifications": notifications}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

```python
@application.route("/api/notifications/<notification_id>/read", methods=["POST"])
def mark_notification_read(notification_id: str):
    """Mark notification as read."""
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": "Server error"}), 500
    
    try:
        client.table("notifications").update({"read": True}).eq("id", notification_id).execute()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

---

## 🔔 Real-Time Features (Optional)

### WebSocket Integration

For real-time notifications, consider implementing WebSocket support:

```python
from flask_socketio import SocketIO, emit, join_room

socketio = SocketIO(application, cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    print('Client connected')

@socketio.on('join')
def handle_join(data):
    """Join user's notification room."""
    user_id = data.get('user_id')
    if user_id:
        join_room(f"user_{user_id}")

def send_notification(user_id, notification_data):
    """Send real-time notification to user."""
    socketio.emit('notification', notification_data, room=f"user_{user_id}")
```

---

## 📊 Analytics Processing

### Background Job for Analytics

Create a background job to process analytics data:

```python
from apscheduler.schedulers.background import BackgroundScheduler

def process_analytics():
    """Process and aggregate analytics data."""
    # Calculate daily statistics
    # Update trending shares
    # Clean old analytics data
    pass

scheduler = BackgroundScheduler()
scheduler.add_job(process_analytics, 'interval', hours=1)
scheduler.start()
```

---

## 🔐 Security Enhancements

### Rate Limiting

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    application,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@application.route("/api/shares/<code>", methods=["GET"])
@limiter.limit("10 per minute")
def get_share(code: str):
    # ... existing code ...
```

### IP Geolocation

```python
import geoip2.database

def get_location_from_ip(ip_address):
    """Get country and city from IP address."""
    try:
        reader = geoip2.database.Reader('GeoLite2-City.mmdb')
        response = reader.city(ip_address)
        return {
            "country": response.country.name,
            "city": response.city.name
        }
    except:
        return {"country": "Unknown", "city": "Unknown"}
```

---

## 📦 Required Dependencies

Add to `requirements.txt`:

```
flask-socketio==5.3.4
python-socketio==5.9.0
apscheduler==3.10.4
flask-limiter==3.5.0
user-agents==2.2.0
geoip2==4.7.0
werkzeug==3.0.0
```

---

## 🚀 Deployment Considerations

1. **Database Migrations**: Run all schema updates in production
2. **Environment Variables**: Add new config for WebSocket, GeoIP, etc.
3. **Background Jobs**: Set up scheduler in production environment
4. **Rate Limiting**: Configure Redis for distributed rate limiting
5. **WebSocket**: Ensure WebSocket support in deployment platform

---

## 📝 Implementation Priority

### Phase 1 (High Priority)
- ✅ Password protection
- ✅ Advanced expiry options
- ✅ Basic analytics tracking

### Phase 2 (Medium Priority)
- ✅ Detailed analytics dashboard
- ✅ Notifications system
- ✅ One-time view links

### Phase 3 (Low Priority)
- ✅ Real-time WebSocket notifications
- ✅ Geographic analytics
- ✅ Advanced rate limiting

---

## 🎯 Testing Checklist

- [ ] Password protection works correctly
- [ ] One-time view deletes share after viewing
- [ ] Analytics data is tracked accurately
- [ ] Notifications are created for all events
- [ ] Rate limiting prevents abuse
- [ ] WebSocket connections are stable
- [ ] Geographic data is accurate

---

## 📚 Additional Resources

- Flask-SocketIO Documentation: https://flask-socketio.readthedocs.io/
- APScheduler Documentation: https://apscheduler.readthedocs.io/
- GeoIP2 Documentation: https://geoip2.readthedocs.io/
- Flask-Limiter Documentation: https://flask-limiter.readthedocs.io/

---

**Note**: This is a comprehensive plan. Implement features incrementally and test thoroughly before deploying to production.
