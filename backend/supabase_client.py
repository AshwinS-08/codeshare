import os
import time
import socket
from urllib.parse import urlparse
from typing import Any, Dict, Optional, Tuple


def _get_env() -> Dict[str, Optional[str]]:
    """Gather Supabase environment variables and classify key type.

    Returns:
        dict with keys: url, key, key_type (service|anon|unknown|none)
    """
    url = os.getenv("SUPABASE_URL")
    # Prefer service role, then service alias, then generic key, then anon
    def _norm(v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        # Ignore common placeholder values
        if v.strip().lower() in {"your-key-or-anon-key", "changeme", "<set-me>"}:
            return None
        return v.strip()

    key = _norm(
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_SERVICE_KEY")
        or os.getenv("SUPABASE_KEY")
        or os.getenv("SUPABASE_ANON_KEY")
    )

    key_type = "none"
    if key:
        if _norm(os.getenv("SUPABASE_SERVICE_ROLE_KEY")) == key or _norm(os.getenv("SUPABASE_SERVICE_KEY")) == key:
            key_type = "service"
        elif os.getenv("SUPABASE_ANON_KEY") == key:
            key_type = "anon"
        else:
            key_type = "unknown"

    return {"url": url, "key": key, "key_type": key_type}


def create_client() -> Tuple[Optional[Any], Optional[str]]:
    """Create a Supabase client using environment variables.

    Returns:
        (client, error) where only one is non-None.
    """
    env = _get_env()
    url = env["url"]
    key = env["key"]
    if not url or not key:
        return None, "Missing SUPABASE_URL or key (SUPABASE_SERVICE_ROLE_KEY/SUPABASE_KEY/SUPABASE_ANON_KEY)"

    try:
        # Import lazily so the app can run even if package isn't installed in some contexts
        from supabase import create_client as _create_client  # type: ignore

        client = _create_client(url, key)
        return client, None
    except Exception as e:  # pragma: no cover - defensive
        return None, f"Failed to create Supabase client: {e}"


def auth_health(url: Optional[str], timeout: float = 3.0) -> Dict[str, Any]:
    """Call the GoTrue health endpoint on Supabase.

    On hosted Supabase, the auth endpoint typically expects an `apikey` (and often
    also accepts `Authorization: Bearer <key>`). We include these headers when a key
    is configured to avoid 401s, while still working if no key is set.
    Returns dict with ok, status, latency_ms, error.
    """
    result: Dict[str, Any] = {"ok": False, "status": None, "latency_ms": None, "error": None}
    if not url:
        result["error"] = "SUPABASE_URL not set"
        return result

    health_url = url.rstrip("/") + "/auth/v1/health"
    parsed = urlparse(url)
    result["host"] = parsed.netloc

    # Use stdlib to avoid extra deps
    import urllib.request
    import urllib.error

    start = time.perf_counter()
    try:
        # Include apikey and Authorization headers when available to pass Supabase gateway
        env = _get_env()
        headers = {
            "Accept": "application/json",
            "User-Agent": "api-app/health-check",
        }
        if env.get("key"):
            api_key = env["key"] or ""
            headers["apikey"] = api_key
            headers["Authorization"] = f"Bearer {api_key}"

        req = urllib.request.Request(health_url, headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status = resp.getcode()
            result["status"] = status
            result["ok"] = 200 <= status < 300
    except urllib.error.HTTPError as he:  # pragma: no cover - relies on network
        result["status"] = he.code
        result["error"] = f"HTTPError: {he}"
    except Exception as e:  # pragma: no cover - relies on network
        # Improve messaging for DNS issues
        if isinstance(e, urllib.error.URLError) and isinstance(getattr(e, 'reason', None), socket.gaierror):
            result["error"] = f"DNS resolution failed for host '{parsed.netloc}': {e.reason}"
        elif isinstance(e, socket.gaierror):
            result["error"] = f"DNS resolution failed for host '{parsed.netloc}': {e}"
        else:
            result["error"] = str(e)
    finally:
        result["latency_ms"] = round((time.perf_counter() - start) * 1000)

    return result


def try_list_buckets(client: Any, timeout: float = 5.0) -> Tuple[Optional[int], Optional[str]]:
    """Attempt a privileged call (list storage buckets) when a service key is provided.

    Returns:
        (count, error): count may be None if call failed or key lacks permission.
    """
    if client is None:
        return None, "Client is None"

    try:
        # The SDK uses httpx underneath; set a short timeout via environment if supported.
        # There is no direct timeout parameter for list_buckets, so rely on default.
        buckets = client.storage.list_buckets()
        return len(buckets or []), None
    except Exception as e:
        return None, str(e)


def connection_report() -> Dict[str, Any]:
    """Produce a structured connection report for diagnostics and health endpoint."""
    env = _get_env()
    url, key, key_type = env["url"], env["key"], env["key_type"]
    client, client_error = create_client() if (url and key) else (None, None)

    auth = auth_health(url)

    buckets_info: Dict[str, Any] = {"attempted": False, "count": None, "error": None}
    if key_type == "service" and client is not None:
        buckets_info["attempted"] = True
        count, err = try_list_buckets(client)
        buckets_info["count"] = count
        buckets_info["error"] = err

    return {
        "configured": bool(url and key),
        "url_present": bool(url),
        "key_present": bool(key),
        "key_type": key_type,
        "client_created": client is not None and client_error is None,
        "client_error": client_error,
        "auth": auth,
        "storage_buckets": buckets_info,
    }


def _extract_response_data(resp: Any) -> Tuple[Optional[Any], Optional[str]]:
    """Handle differences in SDK response shapes to consistently return (data, error)."""
    if resp is None:
        return None, "Empty response"
    # supabase-py v2: response has .data and .error (error may be None)
    data = getattr(resp, "data", None)
    error = getattr(resp, "error", None)
    if data is not None or error is not None:
        return data, str(error) if error else None
    # Sometimes execute() returns a dict-like
    if isinstance(resp, dict):
        return resp.get("data"), resp.get("error")
    return None, "Unknown response format"


def fetch_table_rows(client: Any, table: str, limit: int = 100) -> Tuple[Optional[Any], Optional[str]]:
    """Fetch rows from a table using Supabase client.

    Returns (data, error).
    """
    if client is None:
        return None, "Client is None"
    try:
        resp = client.table(table).select("*").limit(limit).execute()
        return _extract_response_data(resp)
    except Exception as e:
        # Normalize DNS error messaging if bubbled up from httpx/requests
        if isinstance(e, socket.gaierror):
            return None, f"DNS resolution failed: {e}"
        return None, str(e)


def list_bucket_objects(client: Any, bucket: str, path: str = "", limit: Optional[int] = None) -> Tuple[Optional[Any], Optional[str]]:
    """List objects in a storage bucket.

    Note: Options support varies by SDK version. We call with minimal args for compatibility.
    Returns (objects, error).
    """
    if client is None:
        return None, "Client is None"
    try:
        storage = client.storage.from_(bucket)
        # Minimal call; some versions accept path and options. Fallback to simplest usage.
        objects = storage.list(path) if path is not None else storage.list()
        # Optionally truncate client-side if a limit is provided and list returns a Python list
        if isinstance(objects, list) and isinstance(limit, int):
            objects = objects[:limit]
        return objects, None
    except Exception as e:
        if isinstance(e, socket.gaierror):
            return None, f"DNS resolution failed: {e}"
        return None, str(e)


def rpc_get_share_by_code(client: Any, code: str) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    """Call the RPC function get_share_by_code to retrieve a share row.

    Returns (row, error).
    """
    if client is None:
        return None, "Client is None"
    try:
        # First attempt: parameter named `_code`
        for param_name in ("_code", "code"):
            try:
                resp = client.rpc("get_share_by_code", {param_name: code.upper()}).execute()
            except Exception as inner:
                # Try next param name on failure
                last_err = str(inner)
                continue
            # Depending on RPC, data may be a single object or list
            data = getattr(resp, "data", None)
            if isinstance(data, list):
                data = data[0] if data else None
            # Some RPCs return a typed record with all fields set to null when not found
            if isinstance(data, dict) and data and all(v is None for v in data.values()):
                data = None
            if data:
                return data, None
        # If we reach here, no data via RPC
        return None, None
    except Exception as e:
        return None, str(e)
