import sys
from pathlib import Path

# Ensure backend root is in sys.path when invoked inside Netlify Functions environment
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from mangum import Mangum
from app.main import app, bootstrap_data
from app.database import init_db

# Initialize database schema/tables on cold start
try:
    init_db()
except Exception as e:
    print(f"Serverless init notice: {e}")

mangum_handler = Mangum(app, lifespan="off")


def _normalize_path(path_str: str) -> str:
    if path_str.startswith("/.netlify/functions/api"):
        cleaned = path_str.replace("/.netlify/functions/api", "", 1)
        return cleaned if cleaned else "/"
    return path_str


def handler(event, context):
    """Netlify handler wrapping FastAPI with path prefix normalization."""
    if isinstance(event, dict):
        if "path" in event and isinstance(event["path"], str):
            event["path"] = _normalize_path(event["path"])
        if "rawPath" in event and isinstance(event["rawPath"], str):
            event["rawPath"] = _normalize_path(event["rawPath"])
        if "requestContext" in event and isinstance(event["requestContext"], dict):
            req_ctx = event["requestContext"]
            if "path" in req_ctx and isinstance(req_ctx["path"], str):
                req_ctx["path"] = _normalize_path(req_ctx["path"])
            if "http" in req_ctx and isinstance(req_ctx["http"], dict):
                if "path" in req_ctx["http"] and isinstance(req_ctx["http"]["path"], str):
                    req_ctx["http"]["path"] = _normalize_path(req_ctx["http"]["path"])

    return mangum_handler(event, context)


