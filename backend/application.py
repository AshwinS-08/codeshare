import os
import time
import logging
from flask import Flask, jsonify, request, Response, make_response
from flask_cors import CORS
try:
    from flasgger import Swagger
except Exception:  # pragma: no cover - optional import for docs
    Swagger = None  # type: ignore

from config import Config
from supabase_client import connection_report, create_client, rpc_get_share_by_code


# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)


# Flask app expected by Elastic Beanstalk
application = Flask(__name__)
application.config.from_object(Config)

# CORS: explicitly allow common dev origins (including port 8080 and 8081)
_origins = set(application.config.get("CORS_ORIGINS", []))
_origins.update({
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
})

# Initialize CORS with per-route configuration
cors = CORS()
cors.init_app(application, resources={
    r"/api/*": {
        "origins": list(_origins),
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Content-Length", "Authorization"],
        "max_age": 600  # Cache preflight response for 10 minutes
    }
})

@application.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

# Swagger UI at /docs (optional)
if Swagger is not None:
    # Basic template metadata
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "API App",
            "description": "Simple sharing API",
            "version": "1.0.0",
        },
        "basePath": "/",
        "schemes": ["http", "https"],
    }
    # Complete config including required 'specs'
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec_1",
                "route": "/apispec_1.json",
                "rule_filter": lambda rule: True,  # include all routes
                "model_filter": lambda tag: True,  # include all models
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/docs/",
    }
    # Optional UI version
    application.config["SWAGGER"] = {"title": "API App", "uiversion": 3}
    Swagger(application, config=swagger_config, template=swagger_template)

@application.route("/")
def Hello():
    return jsonify({"message": "Hello"}), 200

@application.route("/ping")
def ping():
    return jsonify({"message": "pong"}), 200


@application.route("/health")
def health():
    return jsonify({"status": "healthy"}), 200


@application.route("/supabase/health")
def supabase_health():
    report = connection_report()
    ok = bool(report.get("auth", {}).get("ok")) and (
        (not report.get("configured")) or report.get("client_created")
    )
    report["status"] = "ok" if ok else "degraded"
    return jsonify(report), 200


