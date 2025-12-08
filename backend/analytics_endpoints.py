"""
Analytics and Activity API Endpoints
Add these endpoints to application.py after the /api/me/shares endpoint
"""

@application.route("/api/me/analytics", methods=["GET"])
def get_my_analytics():
    """Return detailed analytics data for the authenticated user."""
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": err or "Failed to create Supabase client"}), 500

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header.split(" ", 1)[1].strip()
    try:
        uresp = client.auth.get_user(token)
        user_obj = getattr(uresp, "user", None) or getattr(uresp, "data", None) or {}
        user_id = getattr(user_obj, "id", None) or (user_obj.get("id") if isinstance(user_obj, dict) else None)
    except Exception as e:
        logger.warning(f"Failed to resolve user from token in analytics: {e}")
        user_id = None

    if not user_id:
        return jsonify({"error": "Invalid token"}), 401

    try:
        # Fetch all shares for this user
        resp = client.table("shares").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        data = getattr(resp, "data", []) if resp is not None else []
        
        # Calculate analytics
        total_shares = len(data)
        total_views = sum(int(row.get("view_count", 0)) for row in data)
        
        # Content type distribution
        content_types = {}
        for row in data:
            ct = row.get("content_type", "unknown")
            content_types[ct] = content_types.get(ct, 0) + 1
        
        # Views over time (last 30 days)
        from datetime import datetime, timedelta
        
        views_by_date = {}
        now = datetime.utcnow()
        for i in range(30):
            date = (now - timedelta(days=i)).strftime("%Y-%m-%d")
            views_by_date[date] = 0
        
        # Top shares by views
        top_shares = sorted(data, key=lambda x: int(x.get("view_count", 0)), reverse=True)[:5]
        top_shares_data = [
            {
                "code": share.get("code"),
                "views": int(share.get("view_count", 0)),
                "type": share.get("content_type"),
                "name": share.get("file_name") or "Text Share"
            }
            for share in top_shares
        ]
        
        # Recent shares (last 7 days)
        seven_days_ago = now - timedelta(days=7)
        recent_count = sum(
            1 for row in data 
            if datetime.fromisoformat(row.get("created_at", "").replace("Z", "+00:00")) > seven_days_ago
        ) if data else 0
        
        return jsonify({
            "total_shares": total_shares,
            "total_views": total_views,
            "avg_views": round(total_views / total_shares, 2) if total_shares > 0 else 0,
            "recent_shares": recent_count,
            "content_types": content_types,
            "views_by_date": views_by_date,
            "top_shares": top_shares_data
        }), 200
    except Exception as e:
        logger.error(f"Failed to fetch analytics: {e}")
        return jsonify({"error": f"Failed to fetch analytics: {e}"}), 500


@application.route("/api/me/activity", methods=["GET"])
def get_my_activity():
    """Return activity feed for the authenticated user."""
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": err or "Failed to create Supabase client"}), 500

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header.split(" ", 1)[1].strip()
    try:
        uresp = client.auth.get_user(token)
        user_obj = getattr(uresp, "user", None) or getattr(uresp, "data", None) or {}
        user_id = getattr(user_obj, "id", None) or (user_obj.get("id") if isinstance(user_obj, dict) else None)
    except Exception as e:
        logger.warning(f"Failed to resolve user from token in activity: {e}")
        user_id = None

    if not user_id:
        return jsonify({"error": "Invalid token"}), 401

    try:
        # Fetch recent shares
        resp = client.table("shares").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(20).execute()
        data = getattr(resp, "data", []) if resp is not None else []
        
        # Build activity feed
        activities = []
        for share in data:
            # Share creation activity
            activities.append({
                "type": "share_created",
                "action": "Created share",
                "item": share.get("file_name") or share.get("code", "Unknown"),
                "code": share.get("code"),
                "timestamp": share.get("created_at"),
                "icon": "📤"
            })
            
            # If share has views, add view activity
            view_count = int(share.get("view_count", 0))
            if view_count > 0:
                activities.append({
                    "type": "share_viewed",
                    "action": f"Share viewed ({view_count} times)",
                    "item": share.get("file_name") or share.get("code", "Unknown"),
                    "code": share.get("code"),
                    "timestamp": share.get("updated_at") or share.get("created_at"),
                    "icon": "👁️"
                })
        
        # Sort by timestamp (most recent first)
        activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        return jsonify({"activities": activities[:20]}), 200
    except Exception as e:
        logger.error(f"Failed to fetch activity: {e}")
        return jsonify({"error": f"Failed to fetch activity: {e}"}), 500