@application.route("/api/auth/login", methods=["POST"])
def auth_login():
    """Login with email and password."""
    body = request.get_json() or {}
    email = body.get("email")
    password = body.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": err or "Failed to create Supabase client"}), 500
        
    try:
        resp = client.auth.sign_in_with_password({"email": email, "password": password})
        session = getattr(resp, "session", None)
        user = getattr(resp, "user", None)
        
        if not session:
            return jsonify({"error": "Login failed"}), 401
            
        return jsonify({
            "access_token": getattr(session, "access_token", None),
            "refresh_token": getattr(session, "refresh_token", None),
            "user": {
                "id": getattr(user, "id", None),
                "email": getattr(user, "email", None)
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401


@application.route("/api/auth/signup", methods=["POST"])
def auth_signup():
    """Signup with email and password."""
    body = request.get_json() or {}
    email = body.get("email")
    password = body.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": err or "Failed to create Supabase client"}), 500
        
    try:
        resp = client.auth.sign_up({"email": email, "password": password})
        user = getattr(resp, "user", None)
        
        if not user:
            return jsonify({"error": "Signup failed"}), 400
            
        # Note: If email confirmation is enabled, session might be None
        session = getattr(resp, "session", None)
        
        return jsonify({
            "access_token": getattr(session, "access_token", None) if session else None,
            "refresh_token": getattr(session, "refresh_token", None) if session else None,
            "user": {
                "id": getattr(user, "id", None),
                "email": getattr(user, "email", None)
            },
            "message": "Signup successful. Please check your email for confirmation." if not session else "Signup successful"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@application.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    """Logout (invalidate session)."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"message": "Logged out"}), 200
        
    token = auth_header.split(" ", 1)[1].strip()
    
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": err or "Failed to create Supabase client"}), 500
        
    try:
        client.auth.sign_out(token)
    except Exception:
        pass
        
    return jsonify({"message": "Logged out"}), 200


@application.route("/api/auth/user", methods=["GET"])
def auth_user():
    """Get current user details."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing token"}), 401
        
    token = auth_header.split(" ", 1)[1].strip()
    
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": err or "Failed to create Supabase client"}), 500
        
    try:
        uresp = client.auth.get_user(token)
        user_obj = getattr(uresp, "user", None) or getattr(uresp, "data", None)
        
        if not user_obj:
            return jsonify({"error": "Invalid token"}), 401
            
        user_id = getattr(user_obj, "id", None) or (user_obj.get("id") if isinstance(user_obj, dict) else None)
        email = getattr(user_obj, "email", None) or (user_obj.get("email") if isinstance(user_obj, dict) else None)
        
        return jsonify({
            "user": {
                "id": user_id,
                "email": email
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401


def _generate_code(length: int = 6) -> str:
    import random, string
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(length))


@application.route("/api/shares", methods=["POST"]) 
def create_share():
    """Create a new share.

        ---
        consumes:
            - multipart/form-data
            - application/json
        parameters:
            - in: formData
                name: file
                type: file
                required: false
                description: Optional file to upload
            - in: formData
                name: text
                type: string
                required: false
                description: Optional text content
            - in: body
                name: body
                schema:
                    type: object
                    properties:
                        text:
                            type: string
        responses:
            201:
                description: Share created
            400:
                description: Bad request
            401:
                description: Unauthorized
            403:
                description: Forbidden by RLS
            500:
                description: Server error

    Accepts multipart/form-data:
      - file: optional file
      - text: optional text content
    Or JSON body with { text: string }
    """
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": err or "Failed to create Supabase client"}), 500

    # Try to resolve authenticated user from Authorization header (Supabase JWT)
    auth_header = request.headers.get("Authorization", "")
    user_id = None
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        try:
            # supabase-py v2 exposes auth.get_user(jwt)
            uresp = client.auth.get_user(token)  # type: ignore[attr-defined]
            user_obj = getattr(uresp, "user", None) or getattr(uresp, "data", None) or {}
            user_id = getattr(user_obj, "id", None) or (user_obj.get("id") if isinstance(user_obj, dict) else None)
        except Exception as e:
            logger.warning(f"Failed to resolve user from token: {e}")

    code = None
    text_content = None
    file_info = {"url": None, "name": None, "size": None, "path": None, "bucket": None}
    had_file = False

    if request.content_type and request.content_type.startswith("multipart/form-data"):
        code = request.form.get("code") or _generate_code()
        text_content = (request.form.get("text") or "").strip() or None
        uploaded = request.files.get("file")
        if uploaded and (uploaded.filename or uploaded.content_length):
            had_file = True
            # Validate file size
            uploaded.seek(0, os.SEEK_END)
            size = uploaded.tell()
            uploaded.seek(0)
            if size > application.config.get("MAX_FILE_SIZE", 10 * 1024 * 1024):
                return jsonify({"error": "File too large"}), 400

            # Build path and upload
            name = uploaded.filename or f"upload-{int(time.time())}"
            ext = (name.rsplit('.', 1)[-1] if '.' in name else 'bin')
            path = f"{code}-{int(time.time())}.{ext}"
            bucket = "shared-files"
            try:
                storage = client.storage.from_(bucket)
                up_resp = storage.upload(path, uploaded.read())
                # Check for error in response if dict-like
                if isinstance(up_resp, dict) and up_resp.get("error"):
                    return jsonify({"error": f"Upload failed: {up_resp.get('error')}"}), 500

                # Try to get public URL
                pub = storage.get_public_url(path)
                public_url = None
                # Normalize response shapes: dict with data.public_url/publicUrl or attributes
                if isinstance(pub, dict):
                    data_obj = pub.get("data") or pub
                    public_url = (
                        data_obj.get("publicUrl")
                        or data_obj.get("public_url")
                        or data_obj.get("signedUrl")
                        or data_obj.get("signed_url")
                    )
                else:
                    data_obj = getattr(pub, "data", None) or {}
                    public_url = (
                        (data_obj.get("publicUrl") if isinstance(data_obj, dict) else None)
                        or (data_obj.get("public_url") if isinstance(data_obj, dict) else None)
                        or (data_obj.get("signedUrl") if isinstance(data_obj, dict) else None)
                        or (data_obj.get("signed_url") if isinstance(data_obj, dict) else None)
                    )

                # Fallback to signed URL if no public URL is available (e.g., private bucket)
                if not public_url:
                    try:
                        signed = storage.create_signed_url(path, 24 * 3600)
                        if isinstance(signed, dict):
                            sdata = signed.get("data") or signed
                            public_url = sdata.get("signedUrl") or sdata.get("signed_url")
                        else:
                            sdata = getattr(signed, "data", None) or {}
                            if isinstance(sdata, dict):
                                public_url = sdata.get("signedUrl") or sdata.get("signed_url")
                    except Exception as e:
                        logger.warning(f"Failed to create signed URL: {e}")

                # If we still don't have a URL, we'll use our backend proxy with the storage path
                if not public_url:
                    logger.warning(f"No public URL available for {path}, will use backend proxy")
                    # Store the path for backend proxy access
                    public_url = f"proxy:{bucket}/{path}"

                file_info = {"url": public_url, "name": name, "size": size, "path": path, "bucket": bucket}
            except Exception as e:
                return jsonify({"error": f"Upload failed: {e}"}), 500
    else:
        body = request.get_json(silent=True) or {}
        code = body.get("code") or _generate_code()
        text_content = (body.get("text") or "").strip() or None

    # Mark as file when a file was provided, regardless of URL visibility
    content_type = "file" if had_file else "text"

    # Insert into shares table
    try:
        payload = {
            "code": code,
            "content_type": content_type,
            "text_content": text_content,
            "file_name": file_info["name"],
            "file_size": file_info["size"],
            "file_url": file_info["url"],
        }
        if user_id:
            payload["user_id"] = user_id
        resp = client.table("shares").insert(payload).execute()
        data = getattr(resp, "data", None) if resp is not None else None
    except Exception as e:
        msg = str(e)
        if "row level security" in msg.lower() or "42501" in msg:
            return jsonify({"error": "Insert blocked by RLS; ensure service role key is used on the backend and policies permit insert."}), 403
        if "401" in msg or "unauthorized" in msg.lower():
            return jsonify({"error": "Unauthorized to insert; check SUPABASE_SERVICE_ROLE_KEY is set and valid."}), 401
        return jsonify({"error": f"Failed to create share: {msg}"}), 500

    return jsonify({
        "code": code,
        "content_type": content_type,
        "text_content": text_content,
        "file_url": file_info["url"],
        "file_name": file_info["name"],
        "file_size": file_info["size"],
        "row": data,
        "status": "ok",
    }), 201


@application.route("/api/shares/<code>", methods=["GET"])
def get_share(code: str):
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": err or "Failed to create Supabase client"}), 500
    try:
        # Prefer calling the RPC to respect business logic (expiry/views) if defined
        row, rpc_err = rpc_get_share_by_code(client, code)
        if rpc_err:
            # Fallback to direct select if RPC not available or errored
            resp = client.table("shares").select("*").eq("code", code.upper()).limit(1).execute()
            data = getattr(resp, "data", []) if resp is not None else []
            if not data:
                return jsonify({"error": "Not found"}), 404
            return jsonify(data[0]), 200
        # If RPC succeeded but returned no row (including all-null), treat as not found/expired
        if not row:
            return jsonify({"error": "Not found"}), 404
        return jsonify(row), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@application.route("/api/me/stats", methods=["GET"])
def get_my_stats():
    """Return basic stats for the authenticated user: total shares and total views."""
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": err or "Failed to create Supabase client"}), 500

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header.split(" ", 1)[1].strip()
    try:
        uresp = client.auth.get_user(token)  # type: ignore[attr-defined]
        user_obj = getattr(uresp, "user", None) or getattr(uresp, "data", None) or {}
        user_id = getattr(user_obj, "id", None) or (user_obj.get("id") if isinstance(user_obj, dict) else None)
    except Exception as e:
        logger.warning(f"Failed to resolve user from token in stats: {e}")
        user_id = None

    if not user_id:
        return jsonify({"error": "Invalid token"}), 401

    try:
        # Fetch all shares for this user and aggregate views client-side for simplicity
        resp = client.table("shares").select("view_count", count="exact").eq("user_id", user_id).execute()
        data = getattr(resp, "data", []) if resp is not None else []
        total_shares = len(data)
        total_views = 0
        if isinstance(data, list):
            for row in data:
                try:
                    total_views += int(row.get("view_count", 0))
                except Exception:
                    continue
        return jsonify({"total_shares": total_shares, "total_views": total_views}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch stats: {e}"}), 500


@application.route("/api/me/shares", methods=["GET"])
def get_my_shares():
    """Return the list of shares for the authenticated user (primarily file uploads)."""
    client, err = create_client()
    if err or client is None:
        return jsonify({"error": err or "Failed to create Supabase client"}), 500

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header.split(" ", 1)[1].strip()
    try:
        uresp = client.auth.get_user(token)  # type: ignore[attr-defined]
        user_obj = getattr(uresp, "user", None) or getattr(uresp, "data", None) or {}
        user_id = getattr(user_obj, "id", None) or (user_obj.get("id") if isinstance(user_obj, dict) else None)
    except Exception as e:
        logger.warning(f"Failed to resolve user from token in shares: {e}")
        user_id = None

    if not user_id:
        return jsonify({"error": "Invalid token"}), 401

    try:
        resp = (
            client
            .table("shares")
            .select("code, content_type, file_name, file_size, file_url, created_at, view_count")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        data = getattr(resp, "data", []) if resp is not None else []
        return jsonify({"shares": data}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch shares: {e}"}), 500


@application.route("/api/files/fetch", methods=["GET"])
def fetch_file():
    """Fetch a file via backend to avoid exposing Supabase directly.

    Query params:
      - url: the public URL to fetch (must match configured SUPABASE_URL host)
             OR proxy:bucket/path format for backend storage access
    """
    file_url = request.args.get("url")
    if not file_url:
        return jsonify({"error": "Missing url"}), 400

    # Handle proxy URLs for private storage access
    if file_url.startswith("proxy:"):
        try:
            # Extract bucket and path from proxy:bucket/path format
            proxy_part = file_url[6:]  # Remove "proxy:" prefix
            bucket, path = proxy_part.split("/", 1)
            
            client, err = create_client()
            if err or client is None:
                return jsonify({"error": err or "Failed to create Supabase client"}), 500
            
            storage = client.storage.from_(bucket)
            
            # Try to get a fresh signed URL first
            try:
                signed = storage.create_signed_url(path, 3600)  # 1 hour
                if isinstance(signed, dict):
                    sdata = signed.get("data") or signed
                    signed_url = sdata.get("signedUrl") or sdata.get("signed_url")
                    if signed_url:
                        # Redirect to the signed URL or fetch it
                        import urllib.request
                        req = urllib.request.Request(signed_url, headers={"User-Agent": "api-app/file-fetch"})
                        with urllib.request.urlopen(req, timeout=10) as resp:
                            data = resp.read()
                            content_type = resp.headers.get("Content-Type", "application/octet-stream")
                            cd = resp.headers.get("Content-Disposition")
                            headers = {}
                            if cd:
                                headers["Content-Disposition"] = cd
                            return Response(data, headers=headers, content_type=content_type, status=200)
            except Exception as e:
                logger.warning(f"Failed to access file via signed URL: {e}")
            
            # If signed URL fails, try direct download (requires service role)
            try:
                download_resp = storage.download(path)
                if isinstance(download_resp, bytes):
                    return Response(download_resp, content_type="application/octet-stream", status=200)
                elif isinstance(download_resp, dict) and download_resp.get("data"):
                    return Response(download_resp["data"], content_type="application/octet-stream", status=200)
            except Exception as e:
                logger.error(f"Failed to download file directly: {e}")
                return jsonify({"error": f"File access failed: {e}"}), 502
            
        except Exception as e:
            logger.error(f"Error handling proxy URL: {e}")
            return jsonify({"error": f"Proxy access failed: {e}"}), 502

    # Handle regular public URLs
    from urllib.parse import urlparse
    import urllib.request

    try:
        allowed_host = urlparse(application.config.get("SUPABASE_URL", "")).netloc
        parsed = urlparse(file_url)
        if not allowed_host or parsed.netloc != allowed_host:
            return jsonify({"error": "Invalid file host"}), 400

        req = urllib.request.Request(file_url, headers={"User-Agent": "api-app/file-fetch"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            content_type = resp.headers.get("Content-Type", "application/octet-stream")
            cd = resp.headers.get("Content-Disposition")
            headers = {}
            if cd:
                headers["Content-Disposition"] = cd
            return Response(data, headers=headers, content_type=content_type, status=200)
    except Exception as e:
        return jsonify({"error": f"Fetch failed: {e}"}), 502


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    logger.info(f"Starting application on port {port} debug={debug}")
    application.run(host="0.0.0.0", port=port, debug=debug)